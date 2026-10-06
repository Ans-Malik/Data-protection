import React from 'react';
import { X, Key, Shield, EyeOff, Smartphone, Zap, Fingerprint } from 'lucide-react';

interface SecretGuideModalProps {
  realCode: string;
  decoyCode: string;
  onClose: () => void;
  onQuickUnlock: (type: 'real' | 'decoy') => void;
}

export const SecretGuideModal: React.FC<SecretGuideModalProps> = ({
  realCode,
  decoyCode,
  onClose,
  onQuickUnlock,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-neutral-100 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">Stealth Vault Guide & Codes</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
          This app functions as an authentic smartphone phone dialer with DTMF audio tones, call logs, contacts, and live call simulation. Hidden beneath the keypad are two secret photo vaults.
        </p>

        {/* Secret Codes Cards */}
        <div className="space-y-3.5 mb-6">
          {/* Real Vault */}
          <div className="p-4 bg-neutral-850/80 border border-blue-900/40 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>1. Real Encrypted Vault</span>
              </span>
              <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-mono text-xs rounded font-bold border border-blue-800">
                {realCode}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mb-3">
              Type <strong className="text-white font-mono">{realCode}</strong> directly on the dial pad (or enter {realCode.replace(/[*#]/g, '')} and tap Green Call). Prompts for Biometric verification (Touch ID / Face ID) and unlocks your private documents, IDs, and private photos.
            </p>
            <button
              onClick={() => {
                onClose();
                onQuickUnlock('real');
              }}
              className="w-full py-2 bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Test: Trigger Real Vault Code</span>
            </button>
          </div>

          {/* Decoy Vault */}
          <div className="p-4 bg-neutral-850/80 border border-emerald-900/40 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <EyeOff className="w-4 h-4" />
                <span>2. Decoy Safe (Coercion Defense)</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-xs rounded font-bold border border-emerald-800">
                {decoyCode}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mb-3">
              If forced or coerced to unlock your phone, enter <strong className="text-white font-mono">{decoyCode}</strong>. Opens an innocent photo gallery with harmless pet, recipe, and vacation photos, hiding the existence of your master safe.
            </p>
            <button
              onClick={() => {
                onClose();
                onQuickUnlock('decoy');
              }}
              className="w-full py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Test: Trigger Decoy Code</span>
            </button>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 text-xs text-neutral-400 border-t border-neutral-800 pt-4">
          <div className="flex items-start gap-2">
            <Fingerprint className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-neutral-200">Biometric Verification:</strong> Supports real WebAuthn sensors & interactive Touch ID/Face ID touch scan animation.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-neutral-200">Instant Panic Switch:</strong> Press <strong className="text-neutral-200">Escape</strong> or tap the red Lock button inside the vault to instantly snap back to the dialer.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-semibold text-xs rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
