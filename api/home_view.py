from django.http import HttpResponse

def home_view(request):
    return HttpResponse("""
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #059669;">🌌 DataFlow Studio Backend</h1>
            <p>The backend is running successfully.</p>
            <p>To view the application, please go to the frontend URL:</p>
            <a href="http://localhost:3000" style="display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Open DataFlow Studio
            </a>
            <p style="margin-top: 20px; color: #666; font-size: 0.8em;">made by CHAMAN</p>
        </div>
    """)
