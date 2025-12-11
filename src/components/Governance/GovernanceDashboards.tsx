import React from 'react';
import {
  BarChart2,
  Scale,
  ShieldCheck,
  Link2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  items: { label: string; value: string; status?: 'ok' | 'warn' | 'pending' }[];
  comingSoon?: boolean;
}

function DashboardCard({ title, description, icon: Icon, iconBg, iconColor, items, comingSoon }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="p-5">
        {comingSoon ? (
          <div className="py-8 text-center">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Coming soon</p>
            <p className="text-xs text-gray-400 mt-1">Backend integration required</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="flex items-center gap-1.5 font-medium text-gray-900">
                  {item.status === 'ok' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {item.status === 'warn' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  {item.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function GovernanceDashboards() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Governance Dashboards (FR-31)</h2>
        <p className="text-sm text-gray-500">
          Model performance, fairness, compliance, and blockchain audit summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Model Performance"
          description="Accuracy, calibration, and drift metrics"
          icon={BarChart2}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          items={[
            { label: 'Triage accuracy (holdout)', value: '—', status: 'pending' },
            { label: 'Calibration (ECE)', value: '—', status: 'pending' },
            { label: 'Last validated', value: '—', status: 'pending' },
          ]}
          comingSoon
        />
        <DashboardCard
          title="Fairness Metrics"
          description="Performance by demographic subgroups"
          icon={Scale}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          items={[
            { label: 'Demographic parity', value: '—', status: 'pending' },
            { label: 'Equalized odds', value: '—', status: 'pending' },
            { label: 'Bias audit', value: '—', status: 'pending' },
          ]}
          comingSoon
        />
        <DashboardCard
          title="Compliance Status"
          description="FDA, MHRA, EU AI Act, HIPAA readiness"
          icon={ShieldCheck}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          items={[
            { label: 'Documentation traceability', value: 'Partial', status: 'warn' },
            { label: 'Audit evidence pack', value: '—', status: 'pending' },
            { label: 'Lifecycle traceability', value: '—', status: 'pending' },
          ]}
        />
        <DashboardCard
          title="Blockchain Audit Summary"
          description="On-chain events and provenance"
          icon={Link2}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          items={[
            { label: 'Consent events', value: '—', status: 'pending' },
            { label: 'Model deployments', value: '—', status: 'pending' },
            { label: 'Incident records', value: '—', status: 'pending' },
          ]}
          comingSoon
        />
      </div>
    </div>
  );
}
