# urls.py (Fixed Pattern Priority)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views



router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'ip-whitelist', views.IPWhitelistViewSet, basename='ip-whitelist')
router.register(r'sessions', views.UserSessionViewSet, basename='session')
router.register(r'notifications', views.NotificationViewSet, basename='notification')


router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-log')

router.register(r'backups', views.BackupViewSet, basename='backup')


router.register(r'academic-years', views.AcademicYearViewSet, basename='academic-year')
router.register(r'terms', views.TermViewSet, basename='term')
router.register(r'assessment-windows', views.AssessmentWindowViewSet, basename='assessment-window')
router.register(r'learning-areas', views.LearningAreaViewSet, basename='learning-area')
router.register(r'strands', views.StrandViewSet, basename='strand')
router.register(r'substrands', views.SubStrandViewSet, basename='substrand')
router.register(r'competencies', views.CompetencyViewSet, basename='competency')
router.register(r'cbe-report-cards', views.CBEReportCardViewSet, basename='cbe-report-card')


fee_router = DefaultRouter()
fee_router.register(r'fees/categories', views.FeeCategoryViewSet, basename='fee-categories')
fee_router.register(r'fees/structures', views.FeeStructureViewSet, basename='fee-structures')
fee_router.register(r'fees/transactions', views.FeeTransactionViewSet, basename='fee-transactions')
fee_router.register(r'expenses', views.ExpenseViewSet, basename='expenses')

router.register(r'expense-categories', views.ExpenseCategoryViewSet, basename='expense-category')
router.register(r'payment-methods', views.PaymentMethodViewSet, basename='payment-method')

router.register(r'staff', views.StaffViewSet, basename='staff')
router.register(r'payroll-components', views.PayrollComponentViewSet, basename='payroll-components')
router.register(r'payroll-periods', views.PayrollPeriodViewSet, basename='payroll-periods')

urlpatterns = [
    # 1. Authentication endpoints
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/auth/refresh-token/', views.RefreshTokenView.as_view(), name='refresh-token'),
    path('api/auth/validate-token/', views.ValidateTokenView.as_view(), name='validate-token'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # 2. MFA endpoints
    path('api/auth/mfa/', views.MFAView.as_view(), name='mfa'),
    path('api/auth/mfa/setup/', views.MFASetupView.as_view(), name='mfa-setup'),
    path('api/auth/mfa/verify/', views.MFAVerifyView.as_view(), name='mfa-verify'),
    
    # 3. Dashboard & System status
    path('api/auth/dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('api/auth/system-status/', views.system_status, name='system-status'),
    
    # 4. Explicit Student Management Endpoints (EVALUATED FIRST)
    path('api/students/import/', views.StudentBulkImportView.as_view(), name='student-import'),
    path('api/students/generate-admission-no/', views.GenerateAdmissionNumberView.as_view(), name='generate-admission-no'),
    path('api/students/statistics/', views.StudentStatisticsView.as_view(), name='student-statistics'),
    path('api/students/download-template/', views.DownloadTemplateView.as_view(), name='download-template'),
    path('api/students/generate-admission-number/', views.GenerateAdmissionNumberView.as_view(), name='generate-admission-no'),

    # 5. Classes management 
    path('api/classes/', views.ClassListAPIView.as_view(), name='class-list'),
    path('api/classes/create/', views.ClassCreateAPIView.as_view(), name='class-create'),
    path('api/classes/update/<int:class_id>/', views.ClassUpdateAPIView.as_view(), name='class-update'),
    path('api/classes/delete/<int:class_id>/', views.ClassDeleteAPIView.as_view(), name='class-delete'),
    path('api/teachers/', views.TeacherListAPIView.as_view(), name='teacher-list'),
    
    path('api/streams/', views.StreamListView.as_view(), name='stream-list'),
    
    
    
    # 6. Additional fee endpoints
    path('api/fees/dashboard/', views.FeeDashboardAPIView.as_view(), name='fee-dashboard'),
    path('api/fees/structures/academic-years/', 
         views.FeeStructureViewSet.as_view({'get': 'academic_years'}), 
         name='fee-academic-years'),
    path('api/fees/categories/stats/', 
         views.FeeCategoryViewSet.as_view({'get': 'stats'}), 
         name='fee-categories-stats'),
    path('api/fees/structures/stats/', 
         views.FeeStructureViewSet.as_view({'get': 'stats'}), 
         name='fee-structures-stats'),
    path('api/fees/transactions/stats/', 
         views.FeeTransactionViewSet.as_view({'get': 'stats'}), 
         name='fee-transactions-stats'),
    path('api/fees/generate-invoices/', views.GenerateInvoicesView.as_view(), name='generate-invoices'),
    path('api/fees/current-period/', views.current_period_view, name='current-period'),
    
    path('api/curriculum/', views.CurriculumTreeView.as_view(), name='curriculum-tree'),    

    # 7. Fallback Wildcard Routers (EVALUATED LAST)
    path('api/', include(fee_router.urls)),
    path('api/', include(router.urls)),
]