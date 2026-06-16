import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from school_app.models import AcademicYear, Term

class Command(BaseCommand):
    help = 'Pre-generates Kenyan academic years and terms for the next 20 years'

    def handle(self, *args, **kwargs):
        start_year = 2026
        end_year = 2046

        for year in range(start_year, end_year + 1):
            year_code = f"{year}-{year+1}"
            year_name = f"{year}/{year+1} Academic Year"
            
            # 1. Create or Get the Academic Year
            academic_year, created = AcademicYear.objects.get_or_create(
                year_code=year_code,
                defaults={
                    'year_name': year_name,
                    'start_date': datetime.date(year, 1, 1),
                    'end_date': datetime.date(year, 12, 31),
                    'is_current': (year == 2026) # Mark current year as active
                }
            )

            # Standard Kenyan Term Pattern
            terms_config = [
                {'term': 'Term 1', 'start': (1, 5), 'end': (4, 10)},
                {'term': 'Term 2', 'start': (5, 1), 'end': (8, 15)},
                {'term': 'Term 3', 'start': (9, 1), 'end': (11, 20)},
            ]

            for config in terms_config:
                term_name = config['term']
                start_date = datetime.date(year, *config['start'])
                end_date = datetime.date(year, *config['end'])

                # 2. Create the Terms linked to the Year
                Term.objects.get_or_create(
                    academic_year=academic_year,
                    term=term_name,
                    defaults={
                        'start_date': start_date,
                        'end_date': end_date,
                        'is_current': (year == 2026 and term_name == 'Term 1')
                    }
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully generated calendar from 2026 to {end_year}'))