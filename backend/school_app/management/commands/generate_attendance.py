from django.core.management.base import BaseCommand
from school_app.services import generate_attendance_sessions

class Command(BaseCommand):
    help = 'Generate attendance sessions for the current term'

    def handle(self, *args, **options):
        result = generate_attendance_sessions()
        self.stdout.write(result)