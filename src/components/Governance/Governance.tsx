import React, { useState } from 'react';
import { BarChart2, LayoutGrid, Users, Shield } from 'lucide-react';
import { User } from '../../types';
import ClinicianFeedback from './ClinicianFeedback';
import GovernanceDashboards from './GovernanceDashboards';

interface GovernanceProps {
  user: User | null;
}

type TabId = 'feedback' | 'dashboards';

const tabs: { id: TabId; name: string; icon: typeof BarChart2 }[] = [
  { id: 'feedback', name: 'Clinician Feedback', icon: Users },
  { id: 'dashboards', name: 'Governance Dashboards', icon: LayoutGrid },
];

export default function Governance({ user }: GovernanceProps) {
  const [activeTab, setActiveTab] = useState<TabId>('feedback');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
          <p className="mt-1 text-gray-500">
            Clinician feedback analytics and governance dashboards (FR-30, FR-31).
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span className="capitalize font-medium">{user.role}</span>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-2">
        {activeTab === 'feedback' && <ClinicianFeedback user={user} />}
        {activeTab === 'dashboards' && <GovernanceDashboards />}
      </div>
    </div>
  );
}
