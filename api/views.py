from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import UploadedFile, Pipeline
from .serializers import UploadedFileSerializer, PipelineSerializer
from .engine import apply_transform, load_file_data, _PROFILER_STATS
import os
import pandas as pd
import json
import uuid

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class FileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all().order_by('-uploaded_at')
    serializer_class = UploadedFileSerializer

    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance = UploadedFile.objects.create(
            original_name=file_obj.name,
            file=file_obj,
            size=file_obj.size
        )
        
        try:
            df = load_file_data(instance.file.path)
            # Clean for JSON: Replace NaN with None
            if df is not None:
                df = df.where(pd.notnull(df), None)
                preview = df.head(100).to_dict(orient='records')
            else:
                preview = []
                
            return Response({
                'file': UploadedFileSerializer(instance).data,
                'preview': preview
            })
        except Exception as e:
            # If preview fails, still return the file as uploaded
            return Response({
                'file': UploadedFileSerializer(instance).data,
                'preview': [],
                'warning': f'Preview generation failed: {str(e)}'
            }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class PipelineViewSet(viewsets.ModelViewSet):
    queryset = Pipeline.objects.all().order_by('-updated_at')
    serializer_class = PipelineSerializer

    @action(detail=True, methods=['post'])
    def run(self, request, pk=None):
        pipeline = self.get_object()
        nodes = pipeline.nodes
        edges = pipeline.edges
        body_vars = request.data.get('variables', {})
        
        # Collect variables from parameter nodes
        node_vars = {}
        for n in nodes:
            if n.get('data', {}).get('type') == 'parameter':
                cfg = n.get('data', {}).get('config', {})
                if cfg.get('name'):
                    node_vars[cfg.get('name')] = cfg.get('value')
        
        variables = {**node_vars, **body_vars}
        
        node_results = {}
        execution_stats = {}
        logs = [f"Pipeline {pipeline.name} Execution Genesis."]
        
        processed_nodes = set()
        
        # Topo sort or simple iterative approach for DAG
        iterations = 0
        while len(processed_nodes) < len(nodes) and iterations < 50:
            iterations += 1
            for node in nodes:
                node_id = node.get('id')
                if node_id in processed_nodes:
                    continue
                
                # Check inputs
                input_edges = [e for e in edges if e.get('target') == node_id]
                all_inputs_ready = all(e.get('source') in node_results for e in input_edges)
                
                if all_inputs_ready:
                    import time
                    start_time = time.time()
                    
                    input_df = None
                    input_data_map = {}
                    
                    node_type = node.get('data', {}).get('type')
                    config = node.get('data', {}).get('config', {})
                    
                    if node_type == 'source':
                        file_id = config.get('fileId')
                        if file_id:
                            f_instance = get_object_or_404(UploadedFile, id=file_id)
                            input_df = load_file_data(f_instance.file.path)
                            logs.append(f"Source loaded: {node.get('data', {}).get('label')} ({len(input_df) if input_df is not None else 0} rows)")
                    else:
                        for e in input_edges:
                            src_id = e.get('source')
                            input_data_map[src_id] = node_results[src_id]
                            if input_df is None:
                                input_df = node_results[src_id].copy() if node_results[src_id] is not None else None
                    
                    result_df = apply_transform(input_df, node, input_data_map, variables)
                    node_results[node_id] = result_df
                    
                    execution_stats[node_id] = {
                        'duration': int((time.time() - start_time) * 1000),
                        'rowCount': len(result_df) if result_df is not None else 0,
                        'stats': _PROFILER_STATS.get(node_id)
                    }
                    processed_nodes.add(node_id)
        
        # Save sampled results to pipeline model
        sampled_results = {}
        for nid, df in node_results.items():
            if df is not None:
                # Use pandas to_json to handle complex types (like Timestamps) then load back to dict
                sampled_results[nid] = {
                    'data': json.loads(df.head(100).to_json(orient='records', date_format='iso')),
                    'rowCount': len(df)
                }
        
        pipeline.results = sampled_results
        pipeline.save()
        
        return Response({
            'status': 'success',
            'results': sampled_results,
            'logs': logs,
            'executionStats': execution_stats
        })

    @action(detail=True, methods=['get'])
    def sql(self, request, pk=None):
        pipeline = self.get_object()
        fmt = request.query_params.get('format', 'sql')
        
        from .codegen import generate_python_code, generate_sql_code
        if fmt == 'python':
            code = generate_python_code(pipeline)
        else:
            code = generate_sql_code(pipeline)
            
        return Response({'code': code})

@method_decorator(csrf_exempt, name='dispatch')
class DataExportView(views.APIView):
    def get(self, request, pipeline_id, node_id, format):
        pipeline = get_object_or_404(Pipeline, id=pipeline_id)
        
        # To export full data, we must re-run the relevant part of the pipeline
        # For simplicity in this version, we re-run the whole DAG up to the target node
        nodes = pipeline.nodes
        edges = pipeline.edges
        
        node_results = {}
        processed_nodes = set()
        iterations = 0
        
        while node_id not in node_results and iterations < 50:
            iterations += 1
            for node in nodes:
                nid = node.get('id')
                if nid in processed_nodes: continue
                
                input_edges = [e for e in edges if e.get('target') == nid]
                if all(e.get('source') in node_results for e in input_edges):
                    input_df = None
                    input_data_map = {}
                    config = node.get('data', {}).get('config', {})
                    
                    if node.get('data', {}).get('type') == 'source':
                        f_id = config.get('fileId')
                        if f_id:
                            f_inst = get_object_or_404(UploadedFile, id=f_id)
                            input_df = load_file_data(f_inst.file.path)
                    else:
                        for e in input_edges:
                            src = e.get('source')
                            input_data_map[src] = node_results[src]
                            if input_df is None:
                                input_df = node_results[src].copy() if node_results[src] is not None else None
                    
                    node_results[nid] = apply_transform(input_df, node, input_data_map)
                    processed_nodes.add(nid)

        df = node_results.get(node_id)
        if df is None:
            return Response({'error': 'Failed to process data for this node'}, status=status.HTTP_404_NOT_FOUND)
        filename = f"export_{uuid.uuid4().hex[:8]}"
        
        if format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            df.to_csv(path_or_buf=response, index=False)
            return response
        elif format == 'json':
            response = HttpResponse(df.to_json(orient='records'), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
            return response
        elif format == 'xlsx':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
            df.to_excel(response, index=False)
            return response
            
        return Response({'error': 'Unsupported format'}, status=status.HTTP_400_BAD_REQUEST)
