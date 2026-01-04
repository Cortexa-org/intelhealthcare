import React, { useState } from 'react';
import { Settings, Save, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { User } from '../../types';

export interface ThresholdRule {
  low?: number;
  high?: number;
  critical_low?: number;
  critical_high?: number;
}

const DEFAULT_THRESHOLDS: Record<string, { label: string; unit: string; rules: ThresholdRule }> = {
  heart_rate: { label: 'Heart rate', unit: 'bpm', rules: { low: 50, high: 120, critical_high: 150 } },
  oxygen_saturation: { label: 'SpO₂', unit: '%', rules: { low: 90, critical_low: 85 } },
  blood_pressure_systolic: { label: 'BP systolic', unit: 'mmHg', rules: { high: 140, critical_high: 180 } },
  blood_pressure_diastolic: { label: 'BP diastolic', unit: 'mmHg', rules: { high: 90, critical_high: 110 } },
  temperature: { label: 'Temperature', unit: '°F', rules: { low: 96.0, high: 100.4, critical_high: 103.0 } },
  glucose: { label: 'Glucose', unit: 'mg/dL', rules: { low: 70, high: 180, critical_high: 300 } },
};

interface ThresholdConfigProps {
  user: User | null;
}

export default function ThresholdConfig({ user }: ThresholdConfigProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thresholds, setThresholds] = useState<Record<string, ThresholdRule>>(() => {
    const out: Record<string, ThresholdRule> = {};
    for (const [k, v] of Object.entries(DEFAULT_THRESHOLDS)) {
      out[k] = { ...v.rules };
    }
    return out;
  });

  const updateRule = (metric: string, key: keyof ThresholdRule, value: number) => {
    setThresholds((prev) => ({
      ...prev,
      [metric]: { ...prev[metric], [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (user?.role !== 'clinician' && user?.role !== 'admin') return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Configurable alert thresholds (FR-1)</h3>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-200">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Thresholds are for demonstration. In production, changes would require clinical approval and sync with backend.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DEFAULT_THRESHOLDS).map(([key, { label, unit, rules }]) => (
              <div key={key} className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-medium text-gray-900">{label}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {'low' in rules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">Low</label>
                      <input
                        type="number"
                        value={thresholds[key]?.low ?? ''}
                        onChange={(e) => updateRule(key, 'low', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {'high' in rules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">High</label>
                      <input
                        type="number"
                        value={thresholds[key]?.high ?? ''}
                        onChange={(e) => updateRule(key, 'high', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {'critical_low' in rules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">Critical low</label>
                      <input
                        type="number"
                        value={thresholds[key]?.critical_low ?? ''}
                        onChange={(e) => updateRule(key, 'critical_low', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {'critical_high' in rules && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">Critical high</label>
                      <input
                        type="number"
                        value={thresholds[key]?.critical_high ?? ''}
                        onChange={(e) => updateRule(key, 'critical_high', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{unit}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="h-4 w-4" />
              {saved ? 'Saved' : 'Save thresholds'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
