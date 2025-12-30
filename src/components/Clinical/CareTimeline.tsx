import React, { useState } from 'react';
import {
  Calendar,
  Activity,
  FileText,
  Pill,
  FlaskConical,
  AlertTriangle,
  MessageSquare,
  Filter,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { User } from '../../types';
import { CareTimelineEvent, Medication, Allergy, LabResult } from '../../types';
import MedicationsAllergies from './MedicationsAllergies';
import LabResults from './LabResults';

const MOCK_MEDICATIONS: Medication[] = [
  { id: 'm1', name: 'Metformin', dose: '500mg', frequency: 'BID', route: 'PO', status: 'active', prescribedBy: 'Dr. Smith' },
  { id: 'm2', name: 'Lisinopril', dose: '10mg', frequency: 'Daily', route: 'PO', status: 'active', prescribedBy: 'Dr. Smith' },
];

const MOCK_ALLERGIES: Allergy[] = [
  { id: 'a1', substance: 'Penicillin', reaction: 'Rash', severity: 'moderate' },
];

const MOCK_LABS: LabResult[] = [
  { id: 'l1', name: 'HbA1c', value: '7.2', unit: '%', referenceRange: '4.0–5.6', status: 'high', performedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'l2', name: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7–1.3', status: 'normal', performedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'l3', name: 'eGFR', value: '78', unit: 'mL/min', referenceRange: '>60', status: 'normal', performedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

function mockTimelineEvents(): CareTimelineEvent[] {
  return [
    { id: 'e1', type: 'alert', title: 'Heart rate elevated', description: '110 bpm, threshold 100', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), priority: 'high' },
    { id: 'e2', type: 'vital', title: 'Blood pressure', description: '125/80 mmHg', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'e3', type: 'encounter', title: 'Televisit follow-up', description: '30 min • SOAP note documented', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'e4', type: 'note', title: 'Progress note', description: 'A1C improved. Continue current regimen.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'e5', type: 'medication', title: 'Lisinopril started', description: '10mg daily for hypertension', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'e6', type: 'lab', title: 'HbA1c', description: '7.2% (high)', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), priority: 'medium' },
    { id: 'e7', type: 'triage', title: 'Symptom check', description: 'Routine • Fatigue, mild headache', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ];
}

const EVENT_ICONS: Record<CareTimelineEvent['type'], typeof Calendar> = {
  encounter: Calendar,
  vital: Activity,
  note: FileText,
  medication: Pill,
  lab: FlaskConical,
  alert: AlertTriangle,
  triage: MessageSquare,
};

const EVENT_COLORS: Record<CareTimelineEvent['type'], string> = {
  encounter: 'bg-green-100 text-green-700 border-green-200',
  vital: 'bg-blue-100 text-blue-700 border-blue-200',
  note: 'bg-slate-100 text-slate-700 border-slate-200',
  medication: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  lab: 'bg-violet-100 text-violet-700 border-violet-200',
  alert: 'bg-red-100 text-red-700 border-red-200',
  triage: 'bg-amber-100 text-amber-700 border-amber-200',
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface CareTimelineProps {
  user: User | null;
  patientId?: string;
  compact?: boolean;
}

export default function CareTimeline({ user, patientId, compact = false }: CareTimelineProps) {
  const [filter, setFilter] = useState<CareTimelineEvent['type'] | 'all'>('all');
  const [showMedsAllergies, setShowMedsAllergies] = useState(true);
  const [showLabs, setShowLabs] = useState(true);
  const events = mockTimelineEvents();
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

  const filters: { value: CareTimelineEvent['type'] | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'encounter', label: 'Encounters' },
    { value: 'vital', label: 'Vitals' },
    { value: 'note', label: 'Notes' },
    { value: 'medication', label: 'Meds' },
    { value: 'lab', label: 'Labs' },
    { value: 'alert', label: 'Alerts' },
    { value: 'triage', label: 'Triage' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Timeline</h1>
          <p className="mt-1 text-gray-500">
            Encounters, vitals, notes, medications, labs, and alerts in one view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
              <span className="text-sm text-gray-500">{filtered.length} events</span>
            </div>
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <ul className="space-y-0">
                  {filtered.map((evt, idx) => {
                    const Icon = EVENT_ICONS[evt.type];
                    const colors = EVENT_COLORS[evt.type];
                    return (
                      <li key={evt.id} className="relative flex gap-4 pb-6 last:pb-0">
                        <div
                          className={`relative z-10 shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${colors}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900">{evt.title}</p>
                              {evt.description && (
                                <p className="text-sm text-gray-600 mt-0.5">{evt.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimestamp(evt.timestamp)}
                            </div>
                          </div>
                          {evt.priority && evt.priority !== 'low' && (
                            <span
                              className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                                evt.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {evt.priority}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-8">No events match the filter.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Quick links</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowMedsAllergies(!showMedsAllergies)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">Medications & Allergies</span>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showMedsAllergies ? 'rotate-90' : ''}`} />
              </button>
              <button
                onClick={() => setShowLabs(!showLabs)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">Lab results</span>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showLabs ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {showMedsAllergies && (
            <MedicationsAllergies medications={MOCK_MEDICATIONS} allergies={MOCK_ALLERGIES} compact />
          )}
          {showLabs && <LabResults results={MOCK_LABS} compact maxVisible={4} />}
        </div>
      </div>
    </div>
  );
}
