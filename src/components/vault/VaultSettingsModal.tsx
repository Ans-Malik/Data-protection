import React, { useState } from 'react';
import { X, Shield, Lock, EyeOff, AlertCircle, Smartphone, History, Check, RotateCcw } from 'lucide-react';
import { VaultConfig, AccessLog } from '../../types';

interface VaultSettingsModalProps {
  config: VaultConfig;
  logs: AccessLog[];
  onSaveConfig: (updated: Partial<VaultConfig>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const VaultSettingsModal: React.FC<VaultSettingsModalProps> = ({
  config,
  logs,
  onSaveConfig,
  onResetData,
  onClose,
}) => {
  const [realCode, setRealCode] = useState(config.realPasscode);
  const [decoyCode, setDecoyCode] = useState(config.decoyPasscode);
  const [biometricsEnabled, setBiometricsEnabled] = useState(config.biometricsEnabled);
  const [decoyEnabled, setDecoyEnabled] = useState(config.decoyVaultEnabled);
  const [panicAction, setPanicAction] = useState(config.panicAction);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'logs'>('security');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      realPasscode: realCode.trim() || '*#7777#',
      decoyPasscode: decoyCode.trim() || '*#1234#',
      biometricsEnabled,
      decoyVaultEnabled: decoyEnabled,
      panicAction,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const formatLogTime = (ts: number) => {
    return new Date(ts).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">Vault Security & Privacy</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 px-5 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Access Codes & Defense
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({logs.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'security' ? (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Real Vault Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Real Vault Dialer Code</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">Format: *#XXXX#</span>
                </div>
                <input
                  type="text"
                  value={realCode}
                  onChange={(e) => setRealCode(e.target.value)}
                  placeholder="*#7777#"
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-neutral-400">
                  Dial this code in the phone dialer to unlock your real confidential photo vault.
                </p>
              </div>

              {/* Decoy Vault Code */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-850">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Decoy Vault Dialer Code</span>
                  </label>
                  <span className="text-[10px] text-emerald-500 font-mono">Coercion Shield</span>
                </div>
                <input
                  type="text"
                  value={decoyCode}
                  onChange={(e) => setDecoyCode(e.target.value)}
                  placeholder="*#1234#"
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-neutral-400">
                  Entering this code displays innocent everyday photos (pets, food, trips). Protects you if coerced to open the phone.
                </p>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3 pt-2 border-t border-neutral-850">
                {/* Biometrics Toggle */}
                <div className="flex items-center justify-between p-3 bg-neutral-850 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold block text-neutral-200">
                      Biometric Authentication
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Require Touch ID / Face ID scan before opening real vault
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricsEnabled}
                    onChange={(e) => setBiometricsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Decoy Vault Toggle */}
                <div className="flex items-center justify-between p-3 bg-neutral-850 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold block text-neutral-200">
                      Enable Decoy Vault
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Allows unlocking decoy safe with alternate passcode
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={decoyEnabled}
                    onChange={(e) => setDecoyEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Panic Switch Action */}
                <div className="p-3 bg-neutral-850 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200">
                      Panic Switch Action
                    </span>
                    <span className="text-[10px] text-neutral-400">When panic button tapped</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPanicAction('dialer')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        panicAction === 'dialer'
                          ? 'bg-neutral-800 border-blue-500 text-blue-400 font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Instant Dialer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanicAction('fake_crash')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        panicAction === 'fake_crash'
                          ? 'bg-neutral-800 border-red-500 text-red-400 font-semibold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Simulated Crash
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  {isSaved ? <Check className="w-4 h-4" /> : null}
                  <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Audit Logs View */
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Log of vault entries and dialed codes for forensic tracking.
              </p>
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No security incidents or access events logged yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-850">
                  {logs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === 'real_vault'
                              ? 'bg-blue-400'
                              : log.type === 'decoy_vault'
                              ? 'bg-emerald-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <div>
                          <span className="text-xs font-medium text-neutral-200 block">
                            {log.type === 'real_vault'
                              ? 'Master Vault Access'
                              : log.type === 'decoy_vault'
                              ? 'Decoy Vault Triggered'
                              : 'Unknown Secret Dialed'}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Code: {log.codeUsed}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formatLogTime(log.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-neutral-850">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all vault photos, passcodes, and dialer data to default?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Data to Initial Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
