import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  BarChart2,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { User } from '../../types';

interface DecisionRecord {
  id: string;
  user_name: string;
  user_email: string;
  type: string;
  decision: 'confirm' | 'reject';
  note: string | null;
  created_at: string;
}

interface FeedbackStats {
  totalDecisions: number;
  confirmRate: number;
  rejectRate: number;
  byDecision: Record<string, { count: number; rate: number }>;
  recentDecisions: DecisionRecord[];
}

const TYPE_LABELS: Record<string, string> = {
  triage: 'Triage',
  meeting_summary: 'Meeting Summary',
  chat_summary: 'Chat Summary',
  rpm_alert: 'RPM Alert',
};

function useFeedbackStats(user: User | null): { stats: FeedbackStats | null; loading: boolean; error: string | null } {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('intellihealth_token');
        const base = import.meta.env.VITE_API_URL || '';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [statsRes, decisionsRes] = await Promise.all([
          fetch(`${base}/api/ai/stats`, { headers, credentials: 'include' }),
          fetch(`${base}/api/ai/decisions?limit=20`, { headers, credentials: 'include' }),
        ]);

        if (cancelled) return;

        if (statsRes.ok && decisionsRes.ok) {
          const statsData = await statsRes.json();
          const decisionsData = await decisionsRes.json();

          const total = statsData.totalDecisions || 0;
          const byDecision: Record<string, { count: number; rate: number }> = {};
          let confirmRate = 0;
          let rejectRate = 0;

          (statsData.byDecision || {}).confirm && (byDecision.confirm = statsData.byDecision.confirm);
          (statsData.byDecision || {}).reject && (byDecision.reject = statsData.byDecision.reject);
          confirmRate = statsData.confirmRate ?? 0;
          rejectRate = statsData.rejectRate ?? 0;

          const recentDecisions: DecisionRecord[] = (decisionsData || []).map((d: any) => ({
            id: d.id,
            user_name: d.user_name || 'Unknown',
            user_email: d.user_email || '',
            type: d.ai_payload?.type || 'unknown',
            decision: d.decision,
            note: d.note || null,
            created_at: d.created_at,
          }));

          setStats({
            totalDecisions: total,
            confirmRate,
            rejectRate,
            byDecision,
            recentDecisions,
          });
          return;
        }
        if (!cancelled) setStats(getMockStats());
      } catch {
        if (!cancelled) {
          setError('Could not load feedback data.');
          setStats(getMockStats());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { stats, loading, error };
}

function getMockStats(): FeedbackStats {
  return {
    totalDecisions: 142,
    confirmRate: 0.73,
    rejectRate: 0.27,
    byDecision: {
      confirm: { count: 104, rate: 0.73 },
      reject: { count: 38, rate: 0.27 },
    },
    recentDecisions: [
      { id: '1', user_name: 'Dr. Sarah Johnson', user_email: 'doc1@example.com', type: 'triage', decision: 'confirm', note: null, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: '2', user_name: 'Dr. Sarah Johnson', user_email: 'doc1@example.com', type: 'rpm_alert', decision: 'reject', note: 'Overrode: patient known stable', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { id: '3', user_name: 'Dr. Sarah Johnson', user_email: 'doc1@example.com', type: 'meeting_summary', decision: 'confirm', note: null, created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      { id: '4', user_name: 'System Admin', user_email: 'admin@example.com', type: 'triage', decision: 'confirm', note: null, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '5', user_name: 'Dr. Sarah Johnson', user_email: 'doc1@example.com', type: 'rpm_alert', decision: 'confirm', note: 'Escalated to nurse', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  };
}

interface ClinicianFeedbackProps {
  user: User | null;
}

export default function ClinicianFeedback({ user }: ClinicianFeedbackProps) {
  const { stats, loading, error } = useFeedbackStats(user);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const data = stats || getMockStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Clinician Feedback Analytics (FR-30)</h2>
        <p className="text-sm text-gray-500">
          Accept / override rates to improve usability and safety.
        </p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800">{error} Showing demo data.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <BarChart2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Decisions</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalDecisions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Accept Rate</p>
              <p className="text-2xl font-bold text-green-700">{Math.round((data.confirmRate || 0) * 100)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Override Rate</p>
              <p className="text-2xl font-bold text-red-700">{Math.round((data.rejectRate || 0) * 100)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Recent (20)</p>
              <p className="text-2xl font-bold text-gray-900">{data.recentDecisions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Recent decisions</h3>
          <p className="text-sm text-gray-500">Accept / override log for audit and model improvement.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinician</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentDecisions.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-900">{row.user_name}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {TYPE_LABELS[row.type] || row.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {row.decision === 'confirm' ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-4 w-4" /> Accept
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700">
                        <XCircle className="h-4 w-4" /> Override
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">{row.note || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3" />
                      {new Date(row.created_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
