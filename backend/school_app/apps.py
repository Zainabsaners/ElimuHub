# school_app/apps.py
from django.apps import AppConfig

class SchoolAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'school_app'

    def ready(self):
        # This forces Django to execute our plugin registrations on startup
        try:
            import school_app.plugins
        except ImportError:
            pass