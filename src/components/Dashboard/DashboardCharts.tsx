import React, { useState } from 'react';
import { BarChart2, PieChart, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { User } from '../../types';

const TRIAGE_DISTRIBUTION = [
  { label: 'Emergency', value: 3, color: '#ef4444' },
  { label: 'Urgent', value: 12, color: '#f97316' },
  { label: 'Routine', value: 48, color: '#3b82f6' },
  { label: 'Self-care', value: 22, color: '#22c55e' },
];

const VITALS_SPARKLINE = [
  72, 74, 71, 73, 75, 76, 74, 73, 72, 71, 70, 72, 74, 76, 78, 75, 74, 73, 72, 74,
];

const ENCOUNTERS_BY_DAY = [
  { day: 'Mon', count: 8 },
  { day: 'Tue', count: 12 },
  { day: 'Wed', count: 10 },
  { day: 'Thu', count: 14 },
  { day: 'Fri', count: 9 },
  { day: 'Sat', count: 4 },
  { day: 'Sun', count: 2 },
];

interface DashboardChartsProps {
  user: User | null;
}

export default function DashboardCharts({ user }: DashboardChartsProps) {
  const [expanded, setExpanded] = useState(false);
  const maxEncounters = Math.max(...ENCOUNTERS_BY_DAY.map((d) => d.count));
  const totalTriage = TRIAGE_DISTRIBUTION.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {expanded ? (
            <>Collapse <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Expand <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      </div>
      <div className="p-5">
        <div className={`grid gap-6 ${expanded ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-600" />
              Triage disposition (last 7 days)
            </h4>
            <div className="flex flex-wrap items-end gap-4">
              {TRIAGE_DISTRIBUTION.map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-1">
                  <div
                    className="w-12 rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${(d.value / totalTriage) * 120}px`,
                      backgroundColor: d.color,
                    }}
                    title={`${d.label}: ${d.value}`}
                  />
                  <span className="text-xs font-medium text-gray-600">{d.label}</span>
                  <span className="text-xs text-gray-500">{d.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Total assessments: {totalTriage}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Vitals trend (HR sample)
            </h4>
            <div className="h-16 flex items-end gap-0.5">
              {VITALS_SPARKLINE.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-blue-500/70 hover:bg-blue-500 transition-colors min-w-[4px]"
                  style={{ height: `${((v - 68) / 12) * 100}%` }}
                  title={`${v} bpm`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">Last 20 readings • 68–78 bpm</p>
          </div>

          {expanded && (
            <>
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-green-600" />
                  Encounters by day (this week)
                </h4>
                <div className="flex items-end gap-2 h-24">
                  {ENCOUNTERS_BY_DAY.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full max-w-[40px] rounded-t bg-green-500/70 hover:bg-green-500 transition-colors"
                        style={{ height: `${(d.count / maxEncounters) * 80}px` }}
                        title={`${d.day}: ${d.count}`}
                      />
                      <span className="text-xs text-gray-600">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
