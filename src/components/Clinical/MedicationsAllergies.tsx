import React from 'react';
import { Pill, AlertTriangle, Plus } from 'lucide-react';
import { Medication, Allergy } from '../../types';

interface MedicationsAllergiesProps {
  medications: Medication[];
  allergies: Allergy[];
  compact?: boolean;
  onAddMedication?: () => void;
  onAddAllergy?: () => void;
}

export default function MedicationsAllergies({
  medications,
  allergies,
  compact = false,
  onAddMedication,
  onAddAllergy,
}: MedicationsAllergiesProps) {
  const severityColor = (s?: string) => {
    if (!s) return 'bg-gray-100 text-gray-800';
    if (s === 'severe') return 'bg-red-100 text-red-800';
    if (s === 'moderate') return 'bg-amber-100 text-amber-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-green-100 text-green-800';
    if (s === 'prn') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className={`space-y-6 ${compact ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Medications & Allergies</h3>
        <div className="flex gap-2">
          {onAddMedication && (
            <button
              onClick={onAddMedication}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" /> Add med
            </button>
          )}
          {onAddAllergy && (
            <button
              onClick={onAddAllergy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" /> Add allergy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Pill className="h-4 w-4 text-blue-600" />
            Current medications ({medications.length})
          </h4>
          {medications.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No medications on file.</p>
          ) : (
            <ul className="space-y-2">
              {medications.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-600">
                      {m.dose}
                      {m.frequency ? ` • ${m.frequency}` : ''}
                      {m.route ? ` • ${m.route}` : ''}
                    </p>
                    {!compact && m.prescribedBy && (
                      <p className="text-xs text-gray-500 mt-1">Prescribed by {m.prescribedBy}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}
                  >
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Allergies ({allergies.length})
          </h4>
          {allergies.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No known allergies.</p>
          ) : (
            <ul className="space-y-2">
              {allergies.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{a.substance}</p>
                    {a.reaction && <p className="text-sm text-gray-600">{a.reaction}</p>}
                  </div>
                  {a.severity && (
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${severityColor(a.severity)}`}
                    >
                      {a.severity}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
