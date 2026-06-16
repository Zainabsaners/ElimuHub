# school_app/registry.py

class ElimuHubRegistry:
    """
    A centralized registry to manage dynamic modules (plugins).
    Allows the Registrar portal to trigger automated events—like 
    sending an SMS or creating an ledger file—without coupling 
    the core code to external packages.
    """
    _hooks = {}

    @classmethod
    def register(cls, hook_name, callback):
        """Registers a function to a specific system event hook."""
        if hook_name not in cls._hooks:
            cls._hooks[hook_name] = []
        cls._hooks[hook_name].append(callback)

    @classmethod
    def run_hooks(cls, hook_name, *args, **kwargs):
        """Executes all functions registered to a specific hook."""
        results = []
        for callback in cls._hooks.get(hook_name, []):
            try:
                results.append(callback(*args, **kwargs))
            except Exception as e:
                # Prevent a failing plugin from crashing the Registrar's core action
                print(f"Plugin Execution Error on hook '{hook_name}': {str(e)}")
        return results

# Central instance for import across the app
plugin_registry = ElimuHubRegistry()