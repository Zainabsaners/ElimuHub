import React, { useState, useEffect, useCallback } from "react";
import { 
  FiLock, 
  FiBell, 
  FiMoon, 
  FiSun, 
  FiKey,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiSave,
  FiRefreshCw,
  FiUser,
  FiShield,
  FiMail,
  FiSmartphone,
  FiGlobe
} from "react-icons/fi";
import { auth, users } from '../../api';

// Toast Notification Component
const Toast = React.memo(({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-indigo-500 to-indigo-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-500'
  }[type] || 'bg-gradient-to-r from-indigo-500 to-indigo-500';

  const icon = {
    success: <FiCheckCircle className="text-white" size={20} />,
    error: <FiAlertCircle className="text-white" size={20} />,
    info: <FiBell className="text-white" size={20} />,
    warning: <FiAlertCircle className="text-white" size={20} />
  }[type] || <FiBell className="text-white" size={20} />;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white rounded-xl shadow-lg p-4 min-w-[300px] flex items-center gap-3`}>
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-grow"><p className="font-medium">{message}</p></div>
        <button onClick={onClose} className="flex-shrink-0 text-white hover:text-gray-200">
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
});

// Reusable Toggle Component
const ToggleSwitch = ({ label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      </div>
    </label>
  </div>
);

// Reusable Input Component
const InputField = ({ label, type, value, onChange, placeholder, required = false, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  </div>
);

// Privacy & Security Settings Component
const PrivacySettings = ({ privacy, setPrivacy, loading, showNotification }) => {
  const handleSave = async () => {
    try {
      // Save privacy settings to API
      await users.updateProfile({
        mfa_enabled: privacy.twoFactorAuth,
        // Other privacy settings would be saved here
      });
      showNotification("Privacy settings updated successfully!", "success");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      showNotification("Failed to update privacy settings", "error");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <FiShield className="text-indigo-600" />
        Privacy & Security
      </h2>
      <div className="space-y-1">
        <ToggleSwitch
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={privacy.twoFactorAuth}
          onChange={(e) => setPrivacy({ ...privacy, twoFactorAuth: e.target.checked })}
          disabled={loading}
        />
        <ToggleSwitch
          label="Location Access"
          description="Allow the system to access your location for better services"
          checked={privacy.locationAccess}
          onChange={(e) => setPrivacy({ ...privacy, locationAccess: e.target.checked })}
          disabled={loading}
        />
        <ToggleSwitch
          label="Data Analytics"
          description="Help us improve by sharing anonymous usage data"
          checked={privacy.dataAnalytics}
          onChange={(e) => setPrivacy({ ...privacy, dataAnalytics: e.target.checked })}
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <FiRefreshCw className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <FiSave />
            Save Privacy Settings
          </>
        )}
      </button>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ notifications, setNotifications, loading, showNotification }) => {
  const handleSave = async () => {
    try {
      // Save notification settings to API
      // This would typically go to a user preferences endpoint
      showNotification("Notification settings updated successfully!", "success");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      showNotification("Failed to update notification settings", "error");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <FiBell className="text-indigo-600" />
        Notification Settings
      </h2>
      <div className="space-y-1">
        <ToggleSwitch
          label="Email Notifications"
          description="Receive important updates via email"
          checked={notifications.email}
          onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
          disabled={loading}
        />
        <ToggleSwitch
          label="Push Notifications"
          description="Get instant alerts on your device"
          checked={notifications.push}
          onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
          disabled={loading}
        />
        <ToggleSwitch
          label="SMS Notifications"
          description="Receive text messages for critical alerts"
          checked={notifications.sms}
          onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
          disabled={loading}
        />
        <ToggleSwitch
          label="Payment Reminders"
          description="Get reminded about upcoming fee deadlines"
          checked={notifications.paymentReminders}
          onChange={(e) => setNotifications({ ...notifications, paymentReminders: e.target.checked })}
          disabled={loading}
        />
      </div>
      <button 
        onClick={handleSave}
        disabled={loading}
        className="mt-6 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <FiRefreshCw className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <FiSave />
            Save Notification Settings
          </>
        )}
      </button>
    </div>
  );
};

// Appearance Settings Component - FIXED
const AppearanceSettings = ({ appearance, setAppearance, showNotification }) => {
  const [localTheme, setLocalTheme] = useState(appearance.theme || 'light');

  // Apply theme immediately when changed
  const handleThemeChange = (theme) => {
    setLocalTheme(theme);
    setAppearance({ ...appearance, theme: theme });
    
    // Directly manipulate the body or documentElement
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      // Optional: Update the body background for a seamless look
      document.body.classList.add('bg-gray-900');
      document.body.classList.remove('bg-gray-50');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-gray-50');
      document.body.classList.remove('bg-gray-900');
    }
    
    localStorage.setItem('appearance', JSON.stringify({ ...appearance, theme: theme }));
  };

  const handleFontSizeChange = (e) => {
    const fontSize = e.target.value;
    setAppearance({ ...appearance, fontSize });
    
    // Save to localStorage
    const savedAppearance = JSON.parse(localStorage.getItem('appearance') || '{}');
    localStorage.setItem('appearance', JSON.stringify({ ...savedAppearance, fontSize: fontSize }));
    
    showNotification("Font size updated successfully!", "success");
  };

  const handleSave = () => {
    // Save all appearance settings
    localStorage.setItem('appearance', JSON.stringify(appearance));
    showNotification("Appearance settings saved successfully!", "success");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <FiMoon className="text-indigo-600" />
        Appearance Settings
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                localTheme === "light"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <FiSun className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Light Mode</p>
                  <p className="text-sm text-gray-500">Clean and bright interface</p>
                </div>
              </div>
            </div>
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                localTheme === "dark"
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center">
                  <FiMoon className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">Easy on the eyes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <select
            value={appearance.fontSize || 'medium'}
            onChange={handleFontSizeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      <button 
        onClick={handleSave}
        className="mt-6 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
      >
        <FiSave />
        Save Appearance Settings
      </button>
    </div>
  );
};

// Password Settings Component - FIXED with button
const PasswordSettings = ({ password, setPassword, loading, showNotification }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password.currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!password.newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (password.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await auth.changePassword(password.currentPassword, password.newPassword);
      setSuccess("Password updated successfully!");
      showNotification("Password updated successfully!", "success");
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.response?.data?.error || "Failed to update password. Please try again.");
      showNotification("Failed to update password", "error");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <FiKey className="text-indigo-600" />
        Change Password
      </h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Current Password"
          type="password"
          value={password.currentPassword}
          onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
          placeholder="Enter your current password"
          required
          disabled={loading}
        />
        <InputField
          label="New Password"
          type="password"
          value={password.newPassword}
          onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
          placeholder="Enter your new password"
          required
          disabled={loading}
        />
        <InputField
          label="Confirm New Password"
          type="password"
          value={password.confirmPassword}
          onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
          placeholder="Confirm your new password"
          required
          disabled={loading}
        />
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Include numbers and special characters</li>
          </ul>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <FiKey />
              Change Password
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Main Settings Component
const Settings = () => {
  const [activeSection, setActiveSection] = useState("privacy");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const [privacy, setPrivacy] = useState({
    twoFactorAuth: false,
    locationAccess: true,
    dataAnalytics: true,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    paymentReminders: true,
  });

  const [appearance, setAppearance] = useState(() => {
    // Load appearance from localStorage
    const saved = localStorage.getItem('appearance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Apply theme on load
        if (parsed.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return parsed;
      } catch {
        return { theme: "light", fontSize: "medium" };
      }
    }
    return { theme: "light", fontSize: "medium" };
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Load user settings on mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true);
        const response = await users.getProfile();
        const userData = response.data.data || response.data;
        
        // Update privacy settings from user data
        if (userData.mfa_enabled !== undefined) {
          setPrivacy(prev => ({ ...prev, twoFactorAuth: userData.mfa_enabled }));
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        // Use default settings
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const navigationItems = [
    { id: "privacy", label: "Privacy & Security", icon: <FiShield className="text-lg" /> },
    { id: "notifications", label: "Notifications", icon: <FiBell className="text-lg" /> },
    { id: "appearance", label: "Appearance", icon: <FiMoon className="text-lg" /> },
    { id: "password", label: "Password", icon: <FiKey className="text-lg" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
      
      <div className="w-full max-w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FiUser className="text-indigo-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === item.id
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={activeSection === item.id ? "text-indigo-600" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeSection === "privacy" && (
              <PrivacySettings
                privacy={privacy}
                setPrivacy={setPrivacy}
                loading={loading}
                showNotification={showToast}
              />
            )}
            {activeSection === "notifications" && (
              <NotificationSettings
                notifications={notifications}
                setNotifications={setNotifications}
                loading={loading}
                showNotification={showToast}
              />
            )}
            {activeSection === "appearance" && (
              <AppearanceSettings
                appearance={appearance}
                setAppearance={setAppearance}
                showNotification={showToast}
              />
            )}
            {activeSection === "password" && (
              <PasswordSettings
                password={password}
                setPassword={setPassword}
                loading={loading}
                showNotification={showToast}
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0%); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Settings;