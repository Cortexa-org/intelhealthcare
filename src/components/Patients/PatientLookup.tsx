import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { User as UserType } from '../../types';
import { ClinicalSummaryPatient } from './ClinicalSummary';
import ClinicalSummary from './ClinicalSummary';

const MOCK_PATIENTS: ClinicalSummaryPatient[] = [
  {
    id: 'p1',
    name: 'Jane Doe',
    mrn: 'MRN-001-DEMO',
    dateOfBirth: '1985-06-15',
    gender: 'Female',
    phone: '555-0123',
    email: 'pat1@example.com',
    address: '123 Main St, Demo City, DC 12345',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    lastEncounter: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    medications: [
      { id: 'm1', name: 'Metformin', dose: '500mg', frequency: 'BID', route: 'PO', status: 'active' },
      { id: 'm2', name: 'Lisinopril', dose: '10mg', frequency: 'Daily', route: 'PO', status: 'active' },
    ],
    allergies: [{ id: 'a1', substance: 'Penicillin', reaction: 'Rash', severity: 'moderate' }],
    labResults: [
      { id: 'l1', name: 'HbA1c', value: '7.2', unit: '%', referenceRange: '4.0–5.6', status: 'high', performedAt: new Date().toISOString() },
      { id: 'l2', name: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7–1.3', status: 'normal', performedAt: new Date().toISOString() },
    ],
    recentVitals: [
      { type: 'Heart rate', value: '72', unit: 'bpm', at: new Date().toISOString() },
      { type: 'BP', value: '125/80', unit: 'mmHg', at: new Date().toISOString() },
      { type: 'SpO2', value: '98', unit: '%', at: new Date().toISOString() },
    ],
  },
  {
    id: 'p2',
    name: 'John Smith',
    mrn: 'MRN-002-DEMO',
    dateOfBirth: '1972-03-22',
    gender: 'Male',
    phone: '555-0199',
    conditions: ['Asthma', 'GERD'],
    lastEncounter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    medications: [
      { id: 'm3', name: 'Albuterol', dose: '2 puffs', frequency: 'PRN', route: 'Inhalation', status: 'active' },
    ],
    allergies: [],
    labResults: [],
  },
  {
    id: 'p3',
    name: 'Maria Garcia',
    mrn: 'MRN-003-DEMO',
    dateOfBirth: '1990-11-08',
    gender: 'Female',
    conditions: ['Migraine'],
    medications: [],
    allergies: [{ id: 'a2', substance: 'Sulfa', severity: 'severe' }],
    labResults: [],
  },
];

type SortKey = 'name' | 'mrn' | 'lastEncounter' | 'alerts';
type SortDir = 'asc' | 'desc';

interface PatientLookupProps {
  user: UserType | null;
  onNavigate: (view: string) => void;
}

export default function PatientLookup({ user, onNavigate }: PatientLookupProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alert' | 'recent'>('all');
  const [selected, setSelected] = useState<ClinicalSummaryPatient | null>(null);

  const filtered = useMemo(() => {
    let list = MOCK_PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter === 'alert') {
      list = list.filter((p) => p.allergies.some((a) => a.severity === 'severe') || p.labResults.some((l) => l.status === 'critical'));
    }
    if (statusFilter === 'recent') {
      list = list.filter((p) => p.lastEncounter && new Date(p.lastEncounter).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    return list;
  }, [search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'name') { va = a.name; vb = b.name; }
      else if (sortKey === 'mrn') { va = a.mrn; vb = b.mrn; }
      else if (sortKey === 'lastEncounter') {
        va = a.lastEncounter ? new Date(a.lastEncounter).getTime() : 0;
        vb = b.lastEncounter ? new Date(b.lastEncounter).getTime() : 0;
      }
      else if (sortKey === 'alerts') {
        va = a.allergies.length + a.labResults.filter((l) => l.status === 'critical' || l.status === 'high').length;
        vb = b.allergies.length + b.labResults.filter((l) => l.status === 'critical' || l.status === 'high').length;
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const hasAlerts = (p: ClinicalSummaryPatient) =>
    p.allergies.some((a) => a.severity === 'severe') || p.labResults.some((l) => l.status === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Lookup</h1>
          <p className="mt-1 text-gray-500">Search, filter, and view clinical summaries.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or MRN..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All patients</option>
              <option value="alert">With alerts</option>
              <option value="recent">Seen in last 7 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                  >
                    Patient <SortIcon column="name" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => toggleSort('mrn')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                  >
                    MRN <SortIcon column="mrn" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conditions</th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => toggleSort('lastEncounter')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                  >
                    Last encounter <SortIcon column="lastEncounter" />
                  </button>
                </th>
                <th className="px-5 py-3 text-left">
                  <button
                    onClick={() => toggleSort('alerts')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase hover:text-gray-700"
                  >
                    Alerts <SortIcon column="alerts" />
                  </button>
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sorted.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.gender} • {p.dateOfBirth}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-600">{p.mrn}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.conditions.slice(0, 2).map((c) => (
                        <span key={c} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {c}
                        </span>
                      ))}
                      {p.conditions.length > 2 && (
                        <span className="text-xs text-gray-500">+{p.conditions.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {p.lastEncounter ? new Date(p.lastEncounter).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {hasAlerts(p) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3.5 w-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Summary <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No patients match your search.</p>
          </div>
        )}
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50">
            <ClinicalSummary
              patient={selected}
              onClose={() => setSelected(null)}
              onScheduleVisit={(id) => { onNavigate('meetings'); setSelected(null); }}
              onSendMessage={(id) => { onNavigate('chat'); setSelected(null); }}
            />
          </div>
        </>
      )}
    </div>
  );
}
