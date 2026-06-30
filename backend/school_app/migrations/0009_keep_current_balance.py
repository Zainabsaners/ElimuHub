from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('school_app', '0008_paymentmethod_expense_payment_method_name_and_more'),
    ]

    operations = [
        # This migration intentionally does nothing.
        # current_balance already exists in the database.
        # It's here to prevent Django from trying to remove it.
    ]



