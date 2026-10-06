import React, { useState, useEffect } from 'react';
import { Play, Pause, Phone, Trash2, Mic } from 'lucide-react';
import { Voicemail } from '../../types';

interface VoicemailViewProps {
  voicemails: Voicemail[];
  onCall: (number: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export const VoicemailView: React.FC<VoicemailViewProps> = ({
  voicemails,
  onCall,
  onDelete,
  onMarkRead,
}) => {
  const [activeVmId, setActiveVmId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && activeVmId) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 5;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeVmId]);

  const handleTogglePlay = (vm: Voicemail) => {
    if (activeVmId === vm.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveVmId(vm.id);
      setIsPlaying(true);
      setProgress(0);
      onMarkRead(vm.id);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      <div className="px-5 pt-3 pb-3 border-b border-neutral-900 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white">Voicemail</h1>
        <span className="text-xs font-semibold text-neutral-400">Carrier Audio</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 divide-y divide-neutral-900/80">
        {voicemails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-sm gap-2">
            <Mic className="w-8 h-8 opacity-40" />
            <span>No voicemails</span>
          </div>
        ) : (
          voicemails.map((vm) => {
            const isSelected = activeVmId === vm.id;
            return (
              <div key={vm.id} className="py-4">
                <div
                  onClick={() => handleTogglePlay(vm)}
                  className="flex items-start justify-between cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative mt-1">
                      <div className="w-9 h-9 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-neutral-200">
                        {isSelected && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-blue-400" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5 text-neutral-300" />
                        )}
                      </div>
                      {vm.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-neutral-950" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-neutral-100">{vm.name || vm.number}</h3>
                      <p className="text-xs text-neutral-500 font-mono">{formatTimestamp(vm.timestamp)} · {vm.duration}s</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCall(vm.number);
                      }}
                      className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-emerald-600 hover:text-white text-neutral-400 flex items-center justify-center transition-colors"
                      title="Call back"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(vm.id);
                      }}
                      className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-600 hover:text-white text-neutral-400 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Audio Progress Scrubber */}
                {isSelected && (
                  <div className="mt-3 pl-12 pr-2">
                    <div className="w-full bg-neutral-850 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {/* Transcript */}
                    <div className="mt-3 p-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-neutral-300 leading-relaxed">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                        Transcription
                      </span>
                      "{vm.transcript}"
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
