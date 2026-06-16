# backend/school_app/management/commands/import_curriculum.py
import csv
from django.core.management.base import BaseCommand
from school_app.models import LearningArea, Strand, SubStrand, Competency

class Command(BaseCommand):
    help = 'Bulk import CBE curriculum from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the CSV file')

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # 1. Get or Create Learning Area
                area, _ = LearningArea.objects.get_or_create(
                    area_code=row['area_code'],
                    defaults={'area_name': row['area_name']}
                )
                
                # 2. Get or Create Strand
                strand, _ = Strand.objects.get_or_create(
                    strand_code=row['strand_code'],
                    learning_area=area,
                    defaults={'strand_name': row['strand_name']}
                )
                
                # 3. Get or Create SubStrand
                sub, _ = SubStrand.objects.get_or_create(
                    substrand_code=row['substrand_code'],
                    strand=strand,
                    defaults={'substrand_name': row['substrand_name']}
                )
                
                # 4. Create Competency
                Competency.objects.get_or_create(
                    competency_code=row['competency_code'],
                    substrand=sub,
                    defaults={'competency_statement': row['competency_statement']}
                )
                
                self.stdout.write(self.style.SUCCESS(f'Imported: {row["competency_code"]}'))

        self.stdout.write(self.style.SUCCESS('Curriculum import complete!'))