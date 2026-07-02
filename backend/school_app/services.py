# backend/school_app/services.py
from .models import SummativeRating, CBEReportCard, Student, Term, AttendanceSession, Class, SessionTemplate
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def calculate_competency_level(internal_value):
    if internal_value >= 4: return "EE"
    if internal_value >= 3: return "ME"
    if internal_value >= 2: return "AE"
    return "BE"

def compile_student_report_data(student, term):
    ratings = SummativeRating.objects.filter(
        student=student, 
        assessment__assessment_window__term=term
    )
    
    competency_ratings = {}
    performance = []
    
    for rating in ratings:
        comp = rating.competency
        competency_ratings[comp.competency_code] = rating.rating
        
        performance.append({
            "learning_area": comp.substrand.strand.learning_area.area_name,
            "strand": comp.substrand.strand.strand_name,
            "level": rating.rating
        })
        
    return {
        "competency_ratings": competency_ratings,
        "learning_area_performance": performance
    }

def generate_class_reports(class_instance, term):
    # Get all students in the class
    students = Student.objects.filter(current_class=class_instance)
    
    for student in students:
        report_data = compile_student_report_data(student, term)
        
        # Create or update the report card
        CBEReportCard.objects.update_or_create(
            student=student,
            term=term.term,
            academic_year=term.academic_year.year_code,
            defaults={
                "report_type": "Learner Progress Report",
                "competency_ratings": report_data['competency_ratings'],
                "learning_area_performance": report_data['learning_area_performance'],
                "is_published": False
            }
        )
        
        


def generate_attendance_sessions():
    """
    Generates attendance sessions for every active class on every weekday of the current term,
    using active SessionTemplates for start/end times and session_type names.
    """
    term = Term.objects.filter(is_current=True).first()
    if not term:
        return "No current term found."

    active_classes = Class.objects.filter(is_active=True)
    if not active_classes.exists():
        return "No active classes found."

    templates = SessionTemplate.objects.filter(is_active=True)
    if not templates.exists():
        return "No active session templates found. Please create templates first."

    fallback_user = User.objects.filter(role='teacher').first()
    if not fallback_user:
        fallback_user = User.objects.filter(is_superuser=True).first()

    total_created = 0
    total_skipped = 0

    current_day = term.start_date
    while current_day <= term.end_date:
        # Skip weekends (Monday=0, Sunday=6)
        if current_day.weekday() < 5:  # Monday–Friday
            for cls in active_classes:
                conducted_by = cls.class_teacher or fallback_user
                if not conducted_by:
                    continue

                for template in templates:
                    # Create or retrieve session for this date, class, and session type
                    session, created = AttendanceSession.objects.get_or_create(
                        session_date=current_day,
                        class_id=cls,
                        session_type=template.name,
                        defaults={
                            'start_time': template.start_time,
                            'end_time': template.end_time,
                            'is_active': True,
                            'conducted_by': conducted_by,
                        }
                    )
                    if created:
                        total_created += 1
                    else:
                        total_skipped += 1
        current_day += timedelta(days=1)

    return (f"Created {total_created} sessions, skipped {total_skipped} existing sessions "
            f"for {active_classes.count()} classes.")