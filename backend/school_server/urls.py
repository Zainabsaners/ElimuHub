"""
URL configuration for school_server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
#from django.views.decorators.csrf import ensure_csrf_cookie
#from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

#@ensure_csrf_cookie
#def get_csrf_token(request):
   # return JsonResponse({'detail': 'CSRF cookie set'})
   
def api_root_view(request):
    return JsonResponse({
        'status': 'online',
        'message': 'Welcome to the School Server API',
        'documentation': "/ElimuHub/backend/school_server/docs/"
        })

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('', include('school_app.urls')),
    #path('api/csrf/', get_csrf_token, name='csrf'),
    
]

 #Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)