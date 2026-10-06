import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, ShieldAlert } from 'lucide-react';

interface StatusBarProps {
  onQuickInfo?: () => void;
  isVaultMode?: boolean;
  vaultType?: 'real' | 'decoy';
}

export const StatusBar: React.FC<StatusBarProps> = ({ onQuickInfo, isVaultMode, vaultType }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold select-none text-neutral-300">
      {/* Left: Time & Discreet Safe Indicator */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono tracking-tight text-[13px]">{timeStr || '9:41'}</span>
        {isVaultMode && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              vaultType === 'real' ? 'bg-amber-400/80 animate-pulse' : 'bg-emerald-400/80'
            }`}
            title={vaultType === 'real' ? 'Secure Vault Active' : 'Decoy Mode Active'}
          />
        )}
      </div>

      {/* Center: Dynamic Island / Speaker notch simulation */}
      <div 
        onClick={onQuickInfo}
        className="w-20 h-4 bg-neutral-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
        title="Tap for secret vault instructions"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-900/60" />
        </div>
      </div>

      {/* Right: Cellular, WiFi, Battery */}
      <div className="flex items-center gap-2">
        {/* Signal Bars */}
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-0.5 h-1 bg-neutral-300 rounded-xs" />
          <span className="w-0.5 h-1.5 bg-neutral-300 rounded-xs" />
          <span className="w-0.5 h-2 bg-neutral-300 rounded-xs" />
          <span className="w-0.5 h-3 bg-neutral-300 rounded-xs" />
        </div>

        {/* 5G label */}
        <span className="text-[10px] font-mono tracking-tighter text-neutral-400 font-bold">5G</span>

        {/* WiFi */}
        <Wifi className="w-3.5 h-3.5 text-neutral-300 stroke-[2.5]" />

        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-2.5 rounded-[3px] border border-neutral-400 p-[1px] flex items-center">
            <div className="h-full w-[82%] bg-emerald-400 rounded-[1.5px]" />
          </div>
          <div className="w-0.5 h-1 bg-neutral-400 rounded-r-xs" />
        </div>
      </div>
    </div>
  );
};
