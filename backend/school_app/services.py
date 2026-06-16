# backend/school_app/services.py
from .models import SummativeRating, CBEReportCard, Student

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