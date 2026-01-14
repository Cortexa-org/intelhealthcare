import React from 'react';
import { X, User, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Medication, Allergy, LabResult } from '../../types';
import MedicationsAllergies from '../Clinical/MedicationsAllergies';
import LabResults from '../Clinical/LabResults';

export interface ClinicalSummaryPatient {
  id: string;
  name: string;
  mrn: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  conditions: string[];
  lastEncounter?: string;
  medications: Medication[];
  allergies: Allergy[];
  labResults: LabResult[];
  recentVitals?: { type: string; value: string; unit: string; at: string }[];
}

interface ClinicalSummaryProps {
  patient: ClinicalSummaryPatient;
  onClose: () => void;
  onScheduleVisit?: (patientId: string) => void;
  onSendMessage?: (patientId: string) => void;
}

export default function ClinicalSummary({
  patient,
  onClose,
  onScheduleVisit,
  onSendMessage,
}: ClinicalSummaryProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Clinical Summary</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
              <p className="text-sm text-gray-600 mt-1">
                {patient.dateOfBirth} • {patient.gender}
              </p>
              {patient.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                  <Phone className="h-4 w-4" /> {patient.phone}
                </p>
              )}
              {patient.email && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-4 w-4" /> {patient.email}
                </p>
              )}
              {patient.address && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4" /> {patient.address}
                </p>
              )}
            </div>
          </div>
          {patient.conditions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {patient.conditions.map((c) => (
                  <span
                    key={c}
                    className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {patient.lastEncounter && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Last encounter: {new Date(patient.lastEncounter).toLocaleDateString()}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
            {onScheduleVisit && (
              <button
                onClick={() => onScheduleVisit(patient.id)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Schedule visit
              </button>
            )}
            {onSendMessage && (
              <button
                onClick={() => onSendMessage(patient.id)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Send message
              </button>
            )}
          </div>
        </div>

        {patient.recentVitals && patient.recentVitals.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent vitals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {patient.recentVitals.map((v, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase">{v.type}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {v.value} <span className="text-sm font-normal text-gray-500">{v.unit}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(v.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <MedicationsAllergies
          medications={patient.medications}
          allergies={patient.allergies}
          compact
        />
        <LabResults results={patient.labResults} compact maxVisible={5} />
      </div>
    </div>
  );
}
