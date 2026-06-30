from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import FeeTransaction, StudentFeeInvoice

@receiver(post_save, sender=FeeTransaction)
def update_invoice_and_balance(sender, instance, created, **kwargs):
    if created and instance.status == 'Completed':
        # 1. Update the Invoice linked to this transaction
        invoice = instance.invoice
        if invoice:
            invoice.amount_paid += instance.amount_kes
            invoice.save() # This triggers the invoice's own save method to update balance_amount
            
            # 2. Student balance will automatically reflect 
            # if you use the @property method we discussed earlier.