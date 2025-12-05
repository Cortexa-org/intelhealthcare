import React, { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LabResult } from '../../types';

interface LabResultsProps {
  results: LabResult[];
  compact?: boolean;
  maxVisible?: number;
}

export default function LabResults({ results, compact = false, maxVisible = 6 }: LabResultsProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? results : results.slice(0, maxVisible);
  const hasMore = results.length > maxVisible;

  const statusStyles = (status: LabResult['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
      case 'low':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const TrendIcon = ({ status }: { status: LabResult['status'] }) => {
    if (status === 'high') return <TrendingUp className="h-3.5 w-3.5" />;
    if (status === 'low') return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  return (
    <div className={compact ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-indigo-600" />
          Lab results
        </h3>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {expanded ? (
              <>Show less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show all ({results.length}) <ChevronDown className="h-4 w-4" /></>
            )}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No lab results on file.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{r.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(r.performedAt).toLocaleDateString()} • {r.referenceRange ?? '—'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="font-semibold text-gray-900">
                  {r.value} {r.unit ?? ''}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles(r.status)}`}
                >
                  <TrendIcon status={r.status} />
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
