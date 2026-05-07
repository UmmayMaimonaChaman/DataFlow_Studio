from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PipelineViewSet, DataExportView, FileViewSet

router = DefaultRouter()
router.register(r'pipelines', PipelineViewSet, basename='pipeline')

router.register(r'files', FileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('export/<uuid:pipeline_id>/<str:node_id>/<str:format>/', DataExportView.as_view(), name='data-export'),
]
