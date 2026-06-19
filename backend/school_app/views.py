# views.py (authentication section)
from .registry import plugin_registry
from urllib import request
from django.http import HttpResponse, FileResponse
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import logout
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from django.db.models import Q, Avg, Count
import uuid
import logging
from rest_framework.parsers import MultiPartParser, JSONParser
import pandas as pd
from io import BytesIO
import openpyxl
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q, F, FloatField, Value
from django.db.models.functions import Coalesce, Cast
from django.db.models import Sum, Count, Q, Value, DecimalField
from django.db import transaction
from .models import Student, FeeStructure, StudentFeeInvoice, InvoiceItem
#from django.utils.decorators import method_decorator
#from django.views.decorators.csrf import csrf_exempt
from .models import *
from .serializers import *
from django.utils.timezone import make_aware
import datetime
from .services import generate_class_reports
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import A6, landscape, letter
from reportlab.lib.enums import TA_CENTER
from django.db import connection
import zipfile
from io import BytesIO
import json
import os
import json
import shutil
import tempfile
from django.core.management import call_command
from io import StringIO
import subprocess
from django.conf import settings
from datetime import datetime, timedelta


logger = logging.getLogger(__name__)
User = get_user_model()

# ==================== AUTHENTICATION VIEWS ====================
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
#@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny] 
    
    def post(self, request):
        print(f"DEBUG: Login attempt received from IP: {request.META.get('REMOTE_ADDR')}")
        print(f"DEBUG: Request Data: {request.data}")
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            # Log failed login attempt
            email = request.data.get('email', 'unknown')
            AuditLog.objects.create(
                event_type='USER_LOGIN',
                username=email,
                table_name='auth_user',  # ADD THIS
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4(),
                new_values={'email': email, 'status': 'failed'},
                operation='INSERT'  # ADD THIS
            )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

       
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        expires_dt = datetime.fromtimestamp(refresh.access_token.payload['exp'])
        aware_expiry = make_aware(expires_dt)
        # Create user session - FIXED expires_at
        session = UserSession.objects.create(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
            client_ip=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            device_fingerprint=request.META.get('HTTP_USER_AGENT', '')[:64],
            expires_at=aware_expiry
            
        )


      
        
        # Log successful login
        AuditLog.objects.create(
            event_type='USER_LOGIN',
            user=user,
            username=user.username,
            user_role=user.role,
            table_name='auth_user',  # ADD THIS
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4(),
            new_values={'email': user.email, 'status': 'success', 'role': user.role},
            operation='INSERT'  # ADD THIS
        )

        
        # Send notification if it's first login or unusual location
        if user.last_login is None:
            Notification.objects.create(
                notification_type='FIRST_LOGIN',
                title='Welcome to the System',
                message=f'Welcome {user.get_full_name()}! This is your first login.',
                recipient_type='User',
                recipient_id=user.id,
                priority='Normal',
                sent_by=user
            )
        
         # Return response
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,  
                'phone': user.phone if hasattr(user, 'phone') else None,
                'last_login': user.last_login,
            },
            'session_id': session.id
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token = serializer.validated_data['refresh_token']
        
        try:
            # Revoke the session
            session = UserSession.objects.get(
                refresh_token=refresh_token,
                user=request.user,
                revoked=False
            )
            session.revoked = True
            session.save()
            
            # Add token to blacklist
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Token might already be blacklisted
            
            # Log logout
            AuditLog.objects.create(
                event_type='USER_LOGOUT',
                user=request.user,
                username=request.user.username,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4(),
                operation='DELETE'
            )
            
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except UserSession.DoesNotExist:
            return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        refresh_token = serializer.validated_data['refresh_token']
        
        try:
            # Verify session exists and is not revoked
            session = UserSession.objects.get(
                refresh_token=refresh_token,
                revoked=False,
                expires_at__gt=timezone.now()
            )
            
            # Refresh the token
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            # Update session
            session.access_token = new_access_token
            session.expires_at = refresh.access_token.payload['exp']
            session.save()
            
            return Response({
                'token': new_access_token,
                'refresh_token': str(refresh)
            }, status=status.HTTP_200_OK)
            
        except (UserSession.DoesNotExist, TokenError):
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class ValidateTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get user session
        token = request.auth
        if not token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify session exists and is not revoked
            session = UserSession.objects.get(
                access_token=str(token),
                revoked=False,
                expires_at__gt=timezone.now()
            )
            
            # Update last activity
            session.last_activity = timezone.now()
            session.save()
            
            user_data = UserSerializer(request.user).data
            return Response({'user': user_data}, status=status.HTTP_200_OK)
            
        except UserSession.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired session'},
                status=status.HTTP_401_UNAUTHORIZED
            )

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.save()
        
        # Log password change
        from .models import PasswordHistory
        PasswordHistory.objects.create(
            user=user,
            password_hash=user.password,
            changed_by=user
        )
        
        # Log audit
        AuditLog.objects.create(
            event_type='USER_UPDATE',
            user=user,
            username=user.username,
            table_name='auth_user',
            record_id=user.id,
            operation='UPDATE',
            changed_fields=['password'],
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        # Revoke all other sessions for security
        UserSession.objects.filter(user=user, revoked=False).update(revoked=True)
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

# ==================== USER MANAGEMENT VIEWS ====================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return super().get_serializer_class()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log user creation
        AuditLog.objects.create(
            event_type='USER_CREATE',
            user=request.user,
            username=request.user.username,
            table_name='auth_user',
            record_id=user.id,
            operation='INSERT',
            new_values={
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'created_by': request.user.username
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        AuditLog.objects.create(
            event_type='USER_UPDATE',
            user=request.user,
            username=request.user.username,
            table_name='auth_user',
            record_id=request.user.id,
            operation='UPDATE',
            changed_fields=list(request.data.keys()),
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        
        # Prevent self-deactivation
        if user == request.user:
            return Response(
                {'error': 'Cannot deactivate your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = False
        user.save()
        
        # Revoke all active sessions
        UserSession.objects.filter(user=user, revoked=False).update(revoked=True)
        
        AuditLog.objects.create(
            event_type='USER_UPDATE',
            user=request.user,
            username=request.user.username,
            table_name='auth_user',
            record_id=user.id,
            operation='UPDATE',
            changed_fields=['is_active'],
            new_values={'is_active': False},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'message': 'User deactivated successfully'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        
        AuditLog.objects.create(
            event_type='USER_UPDATE',
            user=request.user,
            username=request.user.username,
            table_name='auth_user',
            record_id=user.id,
            operation='UPDATE',
            changed_fields=['is_active'],
            new_values={'is_active': True},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'message': 'User activated successfully'})
    
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        role = request.query_params.get('role')
        if not role:
            return Response({'error': 'Role parameter required'}, status=400)
        
        users = User.objects.filter(role=role, is_active=True)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

# ==================== IP WHITELIST VIEWS ====================
class IPWhitelistViewSet(viewsets.ModelViewSet):
    queryset = IPWhitelist.objects.all()
    serializer_class = IPWhitelistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
        AuditLog.objects.create(
            event_type='CONFIG_CHANGE',
            user=self.request.user,
            username=self.request.user.username,
            table_name='IPWhitelist',
            operation='INSERT',
            new_values=serializer.data,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            endpoint=self.request.path,
            http_method=self.request.method,
            request_id=uuid.uuid4()
        )
    
    def perform_update(self, serializer):
        old_instance = self.get_object()
        serializer.save()
        
        AuditLog.objects.create(
            event_type='CONFIG_CHANGE',
            user=self.request.user,
            username=self.request.user.username,
            table_name='IPWhitelist',
            record_id=old_instance.id,
            operation='UPDATE',
            old_values=IPWhitelistSerializer(old_instance).data,
            new_values=serializer.data,
            changed_fields=list(serializer.validated_data.keys()),
            ip_address=self.request.META.get('REMOTE_ADDR'),
            endpoint=self.request.path,
            http_method=self.request.method,
            request_id=uuid.uuid4()
        )
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        ip_entry = self.get_object()
        ip_entry.status = 'Active' if ip_entry.status != 'Active' else 'Inactive'
        ip_entry.save()
        
        AuditLog.objects.create(
            event_type='CONFIG_CHANGE',
            user=request.user,
            username=request.user.username,
            table_name='IPWhitelist',
            record_id=ip_entry.id,
            operation='UPDATE',
            changed_fields=['status'],
            new_values={'status': ip_entry.status},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'status': ip_entry.status})

# ==================== SESSION MANAGEMENT VIEWS ====================
class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admins can see all sessions, users can only see their own
        if self.request.user.is_staff or self.request.user.role == 'system_admin':
            return UserSession.objects.filter(revoked=False).order_by('-login_time')
        return UserSession.objects.filter(user=self.request.user, revoked=False).order_by('-login_time')
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        session = self.get_object()
        
        # Check permissions
        if session.user != request.user and not (request.user.is_staff or request.user.role == 'system_admin'):
            return Response(
                {'error': 'You can only revoke your own sessions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        session.revoked = True
        session.save()
        
        AuditLog.objects.create(
            event_type='USER_LOGOUT',
            user=request.user,
            username=request.user.username,
            table_name='UserSession',
            record_id=session.id,
            operation='UPDATE',
            changed_fields=['revoked'],
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'message': 'Session revoked successfully'})
    
    @action(detail=False, methods=['post'])
    def revoke_all(self, request):
        user_id = request.data.get('user_id')
        
        if user_id:
            # Revoke all sessions for specific user (admin only)
            if not (request.user.is_staff or request.user.role == 'system_admin'):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            sessions = UserSession.objects.filter(user_id=user_id, revoked=False)
            user = User.objects.get(id=user_id)
            username = user.username
        else:
            # Revoke all sessions for current user
            sessions = UserSession.objects.filter(user=request.user, revoked=False)
            username = request.user.username
        
        sessions.update(revoked=True)
        
        AuditLog.objects.create(
            event_type='USER_LOGOUT',
            user=request.user,
            username=request.user.username,
            table_name='UserSession',
            operation='UPDATE',
            new_values={'sessions_revoked': sessions.count(), 'user': username},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'message': f'{sessions.count()} sessions revoked'})

# ==================== DASHBOARD VIEWS ====================
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Count, Q
        
        
        user = request.user
        
        # Base statistics
        stats = {
            'total_students': 0,
            'total_teachers': 0,
            'total_staff': 0,
            'total_parents': 0,
            'active_sessions': 0,
            'pending_invoices': 0,
            'today_attendance': 0,
            'recent_activities': []
        }
        
        # Get counts based on user role
        if user.role in ['system_admin', 'principal', 'registrar']:
            stats['total_students'] = Student.objects.filter(status='Active', archived=False).count()
            stats['total_teachers'] = User.objects.filter(role='teacher', is_active=True).count()
            stats['total_staff'] = Staff.objects.filter(status='Active').count()
            stats['total_parents'] = Parent.objects.filter(is_active=True).count()
        elif user.role == 'teacher':
            # Teacher sees their class students
            from .models import ClassSubjectAllocation
            teacher_classes = ClassSubjectAllocation.objects.filter(
                teacher=user
            ).values_list('class_id', flat=True)
            stats['total_students'] = Student.objects.filter(
                current_class_id__in=teacher_classes,
                status='Active',
                archived=False
            ).count()
        
        # Active sessions (user's own sessions or all for admin)
        if user.role in ['system_admin', 'principal']:
            stats['active_sessions'] = UserSession.objects.filter(
                revoked=False,
                expires_at__gt=timezone.now()
            ).count()
        else:
            stats['active_sessions'] = UserSession.objects.filter(
                user=user,
                revoked=False,
                expires_at__gt=timezone.now()
            ).count()
        
        # Recent activities
        recent_activities = AuditLog.objects.all().order_by('-event_time')[:10]
        stats['recent_activities'] = [
            {
                'time': activity.event_time.strftime('%Y-%m-%d %H:%M'),
                'event': activity.get_event_type_display(),
                'user': activity.username or 'System',
                'details': activity.new_values or {}
            }
            for activity in recent_activities
        ]
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

# ==================== MFA VIEWS ====================
class MFAView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get MFA status"""
        return Response({
            'mfa_enabled': request.user.mfa_enabled,
            'mfa_setup': bool(request.user.mfa_secret)
        })
    
    def post(self, request):
        """Enable/disable MFA"""
        serializer = MFAEnableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        enable = serializer.validated_data['enable']
        
        if enable and not request.user.mfa_secret:
            return Response(
                {'error': 'MFA not set up. Please set up MFA first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.mfa_enabled = enable
        request.user.save()
        
        AuditLog.objects.create(
            event_type='USER_UPDATE',
            user=request.user,
            username=request.user.username,
            table_name='auth_user',
            record_id=request.user.id,
            operation='UPDATE',
            changed_fields=['mfa_enabled'],
            new_values={'mfa_enabled': enable},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({
            'message': f'MFA {"enabled" if enable else "disabled"} successfully',
            'mfa_enabled': request.user.mfa_enabled
        })

class MFASetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Generate MFA secret"""
        import pyotp
        import qrcode
        import base64
        from io import BytesIO
        
        # Generate secret
        secret = pyotp.random_base32()
        
        # Create TOTP URI
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(
            name=request.user.email,
            issuer_name="ElimuHub School Management System"
        )
        
        # Generate QR code
        qr = qrcode.make(uri)
        buffered = BytesIO()
        qr.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_base64}',
            'uri': uri
        })
    
    def post(self, request):
        """Verify and save MFA setup"""
        serializer = MFASetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        import pyotp
        
        secret = request.data.get('secret')
        token = serializer.validated_data['token']
        
        totp = pyotp.TOTP(secret)
        if totp.verify(token):
            request.user.mfa_secret = secret
            request.user.save()
            
            AuditLog.objects.create(
                event_type='USER_UPDATE',
                user=request.user,
                username=request.user.username,
                table_name='auth_user',
                record_id=request.user.id,
                operation='UPDATE',
                changed_fields=['mfa_secret'],
                ip_address=request.META.get('REMOTE_ADDR'),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            return Response({'message': 'MFA set up successfully'})
        
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

class MFAVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Verify MFA token for login"""
        serializer = MFAAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        user_id = request.session.get('mfa_user_id')
        
        if not user_id:
            return Response(
                {'error': 'No pending MFA verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        import pyotp
        
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(token):
            # Clear MFA session
            request.session.pop('mfa_user_id', None)
            
            # Generate tokens as in regular login
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Create user session
            session = UserSession.objects.create(
                user=user,
                access_token=access_token,
                refresh_token=refresh_token,
                client_ip=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                device_fingerprint=request.META.get('HTTP_USER_AGENT', '')[:64],
                expires_at=refresh.access_token.payload['exp']
            )
            
            response_data = LoginResponseSerializer({
                'token': access_token,
                'refresh_token': refresh_token,
                'session_id': session.id,
                'user': user
            }).data
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

# ==================== PUBLIC VIEWS ====================
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def system_status(request):
    """Check system status"""
    from django.db import connection
    
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check if there are any users
        user_count = User.objects.count()
        
        return Response({
            'status': 'ok',
            'database': 'connected',
            'users_count': user_count,
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

# ==================== NOTIFICATION VIEWS ====================
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    from .models import Notification
    from .serializers import NotificationSerializer
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get notifications for this user
        notifications = Notification.objects.filter(
            Q(recipient_type='User', recipient_id=user.id) |
            Q(recipient_type='Role', recipient_id=user.role) |
            Q(recipient_type='All')
        ).order_by('-sent_at')
        
        return notifications
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        notifications = self.get_queryset().filter(status='Unread')
        page = self.paginate_queryset(notifications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.status = 'Read'
        notification.read_at = timezone.now()
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(status='Unread')
        updated = notifications.update(status='Read', read_at=timezone.now())
        return Response({'message': f'{updated} notifications marked as read'})
    
    
# Add to your existing views.py (after the authentication views)
# ==================== CLASS MANAGEMENT VIEWS ====================
class ClassViewSet(viewsets.ModelViewSet):
    """Class management views - added to existing views.py"""
    queryset = Class.objects.all().order_by('numeric_level', 'stream')
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ClassCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClassUpdateSerializer
        elif self.action == 'retrieve':
            return ClassDetailSerializer
        return super().get_serializer_class()
    
    def check_admin_permission(self, user):
        """Check if user can manage classes"""
        allowed_roles = ['system_admin', 'principal', 'director_studies', 'registrar']
        return user.role in allowed_roles
    
    def create(self, request, *args, **kwargs):
        """Create a new class - with audit logging"""
        # Check permission
        if not self.check_admin_permission(request.user):
            return Response(
                {'error': 'You do not have permission to create classes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_instance = serializer.save()
            
            # Log audit - JUST LIKE LOGIN DOES
            AuditLog.objects.create(
                event_type='CLASS_CREATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=class_instance.id,
                operation='INSERT',
                new_values={
                    'class_code': class_instance.class_code,
                    'class_name': class_instance.class_name,
                    'numeric_level': class_instance.numeric_level,
                    'capacity': class_instance.capacity,
                    'is_active': class_instance.is_active
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            # Send notification if class teacher assigned
            if class_instance.class_teacher:
                Notification.objects.create(
                    notification_type='CLASS_ASSIGNED',
                    title='Class Teacher Assignment',
                    message=f'You have been assigned as class teacher for {class_instance.class_name}',
                    recipient_type='User',
                    recipient_id=class_instance.class_teacher.id,
                    priority='Normal',
                    sent_by=request.user
                )
            
            return Response({
                'success': True,
                'message': 'Class created successfully',
                'data': ClassSerializer(class_instance).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating class: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Update class - with audit logging"""
        if not self.check_admin_permission(request.user):
            return Response(
                {'error': 'You do not have permission to update classes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        old_values = ClassSerializer(instance).data
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            class_instance = serializer.save()
            
            # Log audit - capture changes
            changed_fields = list(request.data.keys())
            AuditLog.objects.create(
                event_type='CLASS_UPDATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=instance.id,
                operation='UPDATE',
                old_values={k: old_values[k] for k in changed_fields if k in old_values},
                new_values={k: request.data[k] for k in changed_fields},
                changed_fields=changed_fields,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            return Response({
                'success': True,
                'message': 'Class updated successfully',
                'data': ClassSerializer(class_instance).data
            })
            
        except Exception as e:
            logger.error(f"Error updating class: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to update class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete class - with audit logging"""
        if not self.check_admin_permission(request.user):
            return Response(
                {'error': 'You do not have permission to delete classes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        
        # Check if class has students
        student_count = Student.objects.filter(current_class=instance).count()
        if student_count > 0:
            return Response({
                'success': False,
                'error': f'Cannot delete class with {student_count} students. Reassign students first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        old_values = ClassSerializer(instance).data
        
        try:
            instance.delete()
            
            # Log deletion
            AuditLog.objects.create(
                event_type='CLASS_DELETE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=kwargs['pk'],
                operation='DELETE',
                old_values=old_values,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            return Response({
                'success': True,
                'message': 'Class deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Error deleting class: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to delete class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activate/Deactivate class - with audit logging"""
        if not self.check_admin_permission(request.user):
            return Response(
                {'error': 'You do not have permission to modify class status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        new_status = not instance.is_active
        
        try:
            instance.is_active = new_status
            instance.save()
            
            # Log status change
            AuditLog.objects.create(
                event_type='CLASS_UPDATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=instance.id,
                operation='UPDATE',
                old_values={'is_active': not new_status},
                new_values={'is_active': new_status},
                changed_fields=['is_active'],
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            status_text = "activated" if new_status else "deactivated"
            return Response({
                'success': True,
                'message': f'Class {status_text} successfully',
                'data': ClassSerializer(instance).data
            })
            
        except Exception as e:
            logger.error(f"Error toggling class status: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to update class status',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get class statistics - like dashboard"""
        try:
            total_classes = Class.objects.count()
            active_classes = Class.objects.filter(is_active=True).count()
            
            # Get total capacity
            total_capacity = Class.objects.aggregate(total=models.Sum('capacity'))['total'] or 0
            
            # Get current student counts per class
            classes_with_counts = Class.objects.annotate(
                student_count=models.Count('current_students')
            )
            
            # Calculate average capacity
            avg_capacity = total_capacity / total_classes if total_classes > 0 else 0
            
            # Get classes by level
            classes_by_level = classes_with_counts.values('numeric_level').annotate(
                class_count=models.Count('id'),
                student_count=models.Sum('student_count')
            ).order_by('numeric_level')
            
            return Response({
                'success': True,
                'data': {
                    'total_classes': total_classes,
                    'active_classes': active_classes,
                    'total_capacity': total_capacity,
                    'average_capacity': round(avg_capacity, 1),
                    'classes_by_level': list(classes_by_level),
                    'classes': ClassSerializer(classes_with_counts, many=True).data
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting class statistics: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to get statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class StreamListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        streams = Stream.objects.all().values('id', 'name')
        return Response({
            'success': True,
            'data': list(streams)
        })


# ==================== STAFF/TEACHER VIEWS ====================
class TeacherListView(APIView):
    """Get list of teachers for dropdown - similar to LoginView pattern"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get teachers (staff with teacher role)
            teachers = User.objects.filter(
                role='teacher',
                is_active=True
            ).order_by('first_name', 'last_name')
            
            teacher_list = []
            for teacher in teachers:
                # Get staff details if available
                staff_details = {}
                if hasattr(teacher, 'staff_profile'):
                    staff = teacher.staff_profile
                    staff_details = {
                        'staff_id': staff.staff_id,
                        'designation': staff.designation,
                        'department': staff.department
                    }
                
                teacher_list.append({
                    'id': teacher.id,
                    'username': teacher.username,
                    'email': teacher.email,
                    'first_name': teacher.first_name,
                    'last_name': teacher.last_name,
                    'phone': teacher.phone,
                    'full_name': f"{teacher.first_name} {teacher.last_name}",
                    **staff_details
                })
            
            return Response({
                'success': True,
                'data': teacher_list
            })
            
        except Exception as e:
            logger.error(f"Error getting teachers: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to get teacher list'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== SIMPLE CLASS API VIEWS ====================
class ClassListAPIView(APIView):
    """Simple class list view for your React frontend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all classes - matches your React frontend expectation"""
        try:
            classes = Class.objects.all().order_by('numeric_level', 'stream')
            
            
            # Add student count to each class
            class_list = []
            for cls in classes:
                student_count = Student.objects.filter(current_class=cls).count()
                
                stream_name = cls.stream.name if cls.stream else "None"
                class_list.append({
                    'id': cls.id,
                    'class_code': cls.class_code,
                    'class_name': cls.class_name,
                    'numeric_level': cls.numeric_level,
                    'stream': stream_name,
                    'capacity': cls.capacity,
                    'current_students': student_count,
                    'class_teacher_id': cls.class_teacher.id if cls.class_teacher else None,
                    'class_teacher_name': f"{cls.class_teacher.first_name} {cls.class_teacher.last_name}" if cls.class_teacher else None,
                    'is_active': cls.is_active,
                    'created_at': cls.created_at
                })
            
            return Response({
                'success': True,
                'data': class_list
            })
            
        except Exception as e:
            logger.error(f"Error in ClassListAPIView: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClassCreateAPIView(APIView):
    """Create class - matches your React frontend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check permission
        allowed_roles = ['system_admin', 'principal', 'director_studies', 'registrar']
        if request.user.role not in allowed_roles:
            return Response({
                'success': False,
                'error': 'You do not have permission to create classes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate required fields
        required_fields = ['class_code', 'class_name', 'numeric_level']
        for field in required_fields:
            if field not in request.data:
                return Response({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Prepare data
            data = request.data.copy()
            
            # Set class teacher if provided
            if 'class_teacher_id' in data and data['class_teacher_id']:
                try:
                    teacher = User.objects.get(id=data['class_teacher_id'])
                    data['class_teacher'] = teacher.id
                except User.DoesNotExist:
                    return Response({
                        'success': False,
                        'error': 'Invalid teacher ID'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create class
            serializer = ClassCreateSerializer(data=data)
            if serializer.is_valid():
                class_instance = serializer.save(created_by=request.user)
                
                # AUDIT LOG - JUST LIKE LOGIN
                AuditLog.objects.create(
                    event_type='CLASS_CREATE',
                    user=request.user,
                    username=request.user.username,
                    user_role=request.user.role,
                    table_name='Class',
                    record_id=class_instance.id,
                    operation='INSERT',
                    new_values={'error': str(serializer.errors)},
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    endpoint=request.path,
                    http_method=request.method,
                    request_id=uuid.uuid4()
                )
                
                # Build response data
                response_data = {
                    'id': class_instance.id,
                    'class_code': class_instance.class_code,
                    'class_name': class_instance.class_name,
                    'numeric_level': class_instance.numeric_level,
                    'stream': class_instance.stream.name if class_instance.stream else None,
                    'capacity': class_instance.capacity,
                    'current_students': 0,
                    'class_teacher_id': class_instance.class_teacher.id if class_instance.class_teacher else None,
                    'class_teacher_name': f"{class_instance.class_teacher.first_name} {class_instance.class_teacher.last_name}" if class_instance.class_teacher else None,
                    'is_active': class_instance.is_active,
                    'created_at': class_instance.created_at
                }
                
                return Response({
                    'success': True,
                    'data': {
                        'id': class_instance.id,
                        'class_code': class_instance.class_code,
                        'class_name': class_instance.class_name,
                        # FIX: Return the name or ID, NOT the object
                        'stream': class_instance.stream.name if class_instance.stream else None,
                        'is_active': class_instance.is_active
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating class: {str(e)}")
            
            # Log error to audit
            AuditLog.objects.create(
                event_type='CLASS_CREATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                operation='INSERT',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4(),
               # error_message=str(e)
            )
            
            return Response({
                'success': False,
                'error': 'Failed to create class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ClassUpdateAPIView(APIView):
    """Update class - matches your React frontend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, class_id):
        # Check permission
        allowed_roles = ['system_admin', 'principal', 'director_studies', 'registrar']
        if request.user.role not in allowed_roles:
            return Response({
                'success': False,
                'error': 'You do not have permission to update classes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get class instance
            class_instance = Class.objects.get(id=class_id)
            old_values = {
                'is_active': class_instance.is_active
            }
            
            # Update fields
            if 'is_active' in request.data:
                class_instance.is_active = request.data['is_active']
            
            if 'class_teacher_id' in request.data:
                if request.data['class_teacher_id']:
                    try:
                        teacher = User.objects.get(id=request.data['class_teacher_id'])
                        class_instance.class_teacher = teacher
                    except User.DoesNotExist:
                        return Response({
                            'success': False,
                            'error': 'Invalid teacher ID'
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    class_instance.class_teacher = None
            
            # Save changes
            class_instance.save()
            
            # AUDIT LOG
            changed_fields = list(request.data.keys())
            AuditLog.objects.create(
                event_type='CLASS_UPDATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=class_instance.id,
                operation='UPDATE',
                old_values=old_values,
                new_values=request.data,
                changed_fields=changed_fields,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            # Get updated student count
            student_count = Student.objects.filter(current_class=class_instance).count()
            
            response_data = {
                'id': class_instance.id,
                'class_code': class_instance.class_code,
                'class_name': class_instance.class_name,
                'numeric_level': class_instance.numeric_level,
                'stream': class_instance.stream,
                'capacity': class_instance.capacity,
                'current_students': student_count,
                'class_teacher_id': class_instance.class_teacher.id if class_instance.class_teacher else None,
                'class_teacher_name': f"{class_instance.class_teacher.first_name} {class_instance.class_teacher.last_name}" if class_instance.class_teacher else None,
                'is_active': class_instance.is_active
            }
            
            return Response({
                'success': True,
                'message': 'Class updated successfully',
                'data': response_data
            })
            
        except Class.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Class not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating class: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to update class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ClassDeleteAPIView(APIView):
    """Delete class - matches your React frontend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, class_id):
        # Check permission
        allowed_roles = ['system_admin', 'principal', 'director_studies', 'registrar']
        if request.user.role not in allowed_roles:
            return Response({
                'success': False,
                'error': 'You do not have permission to delete classes'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get class instance
            class_instance = Class.objects.get(id=class_id)
            
            # Check if class has students
            student_count = Student.objects.filter(current_class=class_instance).count()
            if student_count > 0:
                return Response({
                    'success': False,
                    'error': f'Cannot delete class with {student_count} students'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save old values for audit
            old_values = {
                'class_code': class_instance.class_code,
                'class_name': class_instance.class_name,
                'numeric_level': class_instance.numeric_level
            }
            
            # Delete the class
            class_instance.delete()
            
            # AUDIT LOG
            AuditLog.objects.create(
                event_type='CLASS_DELETE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Class',
                record_id=class_id,
                operation='DELETE',
                old_values=old_values,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            return Response({
                'success': True,
                'message': 'Class deleted successfully'
            })
            
        except Class.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Class not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting class: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to delete class',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# ==================== TEACHER LIST API ====================
class TeacherListAPIView(APIView):
    """Get teachers for dropdown - matches your React frontend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get active teachers
            teachers = User.objects.filter(
                role='teacher',
                is_active=True
            ).order_by('first_name', 'last_name')
            
            teacher_list = []
            for teacher in teachers:
                teacher_list.append({
                    'id': teacher.id,
                    'first_name': teacher.first_name,
                    'last_name': teacher.last_name,
                    'full_name': f"{teacher.first_name} {teacher.last_name}",
                    'email': teacher.email,
                    'phone': teacher.phone
                })
            
            return Response({
                'success': True,
                'data': teacher_list
            })
            
        except Exception as e:
            logger.error(f"Error getting teachers: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to get teacher list'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





logger = logging.getLogger(__name__)

# ==================== STUDENT MANAGEMENT VIEWS ====================
class StudentViewSet(viewsets.ModelViewSet):
    """Student CRUD operations with audit logging"""
    queryset = Student.objects.all().order_by('-admission_date')
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            allowed_roles = ['system_admin', 'principal', 'registrar', 'director_studies']
            return [permissions.IsAuthenticated()]  # Role check in perform methods
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudentUpdateSerializer
        return super().get_serializer_class()
    
    def create(self, request, *args, **kwargs):
        # Check user role
        allowed_roles = ['system_admin', 'principal', 'registrar', 'director_studies']
        if request.user.role not in allowed_roles:
            return Response({
                'success': False,
                'error': 'You do not have permission to create students'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate admission number if not provided
            if 'admission_no' not in request.data or not request.data['admission_no']:
                # Generate sequential admission number
                last_student = Student.objects.order_by('-admission_date').first()
                if last_student and last_student.admission_no:
                    # Parse last admission number
                    import re
                    match = re.match(r'([A-Z]+)-(\d{4})(\d{2})-(\d+)', last_student.admission_no)
                    if match:
                        prefix, year, month, sequence = match.groups()
                        next_sequence = int(sequence) + 1
                        admission_no = f"{prefix}-{year}{month}-{next_sequence}"
                    else:
                        # Default format
                        admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-1"
                else:
                    admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-1"
                
                request.data['admission_no'] = admission_no
            
            # Create student
            student = serializer.save(created_by=request.user)
            
            # AUDIT LOG
            AuditLog.objects.create(
                event_type='STUDENT_CREATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Student',
                record_id=student.id,
                operation='INSERT',
                new_values={
                    'admission_no': student.admission_no,
                    'first_name': student.first_name,
                    'last_name': student.last_name,
                    'current_class_id': student.current_class_id,
                    'created_by': request.user.username
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            # Send notification to class teacher if assigned
            if student.current_class and student.current_class.class_teacher:
                Notification.objects.create(
                    notification_type='STUDENT_ADMITTED',
                    title='New Student Admitted',
                    message=f'{student.first_name} {student.last_name} has been admitted to your class',
                    recipient_type='User',
                    recipient_id=student.current_class.class_teacher.id,
                    priority='Normal',
                    sent_by=request.user
                )
            plugin_registry.run_hooks('after_student_admission', student=student, user=request.user)
            return Response({
                'success': True,
                'message': 'Student registered successfully',
                'data': StudentSerializer(student).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating student: {str(e)}")
            
            # Log error
            AuditLog.objects.create(
                event_type='STUDENT_CREATE',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Student',
                operation='INSERT',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4(),
                error_message=str(e)
            )
            
            return Response({
                'success': False,
                'error': 'Failed to register student',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        search_query = request.query_params.get('search', '').strip()
        
        if search_query:
            # 1. Block broad numeric searches (e.g., "1")
            if search_query.isdigit() and len(search_query) < 3:
                 return Response({
                    "success": False, 
                    "error": "Invalid search. Please enter a full name or full admission number."
                }, status=status.HTTP_400_BAD_REQUEST)

            # 2. Logic for Admission Number Search
            # If it starts with 'ADM', use an exact or 'startswith' match for speed and stability
            if search_query.upper().startswith('ADM-'):
                queryset = self.get_queryset().filter(admission_no__iexact=search_query)
            else:
                # 3. Standard name search
                queryset = self.get_queryset().filter(
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query)
                )
        else:
            queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True, 
            "data": serializer.data
        })
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"success": True, "data": serializer.data})
    @action(detail=True, methods=['get'], url_path='id-card')
    def generate_id_card(self, request, pk=None):
        """Generate a printable ID card for a student"""
        try:
            student = self.get_object()
            
            # Create a BytesIO buffer
            buffer = BytesIO()
            
            # Create PDF document (landscape A6)
            doc = SimpleDocTemplate(buffer, pagesize=landscape(A6))
            
            # Container for story
            story = []
            
            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=14,
                textColor=colors.HexColor('#4f46e5'),
                alignment=TA_CENTER,
                spaceAfter=6
            )
            normal_style = ParagraphStyle(
                'CustomNormal',
                parent=styles['Normal'],
                fontSize=8,
                spaceAfter=3
            )
            
            # Header
            story.append(Paragraph("ELIMU HUB SCHOOL", title_style))
            story.append(Paragraph("Student ID Card", ParagraphStyle(
                'SubTitle',
                parent=styles['Normal'],
                fontSize=10,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#64748b'),
                spaceAfter=10
            )))
            
            # Student Info
            info_data = [
                ["Name:", f"{student.first_name} {student.middle_name or ''} {student.last_name}".strip()],
                ["Admission No:", student.admission_no],
                ["Class:", student.current_class_id or 'N/A'],
                ["Date of Birth:", student.date_of_birth],
                ["Gender:", student.gender or 'N/A'],
                ["Guardian:", student.guardian_name or 'N/A'],
                ["Guardian Phone:", student.guardian_phone or 'N/A']
            ]
            
            info_table = Table(info_data, colWidths=[1.2*inch, 2*inch])
            info_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(info_table)
            
            # Footer
            story.append(Spacer(1, 0.1*inch))
            story.append(Paragraph(
                "Valid for Academic Year 2025-2026",
                ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, alignment=TA_CENTER)
            ))
            story.append(Paragraph(
                "Contact: info@elimuhub.school | Phone: +254 700 000 000",
                ParagraphStyle('Contact', parent=styles['Normal'], fontSize=7, alignment=TA_CENTER)
            ))
            
            # Build PDF
            doc.build(story)
            
            # Get PDF value
            pdf = buffer.getvalue()
            buffer.close()
            
            # Return PDF response
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="id_card_{student.admission_no}.pdf"'
            response['Access-Control-Allow-Origin'] = '*'
            
            return response
            
        except Exception as e:
            import traceback
            print("ID Card Generation Error:", traceback.format_exc())
            return HttpResponse(f"Error: {str(e)}", status=500)
        
    @action(detail=False, methods=['post'], url_path='bulk-status-update')
    def bulk_status_update(self, request):
        """Update status for multiple students at once"""
        try:
            student_ids = request.data.get('student_ids', [])
            new_status = request.data.get('status')
            
            if not student_ids:
                return Response({
                    'success': False,
                    'error': 'No student IDs provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not new_status:
                return Response({
                    'success': False,
                    'error': 'No status provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate status
            valid_statuses = ['active', 'inactive', 'graduated', 'transferred']
            if new_status.lower() not in valid_statuses:
                return Response({
                    'success': False,
                    'error': f'Invalid status. Valid options: {", ".join(valid_statuses)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update all students
            updated_count = Student.objects.filter(id__in=student_ids).update(status=new_status.lower())
            
            # Create audit logs for each updated student
            for student_id in student_ids:
                AuditLog.objects.create(
                    user=request.user,
                    action='BULK_STATUS_UPDATE',
                    model_name='Student',
                    record_id=student_id,
                    changes={'status': new_status.lower()}
                )
            
            return Response({
                'success': True,
                'message': f'Successfully updated status for {updated_count} students',
                'updated_count': updated_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Bulk status update error: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


class StudentBulkImportView(APIView):
    """Bulk import students from Excel file"""
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check user role
        allowed_roles = ['system_admin', 'principal', 'registrar', 'director_studies']
        if request.user.role not in allowed_roles:
            return Response({
                'success': False,
                'error': 'You do not have permission to import students'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if 'excelFile' not in request.FILES:
            return Response({
                'success': False,
                'error': 'No file uploaded'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        excel_file = request.FILES['excelFile']
        imported_count = 0
        errors = []
        
        try:
            # Read Excel file
            if excel_file.name.endswith('.xlsx'):
                df = pd.read_excel(excel_file, engine='openpyxl')
            else:
                df = pd.read_excel(excel_file)
            
            # Convert to list of dictionaries
            data_list = df.to_dict('records')
            
            # Process each row
            for i, row in enumerate(data_list, start=2):  # Start from row 2 (header is row 1)
                try:
                    # Clean the data
                    cleaned_data = {}
                    for key, value in row.items():
                        # Convert pandas NaN to None
                        if pd.isna(value):
                            cleaned_data[key] = None
                        else:
                            cleaned_data[key] = value
                    
                    # Generate admission number if not provided
                    if not cleaned_data.get('admission_no'):
                        last_student = Student.objects.order_by('-admission_date').first()
                        if last_student and last_student.admission_no:
                            import re
                            match = re.match(r'([A-Z]+)-(\d{4})(\d{2})-(\d+)', last_student.admission_no)
                            if match:
                                prefix, year, month, sequence = match.groups()
                                next_sequence = int(sequence) + 1 + imported_count
                                admission_no = f"{prefix}-{year}{month}-{next_sequence}"
                            else:
                                admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-{1 + imported_count}"
                        else:
                            admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-{1 + imported_count}"
                        cleaned_data['admission_no'] = admission_no
                    
                    # Validate and create student
                    serializer = StudentCreateSerializer(data=cleaned_data)
                    if serializer.is_valid():
                        student = serializer.save(created_by=request.user)
                        imported_count += 1
                        
                        # Log each student creation
                        AuditLog.objects.create(
                            event_type='STUDENT_IMPORT',
                            user=request.user,
                            username=request.user.username,
                            user_role=request.user.role,
                            table_name='Student',
                            record_id=student.id,
                            operation='INSERT',
                            new_values={
                                'admission_no': student.admission_no,
                                'first_name': student.first_name,
                                'last_name': student.last_name,
                                'source': 'bulk_import'
                            },
                            ip_address=request.META.get('REMOTE_ADDR'),
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            endpoint=request.path,
                            http_method=request.method,
                            request_id=uuid.uuid4()
                        )
                    else:
                        errors.append({
                            'row': i,
                            'admission_no': cleaned_data.get('admission_no', 'N/A'),
                            'errors': serializer.errors
                        })
                        
                except Exception as e:
                    errors.append({
                        'row': i,
                        'admission_no': cleaned_data.get('admission_no', 'N/A'),
                        'errors': str(e)
                    })
                    logger.error(f"Error importing row {i}: {str(e)}")
            
            # Log bulk import summary
            AuditLog.objects.create(
                event_type='BULK_IMPORT',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Student',
                operation='INSERT',
                new_values={
                    'imported_count': imported_count,
                    'total_rows': len(data_list),
                    'error_count': len(errors),
                    'file_name': excel_file.name
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4()
            )
            
            return Response({
                'success': True,
                'message': f'Successfully imported {imported_count} students',
                'importedCount': imported_count,
                'totalRows': len(data_list),
                'errorCount': len(errors),
                'errors': errors if errors else None
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error in bulk import: {str(e)}")
            
            AuditLog.objects.create(
                event_type='BULK_IMPORT',
                user=request.user,
                username=request.user.username,
                user_role=request.user.role,
                table_name='Student',
                operation='INSERT',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                endpoint=request.path,
                http_method=request.method,
                request_id=uuid.uuid4(),
                error_message=str(e)
            )
            
            return Response({
                'success': False,
                'error': 'Failed to import students',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class GenerateAdmissionNumberView(APIView):
    """Generate next admission number"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get last admission number
            last_student = Student.objects.order_by('-admission_date').first()
            
            if last_student and last_student.admission_no:
                import re
                match = re.match(r'([A-Z]+)-(\d{4})(\d{2})-(\d+)', last_student.admission_no)
                if match:
                    prefix, year, month, sequence = match.groups()
                    current_year = timezone.now().year
                    current_month = timezone.now().month
                    
                    # If year/month changed, reset sequence
                    if int(year) != current_year or int(month) != current_month:
                        next_sequence = 1
                        admission_no = f"{prefix}-{current_year}{current_month:02d}-{next_sequence}"
                    else:
                        next_sequence = int(sequence) + 1
                        admission_no = f"{prefix}-{year}{month}-{next_sequence}"
                else:
                    # Default format
                    admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-1"
                    next_sequence = 1
            else:
                # First student
                admission_no = f"ADM-{timezone.now().strftime('%Y%m')}-1"
                next_sequence = 1
            
            # Also check highest sequence number to avoid duplicates
            all_students = Student.objects.all()
            highest_sequence = 0
            
            for student in all_students:
                if student.admission_no:
                    match = re.match(r'[A-Z]+-\d{6}-(\d+)', student.admission_no)
                    if match:
                        seq = int(match.group(1))
                        if seq > highest_sequence:
                            highest_sequence = seq
            
            if highest_sequence >= next_sequence:
                next_sequence = highest_sequence + 1
                # Reconstruct admission number with highest sequence
                current_year = timezone.now().year
                current_month = timezone.now().month
                admission_no = f"ADM-{current_year}{current_month:02d}-{next_sequence}"
            
            return Response({
                'success': True,
                'admission_no': admission_no,
                'next_sequence': next_sequence,
                'format': 'PREFIX-YYYYMM-SEQUENCE'
            })
            
        except Exception as e:
            logger.error(f"Error generating admission number: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to generate admission number'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentStatisticsView(APIView):
    """Get student statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            total_students = Student.objects.count()
            active_students = Student.objects.filter(status='Active').count()
            male_students = Student.objects.filter(gender='Male').count()
            female_students = Student.objects.filter(gender='Female').count()
            
            # Count by class
            classes = Class.objects.all()
            class_distribution = []
            for cls in classes:
                count = Student.objects.filter(current_class=cls, status='Active').count()
                if count > 0:
                    class_distribution.append({
                        'class_id': cls.id,
                        'class_name': cls.class_name,
                        'class_code': cls.class_code,
                        'student_count': count
                    })
            
            # Recent admissions (last 30 days)
            thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
            recent_admissions = Student.objects.filter(
                admission_date__gte=thirty_days_ago
            ).count()
            
            return Response({
                'success': True,
                'data': {
                    'total_students': total_students,
                    'active_students': active_students,
                    'male_students': male_students,
                    'female_students': female_students,
                    'recent_admissions': recent_admissions,
                    'class_distribution': class_distribution
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting student statistics: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to get statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadTemplateView(APIView):
    """Download Excel template for student import"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Create sample data matching Student model
            sample_data = [{
                'admission_no': f'ADM-{timezone.now().strftime("%Y%m")}-1',
                'first_name': 'John',
                'middle_name': 'Kiprop',
                'last_name': 'Mwangi',
                'date_of_birth': '2010-05-15',
                'gender': 'Male',
                'nationality': 'Kenyan',
                'religion': 'Christian',
                'blood_group': 'O+',
                'address': '123 Main Street',
                'city': 'Nairobi',
                'country': 'Kenya',
                'phone': '0712345678',
                'email': 'john@example.com',
                'current_class': '1',  # Class ID
                'stream': 'Science',
                'roll_number': '12',
                'admission_date': timezone.now().date().isoformat(),
                'admission_type': 'Regular',
                'father_name': 'Peter Mwangi',
                'father_phone': '0723456789',
                'father_email': 'peter@example.com',
                'father_occupation': 'Engineer',
                'mother_name': 'Mary Mwangi',
                'mother_phone': '0734567890',
                'mother_email': 'mary@example.com',
                'mother_occupation': 'Teacher',
                'guardian_name': 'Peter Mwangi',
                'guardian_relation': 'Father',
                'guardian_phone': '0723456789',
                'guardian_email': 'peter@example.com',
                'guardian_address': '123 Main Street',
                'medical_conditions': 'None',
                'allergies': 'Peanuts',
                'medication': 'None',
                'emergency_contact': '0723456789',
                'emergency_contact_name': 'Peter Mwangi',
                'previous_school': 'ABC Primary',
                'previous_class': 'Class 7',
                'transfer_certificate_no': 'TC12345',
                'status': 'Active',
                'expected_graduation_date': '2026-12-31'
            }]
            
            # Create DataFrame
            df = pd.DataFrame(sample_data)
            
            # Create Excel file in memory
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Template', index=False)
                
                # Auto-adjust column widths
                worksheet = writer.sheets['Template']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 30)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            
            # Create response
            response = HttpResponse(
                output.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="student_import_template.xlsx"'
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating template: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to generate template'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#FEE =======================================VIEWS=============================
class FeeCategoryViewSet(viewsets.ModelViewSet):
    queryset = FeeCategory.objects.all().order_by('-created_at')
    serializer_class = FeeCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search_term = self.request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(category_code__icontains=search_term) |
                Q(category_name__icontains=search_term) |
                Q(description__icontains=search_term)
            )
        
        # Filter by status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get fee category statistics"""
        total_categories = FeeCategory.objects.count()
        active_categories = FeeCategory.objects.filter(is_active=True).count()
        mandatory_categories = FeeCategory.objects.filter(is_mandatory=True).count()
        
        stats_data = {
            'total': total_categories,
            'active_count': active_categories,
            'mandatory_count': mandatory_categories
        }
        
        serializer = CategoryStatsSerializer(data=stats_data)
        serializer.is_valid()
        return Response({
            'success': True,
            'message': 'Category statistics retrieved successfully',
            'data': serializer.data
        })

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all().order_by('-academic_year', '-created_at')
    serializer_class = FeeStructureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search_term = self.request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(academic_year__icontains=search_term) |
                Q(category__category_name__icontains=search_term) |
                Q(category__category_code__icontains=search_term) |
                Q(class_id__class_name__icontains=search_term)
            )
        
        # Filter by academic year
        academic_year = self.request.query_params.get('academic_year', '')
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        
        # Filter by term
        term = self.request.query_params.get('term', '')
        if term:
            queryset = queryset.filter(term=term)
        
        # Filter by class
        class_id = self.request.query_params.get('class_id', '')
        if class_id:
            queryset = queryset.filter(class_id_id=class_id)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.select_related('class_id', 'category', 'created_by')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get fee structure statistics"""
        total_structures = FeeStructure.objects.count()
        active_structures = FeeStructure.objects.filter(is_active=True).count()
        
        # Calculate total amount of active structures
        total_amount_result = FeeStructure.objects.filter(
            is_active=True
        ).aggregate(
            total=Coalesce(Sum('amount'), Value(0, output_field=DecimalField()))
        )
        total_amount = total_amount_result['total_amount']
        
        
        stats_data = {
            'total': total_structures,
            'active_count': active_structures,
            'total_amount': total_amount
        }
        
        serializer = StructureStatsSerializer(data=stats_data)
        serializer.is_valid()
        return Response({
            'success': True,
            'message': 'Structure statistics retrieved successfully',
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def academic_years(self, request):
        """Get distinct academic years"""
        academic_years = FeeStructure.objects.values_list(
            'academic_year', flat=True
        ).distinct().order_by('-academic_year')
        
        # If no academic years exist, generate current academic year
        if not academic_years:
            current_year = timezone.now().year
            current_month = timezone.now().month
            if current_month >= 6:  # June or later
                academic_years = [f"{current_year}-{current_year + 1}"]
            else:
                academic_years = [f"{current_year - 1}-{current_year}"]
        
        return Response({
            'success': True,
            'message': 'Academic years retrieved successfully',
            'data': list(academic_years)
        })

class FeeTransactionViewSet(viewsets.ModelViewSet):
    queryset = FeeTransaction.objects.all().order_by('-payment_date', '-created_at')
    serializer_class = FeeTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search_term = self.request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(transaction_no__icontains=search_term) |
                Q(student__admission_no__icontains=search_term) |
                Q(student__first_name__icontains=search_term) |
                Q(student__last_name__icontains=search_term) |
                Q(payment_reference__icontains=search_term)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', '')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment mode
        payment_mode = self.request.query_params.get('payment_mode', '')
        if payment_mode:
            queryset = queryset.filter(payment_mode=payment_mode)
        
        # Date range filter
        start_date = self.request.query_params.get('start_date', '')
        end_date = self.request.query_params.get('end_date', '')
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        # Limit results
        limit = self.request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        return queryset.select_related('student', 'collected_by')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get fee transaction statistics"""
        # Get all transactions
        all_transactions = FeeTransaction.objects.all()
        
        # Basic counts
        total_transactions = all_transactions.count()
        completed_transactions = all_transactions.filter(status='Completed').count()
        pending_transactions = all_transactions.filter(status='Pending').count()
        
        # Calculate total collected amount
        total_collected_result = all_transactions.filter(
            status='Completed'
        ).aggregate(
            total=Coalesce(Sum('amount_kes'), Value(0, output_field=DecimalField()))
        )
        total_collected = total_collected_result['total']
        
        stats_data = {
            'total_transactions': total_transactions,
            'completed_transactions': completed_transactions,
            'pending_transactions': pending_transactions,
            'total_collected': total_collected
        }
        
        serializer = TransactionStatsSerializer(data=stats_data)
        serializer.is_valid()
        return Response({
            'success': True,
            'message': 'Transaction statistics retrieved successfully',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def mark_as_printed(self, request, pk=None):
        """Mark a specific transaction receipt as printed and log the event"""
        transaction = self.get_object()
        
        # 1. Update the transaction record
        transaction.receipt_printed = True
        transaction.receipt_printed_at = timezone.now()
        transaction.receipt_printed_by = request.user
        transaction.save()
        
        # 2. Log the event in the AuditLog
        AuditLog.objects.create(
            event_type='FEE_UPDATE',
            user=request.user,
            username=request.user.username,
            table_name='FeeTransaction',
            record_id=transaction.id,
            operation='UPDATE',
            new_values={'receipt_printed': True},
            ip_address=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            http_method=request.method,
            request_id=uuid.uuid4()
        )
        
        return Response({'success': True, 'message': 'Receipt marked as printed'})

class FeeDashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # 1. Category Stats
            total_categories = FeeCategory.objects.count()
            active_categories = FeeCategory.objects.filter(is_active=True).count()
            mandatory_categories = FeeCategory.objects.filter(is_mandatory=True).count()
            
            # 2. Structure Stats
            # Note: We define the key as 'res' to keep it simple and consistent
            struct_sum = FeeStructure.objects.filter(is_active=True).aggregate(
                res=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
            )
            total_amount = struct_sum['res']
            
            # 3. Transaction Stats
            all_trans = FeeTransaction.objects.all()
            trans_sum = all_trans.filter(status='Completed').aggregate(
                res=Coalesce(Sum('amount_kes'), Value(0), output_field=DecimalField())
            )
            total_collected = trans_sum['res']

            # Basic Counts
            total_trans_count = all_trans.count()
            completed_count = all_trans.filter(status='Completed').count()
            
            # Calculations
            collection_rate = (completed_count / total_trans_count * 100) if total_trans_count > 0 else 0
            avg_val = (float(total_collected) / completed_count) if completed_count > 0 else 0

            

            academic_year = request.query_params.get('academic_year')
            term = request.query_params.get('term')

            # Filter transactions by the specific term provided by the frontend
            transactions_qs = FeeTransaction.objects.filter(status='Completed')
            if academic_year:
                transactions_qs = transactions_qs.filter(invoice__academic_year=academic_year)
            if term:
                transactions_qs = transactions_qs.filter(invoice__term=term)

            data = {
                'categories': {
                    'total': total_categories,
                    'active_count': active_categories,
                    'mandatory_count': mandatory_categories
                },
                'structures': {
                    'total': FeeStructure.objects.count(),
                    'active_count': FeeStructure.objects.filter(is_active=True).count(),
                    'total_amount': total_amount
                },
                'transactions': {
                    'total_transactions': transactions_qs.count(),
                    'completed_transactions': completed_count,
                    'pending_transactions': all_trans.filter(status='Pending').count(),
                    'total_collected': transactions_qs.aggregate(s=Sum('amount_kes'))['s'] or 0,
                    'collection_rate': round(collection_rate, 2),
                    'avg_transaction': round(avg_val, 2),
                    'unique_students': transactions_qs.values('student').distinct().count(),
                    'active_invoices': StudentFeeInvoice.objects.filter(status='UNPAID').count(),
                    'average_amount': transactions_qs.aggregate(a=Avg('amount_kes'))['a'] or 0
                    
                },
                'recent_transactions': FeeTransactionSerializer(all_trans.order_by('-payment_date')[:10], many=True).data,
                'recent_structures': FeeStructureSerializer(FeeStructure.objects.all().order_by('-created_at')[:5], many=True).data,
                'payment_methods': list(FeeTransaction.objects.values('payment_mode')
                    .annotate(total_amount=Sum('amount_kes'))
                    .order_by('-total_amount')),
                'top_students': list(FeeTransaction.objects.values(
                        'student__admission_no', 'student__first_name', 'student__last_name'
                    )
                    .annotate(total_paid=Sum('amount_kes'), transaction_count=Count('id'))
                    .order_by('-total_paid')[:5]),
            }

            return Response({'success': True, 'data': data})
        except Exception as e:
            print(f"CRITICAL DASHBOARD ERROR: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)
class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})
    
class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Staff.objects.filter(status='Active')
    serializer_class = StaffSerializer # Create this in serializers.py

class PayrollPeriodViewSet(viewsets.ModelViewSet):
    queryset = PayrollPeriod.objects.all().order_by('-start_date')
    serializer_class = PayrollPeriodSerializer

    @action(detail=True, methods=['post'])
    def process_payroll(self, request, pk=None):
        period = self.get_object()
        active_staff = Staff.objects.filter(status='Active')
        components = PayrollComponent.objects.filter(is_active=True)
        
        created_count = 0
        for staff in active_staff:
            # 1. Calculate Earnings
            earnings = sum(c.fixed_amount or 0 for c in components if c.component_type in ['Earning', 'Allowance'])
            
            # 2. Calculate Deductions
            deductions = 0
            for d in components.filter(component_type='Deduction'):
                if d.calculation_type == 'Percentage of Basic':
                    deductions += (staff.basic_salary * (d.percentage_rate / 100))
                else:
                    deductions += (d.fixed_amount or 0)

            # 3. Create Record (Payslip)
            PayrollRecord.objects.update_or_create(
                payroll_period=period,
                staff=staff,
                defaults={
                    'basic_salary': staff.basic_salary,
                    'allowances_total': earnings,
                    'total_deductions': deductions,
                    # .save() in model handles net_salary logic
                }
            )
            created_count += 1
        
        period.status = 'Calculated'
        period.save()
        
        return Response({
            "success": True, 
            "message": f"Processed {created_count} payslips for {period.period_name}"
        })
class PayrollComponentViewSet(viewsets.ModelViewSet):
    queryset = PayrollComponent.objects.all()
    serializer_class = PayrollComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class GenerateInvoicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 1. Capture dynamic values from frontend
        student_id = request.data.get('student_id')
        academic_year = request.data.get('academic_year', '2026/2027 Academic Year')
        term = request.data.get('term')

        if not academic_year or not term:
            return Response(
                {"success": False, "error": "Academic Year and Term are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Select students
        if student_id:
            students = Student.objects.filter(id=student_id, status='Active')
        else:
            students = Student.objects.filter(status='Active')

        if not students.exists():
            return Response({"success": False, "error": "No active students found"}, status=404)

        created_count = 0
        skipped_count = 0
        error_logs = []

        # Use transaction to prevent partial data
        with transaction.atomic():
            for student in students:
                try:
                    # 3. CRITICAL: Validate student class
                    if not student.current_class:
                        skipped_count += 1
                        continue

                    # 4. Find matching Fee Structures
                    structures = FeeStructure.objects.filter(
                        class_id=student.current_class,
                        academic_year=academic_year,
                        term=term,
                        is_active=True
                    )

                    if not structures.exists():
                        skipped_count += 1
                        continue

                    # 5. Check if already invoiced
                    if StudentFeeInvoice.objects.filter(
                        student=student, academic_year=academic_year, term=term
                    ).exclude(status='Cancelled').exists():
                        skipped_count += 1
                        continue

                    # 6. Create Invoice Parent
                    invoice = StudentFeeInvoice.objects.create(
                        student=student,
                        academic_year=academic_year,
                        term=term,
                        due_date=structures.first().due_date,
                        created_by=request.user,
                        status='Pending',
                        payment_status='Unpaid'
                    )

                    total_amount = 0
                    # 7. Create Line Items
                    for struct in structures:
                        InvoiceItem.objects.create(
                            invoice=invoice,
                            fee_structure=struct,
                            description=f"{struct.category.category_name}",
                            unit_price=struct.amount,
                            quantity=1
                        )
                        total_amount += struct.amount

                    # 8. Update Totals
                    invoice.subtotal = total_amount
                    invoice.save() # save() handles total_amount and balance_amount
                    created_count += 1

                except Exception as e:
                    error_logs.append(f"Student {student.id}: {str(e)}")
                    skipped_count += 1

        return Response({
            "success": True,
            "message": f"Generated {created_count} invoices. Skipped {skipped_count}.",
            "data": {"created": created_count, "skipped": skipped_count, "errors": error_logs}
        }, status=status.HTTP_201_CREATED)
@api_view(['GET'])
def current_period_view(request):
    now = timezone.now().date()
    # Find the term where today's date falls between start and end
    current_term = Term.objects.filter(start_date__lte=now, end_date__gte=now).first()
    
    if not current_term:
        # Fallback to the one marked is_current if date range fails
        current_term = Term.objects.filter(is_current=True).first()

    return Response({
        "success": True,
        "data": {
            "academic_year": current_term.academic_year.year_name if current_term else "None",
            "term": current_term.term if current_term else "None",
            "year_id": current_term.academic_year.id if current_term else None,
            "term_id": current_term.id if current_term else None
        }
    })
class CurriculumTreeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # This one call fetches everything due to the nesting in serializers
        areas = LearningArea.objects.filter(is_active=True).prefetch_related(
            'strands__substrands__competencies'
        )
        serializer = LearningAreaSerializer(areas, many=True)
        return Response({'success': True, 'data': serializer.data})   
    
class AcademicYearViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    
class TermViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    
class AssessmentWindowViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = AssessmentWindow.objects.all()
    serializer_class = AssessmentWindowSerializer
class LearningAreaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = LearningArea.objects.all()
    serializer_class = LearningAreaSerializer
class StrandViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Strand.objects.all()
    serializer_class = StrandSerializer
class SubStrandViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SubStrand.objects.all()
    serializer_class = SubStrandSerializer
class CompetencyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer
    
class CBEReportCardViewSet(viewsets.ModelViewSet):
    queryset = CBEReportCard.objects.all()
    serializer_class = CBEReportCardSerializer
    

    @action(detail=False, methods=['post'])
    def batch_generate(self, request):
        class_id = request.data.get('class_id')
        term_id = request.data.get('term')

        if not class_id or not term_id:
            return Response({"error": "class_id and term are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_instance = Class.objects.get(id=class_id)
            term_instance = Term.objects.get(id=term_id)
            
            generate_class_reports(class_instance, term_instance)
            
            return Response({"message": "Reports generated successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='download')
    def download_report(self, request, pk=None):
        """Download a single report card as PDF"""
        try:
            report = self.get_object()
            
            # Create a BytesIO buffer
            buffer = BytesIO()
            
            # Create the PDF document
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            
            # Container for story
            story = []
            
            # Styles
            styles = getSampleStyleSheet()
            
            # Title
            story.append(Paragraph("CBE Report Card", styles['Title']))
            story.append(Spacer(1, 0.3*inch))
            
            # Student Information
            story.append(Paragraph("Student Information", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))
            
            # Get student name from related student object
            student_name = "Unknown"
            if report.student:
                if hasattr(report.student, 'first_name') and hasattr(report.student, 'last_name'):
                    student_name = f"{report.student.first_name} {report.student.last_name}"
                elif hasattr(report.student, 'name'):
                    student_name = report.student.name
                elif hasattr(report.student, 'username'):
                    student_name = report.student.username
            
            info_text = f"""
            <b>Student Name:</b> {student_name}<br/>
            <b>Report ID:</b> {report.report_id or 'N/A'}<br/>
            <b>Academic Year:</b> {report.academic_year or 'N/A'}<br/>
            <b>Term:</b> {report.term or 'N/A'}<br/>
            <b>Reporting Date:</b> {report.reporting_date.strftime('%Y-%m-%d') if report.reporting_date else 'N/A'}<br/>
            <b>Status:</b> {"Published" if report.is_published else "Draft"}
            """
            story.append(Paragraph(info_text, styles['Normal']))
            story.append(Spacer(1, 0.3*inch))
            
            # Learning Areas Performance
            story.append(Paragraph("Learning Areas Performance", styles['Heading2']))
            story.append(Spacer(1, 0.1*inch))
            
            if report.learning_area_performance:
                table_data = [['Learning Area', 'Score (%)', 'Rating']]
                for area in report.learning_area_performance:
                    if isinstance(area, dict):
                        table_data.append([
                            area.get('learning_area', 'N/A'),
                            f"{area.get('score_percentage', 0)}%",
                            area.get('rating', 'Not Rated')
                        ])
                    else:
                        table_data.append([
                            getattr(area, 'learning_area', 'N/A'),
                            f"{getattr(area, 'score_percentage', 0)}%",
                            getattr(area, 'rating', 'Not Rated')
                        ])
                
                table = Table(table_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ]))
                story.append(table)
            else:
                story.append(Paragraph("No learning area data available", styles['Normal']))
            
            story.append(Spacer(1, 0.3*inch))
            
            # Core Competencies
            if report.core_competencies:
                story.append(Paragraph("Core Competencies", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                
                comp_data = [['Competency', 'Rating']]
                for comp in report.core_competencies:
                    if isinstance(comp, dict):
                        comp_data.append([
                            comp.get('competency', 'N/A'),
                            comp.get('rating', 'Not Rated')
                        ])
                    else:
                        comp_data.append([
                            getattr(comp, 'competency', 'N/A'),
                            getattr(comp, 'rating', 'Not Rated')
                        ])
                
                comp_table = Table(comp_data, colWidths=[3*inch, 3*inch])
                comp_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ]))
                story.append(comp_table)
                story.append(Spacer(1, 0.3*inch))
            
            # Values Assessment
            if report.values_assessment:
                story.append(Paragraph("Values Assessment", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                
                values_data = [['Value', 'Rating']]
                for value in report.values_assessment:
                    if isinstance(value, dict):
                        values_data.append([
                            value.get('value', 'N/A'),
                            value.get('rating', 'Not Rated')
                        ])
                    else:
                        values_data.append([
                            getattr(value, 'value', 'N/A'),
                            getattr(value, 'rating', 'Not Rated')
                        ])
                
                values_table = Table(values_data, colWidths=[2*inch, 4*inch])
                values_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ]))
                story.append(values_table)
                story.append(Spacer(1, 0.3*inch))
            
            # Attendance Summary
            if report.learner_attendance_summary:
                story.append(Paragraph("Attendance Summary", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                
                try:
                    attendance = report.learner_attendance_summary
                    if isinstance(attendance, str):
                        attendance = json.loads(attendance)
                    
                    attendance_data = [
                        ["Total School Days:", str(attendance.get('total_school_days', 0))],
                        ["Days Present:", str(attendance.get('days_present', 0))],
                        ["Days Absent:", str(attendance.get('days_absent', 0))],
                        ["Attendance Percentage:", f"{attendance.get('attendance_percentage', 0)}%"],
                    ]
                    
                    attendance_table = Table(attendance_data, colWidths=[2*inch, 2*inch])
                    attendance_table.setStyle(TableStyle([
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 10),
                        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
                        ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('TOPPADDING', (0, 0), (-1, -1), 5),
                    ]))
                    story.append(attendance_table)
                    story.append(Spacer(1, 0.3*inch))
                except:
                    pass
            
            # Competency Summary
            if report.competency_summary:
                story.append(Paragraph("Overall Competency Summary", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                
                summary = report.competency_summary
                if isinstance(summary, str):
                    summary = json.loads(summary)
                
                summary_data = [
                    ["Exceeding Expectations:", str(summary.get('Exceeding Expectations', 0))],
                    ["Meeting Expectations:", str(summary.get('Meeting Expectations', 0))],
                    ["Approaching Expectations:", str(summary.get('Approaching Expectations', 0))],
                    ["Below Expectations:", str(summary.get('Below Expectations', 0))],
                ]
                
                summary_table = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
                summary_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 11),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#64748b')),
                    ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                ]))
                story.append(summary_table)
                story.append(Spacer(1, 0.3*inch))
            
            # Teacher Remarks
            if report.teacher_remarks:
                story.append(Paragraph("Teacher's Remarks", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph(report.teacher_remarks, styles['Normal']))
                story.append(Spacer(1, 0.2*inch))
            
            # Head Teacher Remarks
            if report.head_teacher_remarks:
                story.append(Paragraph("Head Teacher's Remarks", styles['Heading2']))
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph(report.head_teacher_remarks, styles['Normal']))
            
            # Build PDF
            doc.build(story)
            
            # Get PDF value
            pdf = buffer.getvalue()
            buffer.close()
            
            # Return PDF response
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_card_{report.report_id or report.id}.pdf"'
            response['Access-Control-Allow-Origin'] = '*'
            
            return response
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print("=" * 50)
            print("PDF Generation Error:")
            print(error_details)
            print("=" * 50)
            return HttpResponse(f"Error generating PDF: {str(e)}", status=500, content_type='text/plain')
        
    @action(detail=True, methods=['post'], url_path='publish')
    def publish_report(self, request, pk=None):
        """Publish a report card"""
        try:
            report = self.get_object()
            
            # Update the report status
            report.is_published = True
            report.published_date = timezone.now()
            report.save()
            
            return Response({
                'success': True,
                'message': f'Report {report.report_id} published successfully',
                'data': {
                    'id': report.id,
                    'is_published': report.is_published,
                    'published_date': report.published_date
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs"""
    permission_classes = [IsAuthenticated]
    serializer_class = AuditLogSerializer
    
    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-created_at')
        
        # Filter by student_id if provided
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(record_id=student_id, model_name='Student')
        
        return queryset
    
class BackupViewSet(viewsets.ViewSet):
    """ViewSet for database backup and restore operations"""
    permission_classes = [IsAuthenticated]

    def get_backup_dir(self):
        """Get the backup directory path"""
        backup_dir = os.path.join(settings.BASE_DIR, 'database_backups')
        os.makedirs(backup_dir, exist_ok=True)
        return backup_dir

    @action(detail=False, methods=['get'], url_path='list')
    def list_backups(self, request):
        """List all available backups"""
        try:
            backup_dir = self.get_backup_dir()
            backups = []
            
            if os.path.exists(backup_dir):
                for filename in os.listdir(backup_dir):
                    if filename.endswith('.zip') or filename.endswith('.json'):
                        file_path = os.path.join(backup_dir, filename)
                        stat = os.stat(file_path)
                        
                        # Try to get metadata
                        meta = BackupMetadata.objects.filter(backup_name=filename).first()
                        
                        backup_type = 'FULL'
                        if 'schema' in filename.lower():
                            backup_type = 'SCHEMA'
                        elif 'data' in filename.lower():
                            backup_type = 'DATA'
                        
                        backups.append({
                            'id': filename,
                            'backup_name': filename,
                            'backup_type': backup_type,
                            'file_path': file_path,
                            'file_size': self.get_file_size(stat.st_size),
                            'backup_start': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            'status': 'COMPLETED',
                            'verification_status': True,
                            'is_verified': True,
                            'duration_seconds': meta.duration_seconds if meta else 0,
                            'created_by': meta.created_by.username if meta and meta.created_by else None,
                            'notes': meta.notes if meta else None
                        })
            
            backups.sort(key=lambda x: x['backup_start'], reverse=True)
            
            return Response({
                'success': True,
                'backups': backups,
                'count': len(backups)
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """Get backup statistics"""
        try:
            backup_dir = self.get_backup_dir()
            
            # Get stats from files (most reliable)
            backup_files = []
            total_size = 0
            
            if os.path.exists(backup_dir):
                for filename in os.listdir(backup_dir):
                    if filename.endswith('.zip') or filename.endswith('.json'):
                        file_path = os.path.join(backup_dir, filename)
                        stat = os.stat(file_path)
                        backup_files.append({
                            'filename': filename,
                            'size': stat.st_size,
                            'created': datetime.fromtimestamp(stat.st_mtime)
                        })
                        total_size += stat.st_size
            
            total_backups = len(backup_files)
            
            # Get metadata for durations
            all_metadata = BackupMetadata.objects.all()
            durations = [m.duration_seconds for m in all_metadata if m.duration_seconds > 0]
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            # Calculate success rate (if we have files, assume they're successful)
            success_rate = 100 if total_backups > 0 else 0
            
            return Response({
                'success': True,
                'stats': {
                    'totalBackups': total_backups,
                    'completedBackups': total_backups,
                    'failedBackups': 0,
                    'totalSize': self.get_file_size(total_size),
                    'avg_duration': round(avg_duration, 1),
                    'successRate': success_rate,
                    'verifiedBackups': total_backups
                }
            })
            
        except Exception as e:
            print(f"Error in stats: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='system-info')
    def get_system_info(self, request):
        """Get system information"""
        try:
            backup_dir = self.get_backup_dir()
            
            db_name = settings.DATABASES['default'].get('NAME', 'Unknown')
            db_host = settings.DATABASES['default'].get('HOST', 'localhost')
            db_engine = settings.DATABASES['default'].get('ENGINE', 'Unknown')
            
            disk_usage = shutil.disk_usage(backup_dir)
            
            return Response({
                'success': True,
                'info': {
                    'database': db_name,
                    'database_size': 'N/A',
                    'host': db_host,
                    'backup_dir': backup_dir,
                    'disk_space': self.get_file_size(disk_usage.total),
                    'disk_free': self.get_file_size(disk_usage.free),
                    'disk_used': self.get_file_size(disk_usage.total - disk_usage.free),
                    'retention_days': 30,
                    'database_engine': db_engine
                }
            })
            
        except Exception as e:
            print(f"Error in system-info: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='create')
    def create_backup(self, request):
        """Create a new database backup"""
        start_time = datetime.now()
        backup_type = request.data.get('type', 'full').upper()
        notes = request.data.get('notes', '')
        
        try:
            backup_dir = self.get_backup_dir()
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = f"backup_{timestamp}_{backup_type}.zip"
            backup_path = os.path.join(backup_dir, backup_name)
            
            # Create temp file for dump
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
                temp_path = tmp_file.name
            
            try:
                # Dump data
                with open(temp_path, 'w') as f:
                    if backup_type == 'SCHEMA':
                        call_command('dumpdata', stdout=f)
                    elif backup_type == 'DATA':
                        call_command('dumpdata', exclude=['contenttypes', 'auth.permission'], stdout=f)
                    else:
                        call_command('dumpdata', exclude=['contenttypes', 'auth.permission', 'sessions.session'], stdout=f)
                
                # Create zip
                with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    zipf.write(temp_path, os.path.basename(temp_path))
                    
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            # Calculate duration
            duration_seconds = (datetime.now() - start_time).total_seconds()
            file_size = os.path.getsize(backup_path)
            
            # Save metadata
            BackupMetadata.objects.create(
                backup_name=backup_name,
                backup_type=backup_type,
                file_size=file_size,
                duration_seconds=duration_seconds,
                status='COMPLETED',
                created_by=request.user,
                backup_path=backup_path,
                verification_status=True,
                notes=notes
            )
            
            return Response({
                'success': True,
                'message': f'{backup_type} backup created successfully: {backup_name}',
                'backup_id': backup_name,
                'backup_path': backup_path,
                'duration': duration_seconds,
                'file_size': self.get_file_size(file_size)
            })
            
        except Exception as e:
            import traceback
            print("Backup error:", traceback.format_exc())
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'], url_path='delete/(?P<backup_id>.+)')
    def delete_backup(self, request, backup_id=None):
        """Delete a backup"""
        try:
            import urllib.parse
            backup_id = urllib.parse.unquote(backup_id)
            backup_dir = self.get_backup_dir()
            backup_path = os.path.join(backup_dir, backup_id)
            
            if not os.path.exists(backup_path):
                return Response({
                    'success': False,
                    'error': f'Backup file not found: {backup_id}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            os.remove(backup_path)
            BackupMetadata.objects.filter(backup_name=backup_id).delete()
            
            return Response({
                'success': True,
                'message': f'Backup {backup_id} deleted successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='download/(?P<backup_id>.+)')
    def download_backup(self, request, backup_id=None):
        """Download a backup file"""
        try:
            import urllib.parse
            backup_id = urllib.parse.unquote(backup_id)
            backup_dir = self.get_backup_dir()
            backup_path = os.path.join(backup_dir, backup_id)
            
            if not os.path.exists(backup_path):
                return Response({
                    'success': False,
                    'error': f'Backup file not found: {backup_id}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            response = FileResponse(
                open(backup_path, 'rb'),
                as_attachment=True,
                filename=backup_id
            )
            return response
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='restore/(?P<backup_id>.+)')
    def restore_backup(self, request, backup_id=None):
        """Restore a backup"""
        try:
            import urllib.parse
            backup_id = urllib.parse.unquote(backup_id)
            backup_dir = self.get_backup_dir()
            backup_path = os.path.join(backup_dir, backup_id)
            
            if not os.path.exists(backup_path):
                return Response({
                    'success': False,
                    'error': f'Backup file not found: {backup_id}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Extract if zip
            if backup_path.endswith('.zip'):
                with zipfile.ZipFile(backup_path, 'r') as zipf:
                    json_filename = zipf.namelist()[0]
                    zipf.extractall(backup_dir)
                    backup_path = os.path.join(backup_dir, json_filename)
            
            # Restore
            call_command('loaddata', backup_path)
            
            # Clean up extracted file
            if backup_path.endswith('.json'):
                os.remove(backup_path)
            
            return Response({
                'success': True,
                'message': 'Database restored successfully'
            })
            
        except Exception as e:
            import traceback
            print("Restore error:", traceback.format_exc())
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='clean')
    def clean_backups(self, request):
        """Clean old backups"""
        try:
            backup_dir = self.get_backup_dir()
            retention_days = int(request.data.get('retention_days', 30))
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            deleted_count = 0
            
            if os.path.exists(backup_dir):
                for filename in os.listdir(backup_dir):
                    file_path = os.path.join(backup_dir, filename)
                    stat = os.stat(file_path)
                    file_date = datetime.fromtimestamp(stat.st_mtime)
                    
                    if file_date < cutoff_date:
                        os.remove(file_path)
                        BackupMetadata.objects.filter(backup_name=filename).delete()
                        deleted_count += 1
            
            return Response({
                'success': True,
                'message': f'Cleaned {deleted_count} old backup(s)',
                'deleted_count': deleted_count
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @staticmethod
    def get_file_size(size_bytes):
        """Convert bytes to human readable format"""
        if size_bytes == 0:
            return '0 Bytes'
        
        size_names = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.2f} {size_names[i]}"