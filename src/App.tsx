import React, { useState } from 'react';
import { Calendar, MessageSquare, Activity, Settings, LayoutGrid, History, UserSearch } from 'lucide-react';
import {
  Sidebar,
  Header,
  Dashboard,
  Triage,
  Meetings,
  Chat,
  RPM,
  CareTimeline,
  PatientLookup,
  Governance,
  Notifications,
  Settings as SettingsView,
  AuthModal,
  AIDecisionModal,
} from './components';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { AIDecision } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingAIDecision, setPendingAIDecision] = useState<AIDecision | null>(null);
  
  const { user, isAuthenticated, loginWithEmail, register, logout, refreshUser } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id);

  const baseNav = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'triage', name: 'Triage', icon: MessageSquare },
    { id: 'meetings', name: 'Meetings', icon: Calendar },
    { id: 'chat', name: 'Messages', icon: MessageSquare },
    { id: 'rpm', name: 'RPM Monitor', icon: Activity },
    { id: 'care-timeline', name: 'Care Timeline', icon: History },
  ];
  const clinicianNav = [
    ...(user?.role === 'admin' || user?.role === 'clinician' ? [{ id: 'patients', name: 'Patient Lookup', icon: UserSearch }] : []),
    ...(user?.role === 'admin' || user?.role === 'clinician' ? [{ id: 'governance', name: 'Governance', icon: LayoutGrid }] : []),
  ];
  const navigation = [
    ...baseNav,
    ...clinicianNav,
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const onAIDecision = (d: AIDecision) => setPendingAIDecision(d);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'triage':
        return <Triage user={user} onAIDecision={onAIDecision} />;
      case 'meetings':
        return <Meetings user={user} onAIDecision={onAIDecision} />;
      case 'chat':
        return <Chat user={user} onAIDecision={onAIDecision} />;
      case 'rpm':
        return <RPM user={user} onAIDecision={onAIDecision} />;
      case 'care-timeline':
        return <CareTimeline user={user} />;
      case 'patients':
        return <PatientLookup user={user} onNavigate={setCurrentView} />;
      case 'governance':
        return <Governance user={user} />;
      case 'settings':
        return <SettingsView user={user} onUserUpdate={refreshUser} />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
    return <AuthModal loginWithEmail={loginWithEmail} register={register} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className={`flex w-full`}>
        <Sidebar
          navigation={navigation}
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
        />

        <div className="flex-1 flex flex-col">
          <Header
            user={user}
            unreadNotifications={unreadCount}
            onNotificationsClick={() => setShowNotifications(!showNotifications)}
            onLogout={logout}
          />

          <main className="flex-1 p-6">
            {renderCurrentView()}
          </main>
        </div>

        {showNotifications && (
          <Notifications
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={markAsRead}
          />
        )}

        {pendingAIDecision && (
          <AIDecisionModal
            decision={pendingAIDecision}
            onConfirm={(d, n) => {
              console.log('Confirmed:', d, n);
              setPendingAIDecision(null);
            }}
            onReject={(d, n) => {
              console.log('Rejected:', d, n);
              setPendingAIDecision(null);
            }}
            onClose={() => setPendingAIDecision(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;