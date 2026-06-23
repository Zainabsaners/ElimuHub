# serializers.py
import re
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from django.utils import timezone
import ipaddress
from datetime import timedelta
from django.db.models import Count, Sum, Q, FloatField, F
from django.db.models.functions import Cast


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'phone',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'last_login', 'mfa_enabled'
        ]
        read_only_fields = ['date_joined', 'last_login']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email').strip().lower()
        password = data.get('password')
        print(email, password)
        
        # CHANGE THIS LINE:
        try:
            user = User.objects.get(email__iexact=email)  # Use __iexact instead of email=
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'Invalid user'})
        
        # Check if account is locked
        if user.locked_until and user.locked_until > timezone.now():
            raise serializers.ValidationError({
                'error': f'Account is locked until {user.locked_until.strftime("%Y-%m-%d %H:%M:%S")}. '
                        'Please try again later or contact administrator.'
            })
        
        # Authenticate user
        user_obj = authenticate(username=email, password=password)
        if not user_obj:
            # Increment failed attempts
            user.failed_attempts += 1
            if user.failed_attempts >= 5:
                user.locked_until = timezone.now() + timedelta(minutes=30)
            user.save()
            
            if user.failed_attempts >= 5:
                raise serializers.ValidationError({
                    'error': 'Account has been locked due to multiple failed attempts. '
                            'Please try again in 30 minutes or contact administrator.'
                })
            else:
                raise serializers.ValidationError({'password': 'Invalid email or password'})
        
        # Reset failed attempts on success
        if user_obj.failed_attempts > 0:
            user_obj.failed_attempts = 0
            user_obj.locked_until = None
            user_obj.save()
        
        # IP Whitelisting check
        request = self.context.get('request')
        if request:
            client_ip = request.META.get('REMOTE_ADDR')
            if not self.check_ip_whitelist(user_obj, client_ip):
                raise serializers.ValidationError(
                    'Access denied from this IP address. '
                    'Please contact administrator to whitelist your IP.'
                )
        
        data['user'] = user_obj
        return data
    
    def check_ip_whitelist(self, user, client_ip):
        whitelisted_ips = IPWhitelist.objects.filter(status='Active')
        active_ips = [ip for ip in whitelisted_ips if ip.is_active_now()]
        
        if not active_ips:  # Empty list check, not .exists()
            return True
        
        # Check user-specific IPs
        user_ips = active_ips  # Filter in memory since small list expected
        for ip_entry in user_ips:
            if ip_entry.user == user and self.is_ip_in_range(client_ip, ip_entry.ip_address):
                ip_entry.increment_access_count()
                return True
        
        # Check role-based (assuming allowed_roles is list field)
        role_ips = [ip for ip in active_ips if user.role in (ip_entry.allowed_roles or [])]
        for ip_entry in role_ips:
            if self.is_ip_in_range(client_ip, ip_entry.ip_address):
                ip_entry.increment_access_count()
                return True
        
        # Check general IPs
        general_ips = [ip for ip in active_ips if not ip.user and not (ip.allowed_roles or [])]
        for ip_entry in general_ips:
            if self.is_ip_in_range(client_ip, ip_entry.ip_address):
                ip_entry.increment_access_count()
                return True
        
        return False  # Deny if no match
    
    def is_ip_in_range(self, client_ip, whitelist_ip):
        try:
            if '/' in whitelist_ip:
                network = ipaddress.ip_network(whitelist_ip, strict=False)
                client = ipaddress.ip_address(client_ip)
                return client in network
            else:
                return client_ip == whitelist_ip
        except ValueError:
            return False


class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()

class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    refresh_token = serializers.CharField()
    session_id = serializers.UUIDField()
    user = UserSerializer()

class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        user = self.context['request'].user
        
        # Check old password
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError('Old password is incorrect')
        
        # Validate new password
        validate_password(data['new_password'], user)
        
        # Check password history (prevent reuse of last 5 passwords)
        password_history = PasswordHistory.objects.filter(
            user=user
        ).order_by('-changed_at')[:5]
        
        for history in password_history:
            if user.check_password(data['new_password']):
                raise serializers.ValidationError(
                    'Cannot reuse previous passwords. Please choose a new password.'
                )
        
        return data

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'department', 'phone', 'is_active'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Log password in history
        PasswordHistory.objects.create(
            user=user,
            password_hash=user.password,
            changed_by=self.context['request'].user if 'request' in self.context else user
        )
        
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'department',
            'phone', 'is_active', 'mfa_enabled'
        ]

class ProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'phone',
            'mfa_enabled', 'date_joined', 'last_login'
        ]
        read_only_fields = ['username', 'role', 'date_joined', 'last_login']

class IPWhitelistSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()
    created_by_display = serializers.SerializerMethodField()
    
    class Meta:
        model = IPWhitelist
        fields = [
            'id', 'ip_address', 'description', 'status', 'access_level',
            'user', 'user_display', 'allowed_roles',
            'allowed_days', 'time_start', 'time_end',
            'country', 'city', 'isp',
            'last_used', 'total_access_count', 'failed_attempts',
            'require_2fa', 'notify_on_access',
            'created_by', 'created_by_display', 'created_at', 'updated_at',
            'expires_at', 'is_active_now'
        ]
        read_only_fields = ['last_used', 'total_access_count', 'failed_attempts', 'created_at', 'updated_at']
    
    def get_user_display(self, obj):
        return obj.user.get_full_name() if obj.user else None
    
    def get_created_by_display(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def validate_ip_address(self, value):
        try:
            ipaddress.ip_address(value)
        except ValueError:
            try:
                ipaddress.ip_network(value)
            except ValueError:
                raise serializers.ValidationError('Invalid IP address or network')
        return value

class UserSessionSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'user_display', 'client_ip',
            'user_agent', 'device_fingerprint',
            'login_time', 'last_activity', 'expires_at',
            'revoked'
        ]
        read_only_fields = ['login_time', 'last_activity']
# Add this to your existing serializers.py file

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'recipient_type', 'recipient_id', 'priority',
            'status', 'action_url', 'related_table', 'related_id',
            'sent_by', 'sender_name', 'recipient_name',
            'sent_at', 'read_at', 'expires_at', 'time_ago'
        ]
        read_only_fields = ['sent_at', 'read_at']
    
    def get_sender_name(self, obj):
        return obj.sent_by.get_full_name() if obj.sent_by else 'System'
    
    def get_recipient_name(self, obj):
        if obj.recipient_type == 'User':
            try:
                user = User.objects.get(id=obj.recipient_id)
                return user.get_full_name()
            except User.DoesNotExist:
                return f'User {obj.recipient_id}'
        elif obj.recipient_type == 'Role':
            return f'{obj.recipient_id} Role'
        elif obj.recipient_type == 'Class':
            return f'Class {obj.recipient_id}'
        else:
            return 'All Users'
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        
        if obj.sent_at:
            return timesince(obj.sent_at, timezone.now()) + ' ago'
        return ''


class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_staff = serializers.IntegerField()
    total_parents = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    pending_invoices = serializers.IntegerField()
    today_attendance = serializers.IntegerField()
    recent_activities = serializers.ListField()

class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'department', 'phone',
            'date_joined', 'last_login', 'is_active'
        ]
        read_only_fields = fields

class MFAEnableSerializer(serializers.Serializer):
    enable = serializers.BooleanField(required=True)

class MFASetupSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

class MFAAuthSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    
class StreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stream
        fields = '__all__'
    
class ClassSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    class_teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_code', 'class_name', 'numeric_level',
            'stream', 'capacity', 'student_count', 'class_teacher',
            'class_teacher_name', 'is_active', 'created_at'
        ]
    
    def get_student_count(self, obj):
        return Student.objects.filter(current_class=obj).count()
    
    def get_class_teacher_name(self, obj):
        if obj.class_teacher:
            return f"{obj.class_teacher.first_name} {obj.class_teacher.last_name}"
        return None

class ClassCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = [
            'class_code', 'class_name', 'numeric_level',
            'stream', 'capacity', 'class_teacher', 'is_active'
        ]
        read_only_fields = ['created_by']
    
    def validate_class_code(self, value):
        if Class.objects.filter(class_code=value).exists():
            raise serializers.ValidationError('Class code already exists')
        return value

class ClassUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = [
            'class_code', 'class_name', 'numeric_level',
            'stream', 'capacity', 'class_teacher', 'is_active'
        ]

class ClassDetailSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    class_teacher_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_code', 'class_name', 'numeric_level',
            'stream', 'capacity', 'student_count', 'class_teacher',
            'class_teacher_details', 'is_active', 'created_at'
        ]
    
    def get_student_count(self, obj):
        return Student.objects.filter(current_class=obj).count()
    
    def get_class_teacher_details(self, obj):
        if obj.class_teacher:
            return {
                'id': obj.class_teacher.id,
                'name': f"{obj.class_teacher.first_name} {obj.class_teacher.last_name}",
                'email': obj.class_teacher.email,
                'phone': obj.class_teacher.phone
            }
        return None
# Add to your serializers.py
class StudentSerializer(serializers.ModelSerializer):
    current_class_name = serializers.SerializerMethodField()
    guardian_name = serializers.CharField(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'admission_no', 'first_name', 'middle_name', 'last_name',
            'full_name', 'date_of_birth', 'gender', 'nationality', 'religion',
            'blood_group', 'address', 'city', 'country', 'phone', 'email',
            'current_class', 'current_class_name', 'current_balance','stream',
            'roll_number', 'admission_date', 'admission_type', 'status',
            'father_name', 'father_phone', 'father_email', 'father_occupation',
            'mother_name', 'mother_phone', 'mother_email', 'mother_occupation',
            'guardian_name', 'guardian_relation', 'guardian_phone',
            'guardian_email', 'guardian_address', 'medical_conditions',
            'allergies', 'medication', 'emergency_contact',
            'emergency_contact_name', 'previous_school', 'previous_class',
            'transfer_certificate_no', 'expected_graduation_date', 'created_at'
        ]
        
    
    def get_current_class_name(self, obj):
        return obj.current_class.class_name if obj.current_class else None
    
    def get_full_name(self, obj):
        return obj.full_name


class StudentCreateSerializer(serializers.ModelSerializer):
    father_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    father_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    mother_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    mother_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    class Meta:
        model = Student
        fields = [
            'admission_no', 'first_name', 'middle_name', 'last_name',
            'date_of_birth', 'gender', 'nationality', 'religion',
            'blood_group', 'address', 'city', 'country', 'phone', 'email',
            'current_class', 'stream', 'roll_number',
            'admission_date', 'admission_type', 'status',
            'father_name', 'father_phone', 'father_email', 'father_occupation',
            'mother_name', 'mother_phone', 'mother_email', 'mother_occupation',
            'guardian_name', 'guardian_relation', 'guardian_phone',
            'guardian_email', 'guardian_address', 'medical_conditions',
            'allergies', 'medication', 'emergency_contact',
            'emergency_contact_name', 'previous_school', 'previous_class',
            'transfer_certificate_no', 'expected_graduation_date'
        ]
        read_only_fields = ['admission_no', 'created_by']
        extra_kwargs = {
            'guardian_name': {'required': True},
            'guardian_phone': {'required': True},
            'guardian_relation': {'required': True},
        }
    
    def validate_admission_no(self, value):
            import re
            if value and not re.match(r'^ADM-\d{6}-\d+$', value):
                raise serializers.ValidationError(
                    'Invalid admission number format. Must be ADM-YYYYMM-ID.'
                )
            return value
    
    def validate_phone(self, value):
        if value and not re.match(r'^\+?[0-9\s\-\(\)]+$', value):
            raise serializers.ValidationError('Invalid phone number format')
        return value


class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'first_name', 'middle_name', 'last_name', 'date_of_birth',
            'gender', 'nationality', 'religion', 'blood_group', 'address',
            'city', 'country', 'phone', 'email', 'current_class',
            'stream', 'roll_number', 'admission_type',
            'status', 'father_name', 'father_phone', 'father_email',
            'father_occupation', 'mother_name', 'mother_phone',
            'mother_email', 'mother_occupation', 'guardian_name',
            'guardian_relation', 'guardian_phone', 'guardian_email',
            'guardian_address', 'medical_conditions', 'allergies',
            'medication', 'emergency_contact', 'emergency_contact_name',
            'previous_school', 'previous_class', 'transfer_certificate_no',
            'expected_graduation_date'
        ]
        
#FEE MANAGEMENT SERIALIZERS ================================================


class FeeCategorySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = FeeCategory
        fields = [
            'id', 'category_code', 'category_name', 'description',
            'frequency', 'is_mandatory', 'is_active', 'gl_account_code',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

class ClassSerializer(serializers.ModelSerializer):
    class_teacher_name = serializers.CharField(source='class_teacher.get_full_name', read_only=True)
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_code', 'class_name', 'numeric_level',
            'stream', 'capacity', 'class_teacher', 'class_teacher_name',
            'is_active', 'created_at'
        ]

class FeeStructureSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_id.class_name', read_only=True)
    class_code = serializers.CharField(source='class_id.class_code', read_only=True)
    numeric_level = serializers.IntegerField(source='class_id.numeric_level', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    category_code = serializers.CharField(source='category.category_code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = FeeStructure
        fields = [
            'id', 'academic_year', 'term', 'class_id', 'class_name', 
            'class_code', 'numeric_level', 'category', 'category_name',
            'category_code', 'amount', 'due_date', 'late_fee_percentage',
            'late_fee_after_days', 'installment_allowed', 'max_installments',
            'discount_allowed', 'max_discount_percentage', 'is_active',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']

class FeeTransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    first_name = serializers.CharField(source='student.first_name', read_only=True)
    last_name = serializers.CharField(source='student.last_name', read_only=True)
    collected_by_name = serializers.CharField(source='collected_by.get_full_name', read_only=True)
    class_name = serializers.CharField(source='student.current_class.class_name', read_only=True)
    invoice_term = serializers.CharField(source='invoice.term', read_only=True)
    invoice_no = serializers.CharField(source='invoice.invoice_no', read_only=True)
    total_invoiced_amount = serializers.DecimalField(source='invoice.total_amount', max_digits=12, decimal_places=2, read_only=True)
    student_balance = serializers.DecimalField(source='student.current_balance', max_digits=12, decimal_places=2, read_only=True)
    term_total_paid = serializers.SerializerMethodField()
    
    
    class Meta:
        model = FeeTransaction
        fields = [
            'id', 'transaction_no', 'invoice', 'invoice_no', 'student', 'admission_no',
            'first_name', 'last_name', 'student_name', 'class_name', 'invoice_term', 'student_balance', 'payment_date',
            'payment_mode', 'payment_reference', 'bank_name', 'cheque_no','total_invoiced_amount','term_total_paid',
            'mobile_money_no', 'amount', 'currency', 'exchange_rate',
            'amount_kes', 'status', 'collected_by', 'collected_by_name',
            'verified_by', 'verified_at', 'reversal_reason', 'reversed_by',
            'reversed_at', 'receipt_printed', 'receipt_printed_at',
            'receipt_printed_by', 'created_at'
        ]
        read_only_fields = ['id', 'transaction_no', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.full_name
    
    def get_term_total_paid(self, obj):
        # Sum all completed transactions for this student within the same year and term
        return FeeTransaction.objects.filter(
            student=obj.student,
            invoice__academic_year=obj.invoice.academic_year,
            invoice__term=obj.invoice.term,
            status='Completed'
        ).aggregate(total=models.Sum('amount_kes'))['total'] or 0

class StatsSerializer(serializers.Serializer):
    count = serializers.IntegerField(default=0)
    active_count = serializers.IntegerField(default=0)
    
    class Meta:
        fields = ['count', 'active_count']

class CategoryStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField(default=0)
    active_count = serializers.IntegerField(default=0)
    mandatory_count = serializers.IntegerField(default=0)
    
    def to_representation(self, instance):
        return {
            'count': instance.get('total', 0),
            'active_count': instance.get('active_count', 0),
            'mandatory_count': instance.get('mandatory_count', 0)
        }

class StructureStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField(default=0)
    active_count = serializers.IntegerField(default=0)
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    def to_representation(self, instance):
        return {
            'total': instance.get('total', 0),
            'active_count': instance.get('active_count', 0),
            'total_amount': instance.get('total_amount', 0)
        }

class TransactionStatsSerializer(serializers.Serializer):
    total_transactions = serializers.IntegerField(default=0)
    completed_transactions = serializers.IntegerField(default=0)
    pending_transactions = serializers.IntegerField(default=0)
    total_collected = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    collection_rate = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    def to_representation(self, instance):
        total = instance.get('total_transactions', 0)
        completed = instance.get('completed_transactions', 0)
        total_collected = instance.get('total_collected', 0)
        
        collection_rate = 0
        if total > 0:
            collection_rate = (completed / total) * 100
        
        return {
            'total_transactions': total,
            'completed_transactions': completed,
            'pending_transactions': instance.get('pending_transactions', 0),
            'total_collected': total_collected,
            'collection_rate': round(collection_rate, 2)
        }
        
class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'description', 'icon', 'is_active', 'requires_reference']
        read_only_fields = ['created_at', 'updated_at']
class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_active', 'created_at']
        read_only_fields = ['created_at']

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'category', 'category_name', 'category_id',
            'amount', 'date', 'vendor', 'payment_method', 'description',
            'status', 'created_by', 'created_by_name', 'approved_by',
            'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'approved_by', 'approved_at', 'created_at', 'updated_at']

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'staff_id', 'full_name', 'designation', 'department', 'basic_salary', 'account_number', 'bank_name', 'status', 'created_at', 'updated_at']
    read_only_fields = ['id', 'created_at', 'updated_at']
class PayrollComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollComponent
        fields = '__all__'

class PayrollRecordSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source='staff.full_name')
    
    class Meta:
        model = PayrollRecord
        fields = '__all__'
        read_only_fields = ['gross_salary', 'total_deductions', 'net_salary']
        


class PayrollPeriodSerializer(serializers.ModelSerializer):
    records = PayrollRecordSerializer(many=True, read_only=True)
    employee_details = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = PayrollPeriod
        fields = '__all__'
        # These fields are required for the initial POST (create), 
        # but required=False allows them to be ignored during PATCH updates.
        extra_kwargs = {
            'period_code': {'required': False},
            'period_name': {'required': False},
            'start_date': {'required': False},
            'end_date': {'required': False},
            'pay_date': {'required': False},
        }

    def create(self, validated_data):
        details = validated_data.pop('employee_details', [])
        period = PayrollPeriod.objects.create(**validated_data)
        
        for detail in details:
            PayrollRecord.objects.create(
                payroll_period=period,
                staff_id=detail['employee_id'],
                basic_salary=detail.get('basic_salary', 0),
                allowances_total=detail.get('allowances', 0),
                overtime_total=detail.get('overtime', 0),
                bonus_total=detail.get('bonus', 0),
                total_deductions=detail.get('deductions', 0),
                net_salary=detail.get('net_salary', 0),
                gross_salary=detail.get('gross_salary', 0)
                # Ensure all other fields from your model are included here if necessary
            )
        return period
class CompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Competency
        fields = ['id', 'competency_code', 'competency_statement', 'performance_indicator', 'is_core_competency']

class SubStrandSerializer(serializers.ModelSerializer):
    competencies = CompetencySerializer(many=True, read_only=True)
    class Meta:
        model = SubStrand
        fields = ['id', 'substrand_code', 'substrand_name', 'competencies']

class StrandSerializer(serializers.ModelSerializer):
    substrands = SubStrandSerializer(many=True, read_only=True)
    class Meta:
        model = Strand
        fields = ['id', 'strand_code', 'strand_name', 'substrands']

class LearningAreaSerializer(serializers.ModelSerializer):
    strands = StrandSerializer(many=True, read_only=True)
    class Meta:
        model = LearningArea
        fields = ['id', 'area_code', 'area_name', 'strands']
class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'year_name','year_code', 'start_date', 'end_date', 'is_current']
        
class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'term', 'start_date', 'end_date', 'is_current']
        
class AssessmentWindowSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentWindow
        fields = ['id', 'term', 'weight_percentage','assessment_type',  'open_date', 'close_date', 'is_active']


class CBEReportCardSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    term_name = serializers.CharField(source='term.term', read_only=True)
    competency_ratings = serializers.JSONField(read_only=True)
    learning_area_performance = serializers.JSONField(read_only=True)
    values_assessment = serializers.JSONField(read_only=True)

    class Meta:
        model = CBEReportCard
        fields = '__all__'
        
class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'action_type', 'model_name', 'object_id', 'timestamp', 'ip_address', 'user_agent']
        read_only_fields = fields
