from .registry import plugin_registry

def registrar_welcome_listener(student, user):
    """A mock plugin simulating an automated external action."""
    print(f"\n🚀 [PLUGIN TRIGGERED]: Student {student.admission_no} ({student.first_name}) successfully initialized by Registrar: {user.username}\n")

# Connect the listener function to our structural hook point
plugin_registry.register('after_student_admission', registrar_welcome_listener)