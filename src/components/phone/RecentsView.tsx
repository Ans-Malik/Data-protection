import React, { useState } from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone, Trash2, Info } from 'lucide-react';
import { CallLog } from '../../types';

interface RecentsViewProps {
  calls: CallLog[];
  onCall: (number: string) => void;
  onClearCalls: () => void;
}

export const RecentsView: React.FC<RecentsViewProps> = ({ calls, onCall, onClearCalls }) => {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filteredCalls = calls.filter((c) => (filter === 'all' ? true : c.type === 'missed'));

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Top Header & Segmented Filter */}
      <div className="px-5 pt-3 pb-3 border-b border-neutral-900 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Recents</h1>
          {calls.length > 0 && (
            <button
              onClick={onClearCalls}
              className="text-xs font-medium text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Segmented Control */}
        <div className="flex items-center p-0.5 bg-neutral-900 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'missed'
                ? 'bg-neutral-800 text-red-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/80 px-2">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-sm">
            <span>No {filter === 'missed' ? 'missed' : 'recent'} calls</span>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const isMissed = call.type === 'missed';
            return (
              <div
                key={call.id}
                onClick={() => onCall(call.number)}
                className="flex items-center justify-between py-3.5 px-3 hover:bg-neutral-900/60 transition-colors cursor-pointer rounded-xl group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isMissed
                        ? 'bg-red-500/10 text-red-400'
                        : call.type === 'outgoing'
                        ? 'bg-neutral-850 text-neutral-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {isMissed ? (
                      <PhoneMissed className="w-4 h-4" />
                    ) : call.type === 'outgoing' ? (
                      <PhoneOutgoing className="w-4 h-4" />
                    ) : (
                      <PhoneIncoming className="w-4 h-4" />
                    )}
                  </div>

                  {/* Name & Number */}
                  <div className="min-w-0 flex flex-col">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isMissed ? 'text-red-400' : 'text-neutral-100'
                      }`}
                    >
                      {call.name || call.number}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>{call.number}</span>
                      {call.duration ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{formatDuration(call.duration)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp and Call CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-neutral-500 font-mono">
                    {formatTimestamp(call.timestamp)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCall(call.number);
                    }}
                    className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-emerald-600 hover:text-white text-neutral-400 flex items-center justify-center transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
