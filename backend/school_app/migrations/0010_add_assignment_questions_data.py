from django.db import migrations

def create_assignment_questions(apps, schema_editor):
    LearningContent = apps.get_model('school_app', 'LearningContent')
    AssignmentQuestion = apps.get_model('school_app', 'AssignmentQuestion')
    
    # Find all assignments
    assignments = LearningContent.objects.filter(content_type='Assignment')
    
    for assignment in assignments:
        # Skip if assignment already has questions
        if AssignmentQuestion.objects.filter(assignment=assignment).exists():
            continue
        
        # Create default questions based on assignment title
        questions = [
            {
                'question_text': f'Explain the main concepts covered in {assignment.content_title}.',
                'question_type': 'essay',
                'points': 20,
                'min_words': 100,
                'max_words': 300,
                'question_order': 1,
            },
            {
                'question_text': f'What are the key principles of this subject?',
                'question_type': 'text',
                'points': 10,
                'min_words': 50,
                'max_words': 150,
                'question_order': 2,
            },
            {
                'question_text': f'Select the correct statement about the topic:',
                'question_type': 'multiple_choice',
                'points': 5,
                'options': [
                    {'label': 'A', 'text': 'Option 1 is correct'},
                    {'label': 'B', 'text': 'Option 2 is correct'},
                    {'label': 'C', 'text': 'Option 3 is correct'},
                    {'label': 'D', 'text': 'Option 4 is correct'}
                ],
                'correct_answer': 'A',
                'question_order': 3,
            },
            {
                'question_text': f'True or False: The concept applies to all scenarios.',
                'question_type': 'true_false',
                'points': 5,
                'options': [
                    {'label': 'True', 'text': 'True'},
                    {'label': 'False', 'text': 'False'}
                ],
                'correct_answer': 'True',
                'question_order': 4,
            }
        ]
        
        for q_data in questions:
            AssignmentQuestion.objects.create(
                assignment=assignment,
                question_text=q_data['question_text'],
                question_type=q_data['question_type'],
                question_order=q_data['question_order'],
                points=q_data['points'],
                options=q_data.get('options', []),
                correct_answer=q_data.get('correct_answer', ''),
                min_words=q_data.get('min_words'),
                max_words=q_data.get('max_words'),
            )
        
        print(f"✅ Added questions to: {assignment.content_title}")

def reverse_func(apps, schema_editor):
    AssignmentQuestion = apps.get_model('school_app', 'AssignmentQuestion')
    AssignmentQuestion.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('school_app', '0009_keep_current_balance'),  # Use your latest migration number
    ]

    operations = [
        migrations.RunPython(create_assignment_questions, reverse_func),
    ]
