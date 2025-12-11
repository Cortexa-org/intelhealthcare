import React, { useState } from 'react';
import { User, Bell, Shield, Database, Save, Wallet, CreditCard } from 'lucide-react';
import { User as UserType, SubscriptionTier } from '../../types';
import WalletConnect from '../Wallet/WalletConnect';
import SubscriptionPlans from '../Subscription/SubscriptionPlans';
import { useWallet } from '../../hooks/useWallet';
import { subscribeToPlan } from '../../services/subscriptionService';

interface SettingsProps {
  user: UserType | null;
  onUserUpdate?: () => void;
}

export default function Settings({ user, onUserUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { isConnected } = useWallet();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      timezone: 'America/New_York',
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      meetingReminders: true,
      criticalAlerts: true,
      weeklyReports: false,
    },
    privacy: {
      shareData: false,
      analyticsOptOut: true,
      transcriptStorage: false,
      dataRetention: '6months',
    },
    ai: {
      confidenceThreshold: 0.7,
      autoSuggestions: true,
      learningMode: true,
      temperature: 0.3,
    },
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'ai', name: 'AI Settings', icon: Database },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    const saved = localStorage.getItem('intellihealth_user');
    if (saved) {
      const u = JSON.parse(saved);
      u.avatar = avatarPreview;
      u.name = settings.profile.name;
      u.email = settings.profile.email;
      localStorage.setItem('intellihealth_user', JSON.stringify(u));
      onUserUpdate?.();
    }
    alert('Settings saved.');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Max 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Image only');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarRemove = () => {
    setAvatarPreview(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const onSubscribe = async (tier: SubscriptionTier) => {
    const res = await subscribeToPlan(tier.id);
    if (res.success) {
      onUserUpdate?.();
      alert(`Subscribed to ${tier.name}.`);
    } else {
      alert(res.error || 'Something went wrong');
    }
  };

  const renderSubscriptionSettings = () => {
    const currentTier = user?.subscription?.tier || 'free';
    const subscription = user?.subscription;

    return (
      <div className="space-y-6">
        {subscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Current Subscription</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p><span className="font-medium">Tier:</span> {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</p>
              <p><span className="font-medium">Status:</span> {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</p>
              <p><span className="font-medium">Started:</span> {new Date(subscription.startDate).toLocaleDateString()}</p>
              {subscription.expiryDate && (
                <p><span className="font-medium">Expires:</span> {new Date(subscription.expiryDate).toLocaleDateString()}</p>
              )}
              <p><span className="font-medium">Auto-renew:</span> {subscription.autoRenew ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <SubscriptionPlans
          currentTier={currentTier}
          onSelect={onSubscribe}
          walletConnected={isConnected}
        />
      </div>
    );
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-gray-200">
                <span className="text-white font-bold text-2xl">
                  {getInitials(user?.name || 'User')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <User className="h-4 w-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <button
                  onClick={handleAvatarRemove}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              JPG, PNG or GIF. Max size 5MB. Recommended: 400x400px square image.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={settings.profile.phone}
          onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+1 (555) 123-4567"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={settings.profile.timezone}
          onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive important notifications via email' },
          { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser and mobile push notifications' },
          { key: 'meetingReminders', label: 'Meeting Reminders', description: 'Reminders for scheduled appointments' },
          { key: 'criticalAlerts', label: 'Critical Alerts', description: 'Urgent patient health alerts' },
          { key: 'weeklyReports', label: 'Weekly Reports', description: 'Summary reports sent weekly' },
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{setting.label}</h4>
              <p className="text-sm text-gray-600">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[setting.key as keyof typeof settings.notifications] as boolean}
                onChange={(e) => handleSettingChange('notifications', setting.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Privacy Notice</h4>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          This is a prototype system. Do not enter real PHI or medical data.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Share Anonymized Data</h4>
            <p className="text-sm text-gray-600">Help improve healthcare AI with anonymized data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.shareData}
              onChange={(e) => handleSettingChange('privacy', 'shareData', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Transcript Storage</h4>
            <p className="text-sm text-gray-600">Default setting for storing meeting transcripts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.privacy.transcriptStorage}
              onChange={(e) => handleSettingChange('privacy', 'transcriptStorage', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention Period
          </label>
          <select
            value={settings.privacy.dataRetention}
            onChange={(e) => handleSettingChange('privacy', 'dataRetention', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3months">3 months</option>
            <option value="6months">6 months</option>
            <option value="1year">1 year</option>
            <option value="2years">2 years</option>
            <option value="indefinite">Indefinite (with consent)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-blue-800">AI Configuration</h4>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Configure AI behavior and thresholds for clinical decisions.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confidence Threshold
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            value={settings.ai.confidenceThreshold}
            onChange={(e) => handleSettingChange('ai', 'confidenceThreshold', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-900 w-12">
            {(settings.ai.confidenceThreshold * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Minimum confidence level required for AI recommendations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature Setting
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.1"
            value={settings.ai.temperature}
            onChange={(e) => handleSettingChange('ai', 'temperature', parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-900 w-12">
            {settings.ai.temperature.toFixed(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Clinical prompts use lower temperature for consistency (≤0.3 enforced)
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Auto-Suggestions</h4>
            <p className="text-sm text-gray-600">Enable automatic AI suggestions during workflows</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.ai.autoSuggestions}
              onChange={(e) => handleSettingChange('ai', 'autoSuggestions', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Learning Mode</h4>
            <p className="text-sm text-gray-600">Allow AI to learn from your decisions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.ai.learningMode}
              onChange={(e) => handleSettingChange('ai', 'learningMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderWalletSettings = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-indigo-600" />
          <h4 className="font-medium text-indigo-800">Web3 Wallet</h4>
        </div>
        <p className="text-sm text-indigo-700 mt-1">
          Connect an EVM-compatible wallet (e.g. MetaMask) for consent signing and blockchain audit (FR-8–FR-10, FR-24–FR-26). No PHI is stored on-chain.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Connection</label>
        <WalletConnect />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'subscription' && renderSubscriptionSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
          {activeTab === 'ai' && renderAISettings()}
          {activeTab === 'wallet' && renderWalletSettings()}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}