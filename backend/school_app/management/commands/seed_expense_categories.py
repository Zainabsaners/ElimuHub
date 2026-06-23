# school_app/management/commands/seed_expense_categories.py

from django.core.management.base import BaseCommand
from school_app.models import ExpenseCategory

class Command(BaseCommand):
    help = 'Seed default expense categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Academic Supplies', 'description': 'Books, stationery, teaching materials', 'color': '#4F46E5'},
            {'name': 'Utilities', 'description': 'Electricity, water, internet', 'color': '#059669'},
            {'name': 'Sports & Activities', 'description': 'Sports equipment, events', 'color': '#D97706'},
            {'name': 'Staff Development', 'description': 'Training, workshops, seminars', 'color': '#7C3AED'},
            {'name': 'Building Maintenance', 'description': 'Repairs and upkeep', 'color': '#DC2626'},
            {'name': 'Equipment Maintenance', 'description': 'Lab equipment, computers', 'color': '#0891B2'},
            {'name': 'Grounds Maintenance', 'description': 'Gardening, landscaping', 'color': '#059669'},
            {'name': 'Vehicle Maintenance', 'description': 'School transport, repairs', 'color': '#D97706'},
            {'name': 'Security Maintenance', 'description': 'Security systems, personnel', 'color': '#4B5563'},
            {'name': 'Salaries', 'description': 'Staff salaries and wages', 'color': '#1F2937'},
            {'name': 'Rent', 'description': 'School premises rent', 'color': '#DC2626'},
            {'name': 'Security', 'description': 'Security services', 'color': '#4B5563'},
            {'name': 'Transport', 'description': 'School transport services', 'color': '#0891B2'},
            {'name': 'Food & Catering', 'description': 'School meals, events', 'color': '#D97706'},
            {'name': 'Technology', 'description': 'Software, hardware, IT services', 'color': '#7C3AED'},
            {'name': 'Other', 'description': 'Miscellaneous expenses', 'color': '#6B7280'},
        ]

        created = 0
        for cat_data in categories:
            cat, is_created = ExpenseCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'color': cat_data['color'],
                    'is_active': True
                }
            )
            if is_created:
                created += 1
                self.stdout.write(f"✅ Created: {cat.name}")
            else:
                self.stdout.write(f"⏭️ Already exists: {cat.name}")

        self.stdout.write(self.style.SUCCESS(f"\n✅ Successfully created {created} expense categories!"))