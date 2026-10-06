import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FakeCrashOverlayProps {
  onDismiss: () => void;
}

export const FakeCrashOverlay: React.FC<FakeCrashOverlayProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xs w-full p-6 text-neutral-200 shadow-2xl">
        <div className="flex items-center gap-3 mb-3 text-neutral-100">
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Phone keeps stopping</span>
        </div>

        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          The application encountered an unexpected runtime error and closed to protect process stability.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onDismiss}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-100 font-semibold text-xs rounded-xl transition-colors"
          >
            Close app
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2 text-neutral-500 hover:text-neutral-400 text-xs transition-colors"
          >
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
};
