'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, BellIcon, ShieldCheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-lg text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                    <div className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Change Avatar
                          </button>
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about yourself..."
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400"
                        />
                      </div>

                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Task Assignments</p>
                          <p className="text-sm text-gray-500">Get notified when you're assigned to a task</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Task Updates</p>
                          <p className="text-sm text-gray-500">Get notified when tasks are updated</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Project Updates</p>
                          <p className="text-sm text-gray-500">Get notified about project changes</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-blue-600" />
                      </div>

                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        />
                      </div>

                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Update Password
                      </button>

                      {/* Two-Factor Authentication */}
                      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Theme</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button className="p-4 border-2 border-blue-500 rounded-lg bg-white">
                            <div className="w-full h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded mb-2"></div>
                            <p className="font-medium text-gray-900">Light (Current)</p>
                          </button>
                          <button className="p-4 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400">
                            <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                            <p className="font-medium text-gray-900">Dark</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Background Animation</label>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Enable Animated Background</p>
                            <p className="text-sm text-gray-500">Show the iridescent background effect</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>

                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save Appearance
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
