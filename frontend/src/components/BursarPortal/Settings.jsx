import React, { useState } from "react";

// Reusable Input Component
const InputField = ({ label, type, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

// Reusable Toggle Component
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <div className="flex-1">
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
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

// Notification Component
const Notification = ({ message, type = "success", onClose }) => (
  <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
    type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  } border rounded-lg shadow-lg p-4 transition-all duration-300`}>
    <div className="flex items-start">
      <div className={`flex-shrink-0 ${
        type === "success" ? "text-green-400" : "text-red-400"
      }`}>
        {type === "success" ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm font-medium ${
          type === "success" ? "text-green-800" : "text-red-800"
        }`}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`ml-4 flex-shrink-0 ${
          type === "success" ? "text-green-400 hover:text-green-500" : "text-red-400 hover:text-red-500"
        }`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
);

// Privacy and Security Settings Component
const PrivacySettings = ({ privacy, setPrivacy, showNotification }) => {
  const handleSave = () => {
    showNotification("Privacy settings updated successfully!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy & Security</h2>
      <div className="space-y-1">
        <ToggleSwitch
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          checked={privacy.twoFactorAuth}
          onChange={(e) =>
            setPrivacy({ ...privacy, twoFactorAuth: e.target.checked })
          }
        />
        <ToggleSwitch
          label="Location Access"
          description="Allow the system to access your location for better services"
          checked={privacy.locationAccess}
          onChange={(e) =>
            setPrivacy({ ...privacy, locationAccess: e.target.checked })
          }
        />
        <ToggleSwitch
          label="Data Analytics"
          description="Help us improve by sharing anonymous usage data"
          checked={privacy.dataAnalytics}
          onChange={(e) =>
            setPrivacy({ ...privacy, dataAnalytics: e.target.checked })
          }
        />
      </div>
      <button 
        onClick={handleSave}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Save Privacy Settings
      </button>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ notifications, setNotifications, showNotification }) => {
  const handleSave = () => {
    showNotification("Notification settings updated successfully!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
      <div className="space-y-1">
        <ToggleSwitch
          label="Email Notifications"
          description="Receive important updates via email"
          checked={notifications.email}
          onChange={(e) =>
            setNotifications({ ...notifications, email: e.target.checked })
          }
        />
        <ToggleSwitch
          label="Push Notifications"
          description="Get instant alerts on your device"
          checked={notifications.push}
          onChange={(e) =>
            setNotifications({ ...notifications, push: e.target.checked })
          }
        />
        <ToggleSwitch
          label="SMS Notifications"
          description="Receive text messages for critical alerts"
          checked={notifications.sms}
          onChange={(e) =>
            setNotifications({ ...notifications, sms: e.target.checked })
          }
        />
        <ToggleSwitch
          label="Payment Reminders"
          description="Get reminded about upcoming fee deadlines"
          checked={notifications.paymentReminders}
          onChange={(e) =>
            setNotifications({ ...notifications, paymentReminders: e.target.checked })
          }
        />
      </div>
      <button 
        onClick={handleSave}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Save Notification Settings
      </button>
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings = ({ appearance, setAppearance, showNotification }) => {
  const handleSave = () => {
    showNotification("Appearance settings updated successfully!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Appearance Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                appearance.theme === "light"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setAppearance({ ...appearance, theme: "light" })}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Light Mode</p>
                  <p className="text-sm text-gray-500">Clean and bright interface</p>
                </div>
              </div>
            </div>
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                appearance.theme === "dark"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setAppearance({ ...appearance, theme: "dark" })}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded-full"></div>
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
            value={appearance.fontSize}
            onChange={(e) =>
              setAppearance({ ...appearance, fontSize: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
      <button 
        onClick={handleSave}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Save Appearance Settings
      </button>
    </div>
  );
};

// Password Settings Component
const PasswordSettings = ({ password, setPassword, showNotification }) => {
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (password.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    showNotification("Password updated successfully!");
    setError("");
    setPassword({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Current Password"
          type="password"
          value={password.currentPassword}
          onChange={(e) =>
            setPassword({ ...password, currentPassword: e.target.value })
          }
          placeholder="Enter your current password"
        />
        <InputField
          label="New Password"
          type="password"
          value={password.newPassword}
          onChange={(e) =>
            setPassword({ ...password, newPassword: e.target.value })
          }
          placeholder="Enter your new password"
        />
        <InputField
          label="Confirm New Password"
          type="password"
          value={password.confirmPassword}
          onChange={(e) =>
            setPassword({ ...password, confirmPassword: e.target.value })
          }
          placeholder="Confirm your new password"
        />
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-semibold"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

// Main Settings Component
const Settings = () => {
  const [activeSection, setActiveSection] = useState("privacy");
  const [notification, setNotification] = useState(null);

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

  const [appearance, setAppearance] = useState({
    theme: "light",
    fontSize: "medium",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const navigationItems = [
    { id: "privacy", label: "Privacy & Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "password", label: "Password", icon: "🔑" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 w-full p-4 md:p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="w-full max-w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Sidebar Navigation - Full width on mobile, fixed width on desktop */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area - Takes remaining space */}
          <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex item from overflowing */}
            {activeSection === "privacy" && (
              <PrivacySettings
                privacy={privacy}
                setPrivacy={setPrivacy}
                showNotification={showNotification}
              />
            )}
            {activeSection === "notifications" && (
              <NotificationSettings
                notifications={notifications}
                setNotifications={setNotifications}
                showNotification={showNotification}
              />
            )}
            {activeSection === "appearance" && (
              <AppearanceSettings
                appearance={appearance}
                setAppearance={setAppearance}
                showNotification={showNotification}
              />
            )}
            {activeSection === "password" && (
              <PasswordSettings
                password={password}
                setPassword={setPassword}
                showNotification={showNotification}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;