import React, { useState, useEffect, useRef } from 'react';
import { Phone, Delete, UserPlus, Sparkles, KeyRound } from 'lucide-react';
import { playDTMFTone } from '../../utils/audio';

interface KeypadViewProps {
  onCall: (number: string) => void;
  onUnlockVault: (type: 'real' | 'decoy') => void;
  onAddContact: (number: string) => void;
  realCode: string;
  decoyCode: string;
  onOpenGuide: () => void;
}

interface DialKey {
  digit: string;
  sub: string;
}

const DIAL_KEYS: DialKey[] = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'A B C' },
  { digit: '3', sub: 'D E F' },
  { digit: '4', sub: 'G H I' },
  { digit: '5', sub: 'J K L' },
  { digit: '6', sub: 'M N O' },
  { digit: '7', sub: 'P Q R S' },
  { digit: '8', sub: 'T U V' },
  { digit: '9', sub: 'W X Y Z' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

export const KeypadView: React.FC<KeypadViewProps> = ({
  onCall,
  onUnlockVault,
  onAddContact,
  realCode,
  decoyCode,
  onOpenGuide,
}) => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeDigit, setActiveDigit] = useState<string | null>(null);
  const backspaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check code on every input
  useEffect(() => {
    if (!dialedNumber) return;

    // Direct match check (e.g. *#7777# or *#1234#)
    if (dialedNumber === realCode) {
      setDialedNumber('');
      onUnlockVault('real');
      return;
    }

    if (dialedNumber === decoyCode) {
      setDialedNumber('');
      onUnlockVault('decoy');
      return;
    }
  }, [dialedNumber, realCode, decoyCode, onUnlockVault]);

  const handleKeyPress = (digit: string) => {
    playDTMFTone(digit);
    setActiveDigit(digit);
    setTimeout(() => setActiveDigit(null), 120);

    setDialedNumber((prev) => {
      const next = prev + digit;
      return next;
    });
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleBackspaceMouseDown = () => {
    handleBackspace();
    backspaceTimerRef.current = setTimeout(() => {
      setDialedNumber('');
    }, 600);
  };

  const handleBackspaceMouseUp = () => {
    if (backspaceTimerRef.current) {
      clearTimeout(backspaceTimerRef.current);
    }
  };

  const handleCall = () => {
    if (!dialedNumber) return;

    // Check if stripped number matches without special chars
    const cleanDialed = dialedNumber.trim();
    const cleanReal = realCode.replace(/[*#]/g, '');
    const cleanDecoy = decoyCode.replace(/[*#]/g, '');

    if (cleanDialed === realCode || cleanDialed === cleanReal) {
      setDialedNumber('');
      onUnlockVault('real');
      return;
    }

    if (cleanDialed === decoyCode || cleanDialed === cleanDecoy) {
      setDialedNumber('');
      onUnlockVault('decoy');
      return;
    }

    // Otherwise standard phone call
    onCall(dialedNumber);
  };

  // Keyboard support for typing digits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'].includes(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleCall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialedNumber]);

  return (
    <div className="flex-1 flex flex-col justify-between px-6 pb-6 pt-2 select-none">
      {/* Top Display Area */}
      <div className="flex flex-col items-center justify-center min-h-[90px] text-center">
        <div className="h-12 flex items-center justify-center w-full px-4">
          <input
            type="text"
            readOnly
            value={dialedNumber}
            placeholder=""
            className="w-full text-center bg-transparent text-white font-mono text-3xl font-medium tracking-wider focus:outline-none placeholder:text-neutral-600 truncate"
          />
        </div>

        {dialedNumber ? (
          <button
            onClick={() => onAddContact(dialedNumber)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 mt-1 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Number</span>
          </button>
        ) : (
          <div className="h-4" />
        )}
      </div>

      {/* Dial Pad Grid */}
      <div className="grid grid-cols-3 gap-y-3.5 gap-x-6 max-w-[320px] mx-auto w-full">
        {DIAL_KEYS.map(({ digit, sub }) => {
          const isActive = activeDigit === digit;
          return (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className={`w-[74px] h-[74px] mx-auto rounded-full flex flex-col items-center justify-center transition-all duration-100 ${
                isActive
                  ? 'bg-neutral-700 scale-95'
                  : 'bg-neutral-900/90 hover:bg-neutral-850 active:bg-neutral-800'
              } border border-neutral-800 shadow-sm`}
            >
              <span className="text-2xl font-normal text-white leading-none font-mono">
                {digit}
              </span>
              {sub ? (
                <span className="text-[9px] font-semibold tracking-widest text-neutral-400 uppercase mt-1 leading-none">
                  {sub}
                </span>
              ) : (
                <span className="h-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Row: Secret Code Hint, Call Button, Backspace */}
      <div className="grid grid-cols-3 items-center max-w-[320px] mx-auto w-full pt-3">
        {/* Left: Secret Guide hint */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenGuide}
            className="w-12 h-12 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 transition-colors"
            title="Secret Codes & Demo Guide"
          >
            <KeyRound className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Center: Call Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCall}
            disabled={!dialedNumber}
            className={`w-[74px] h-[74px] rounded-full flex items-center justify-center transition-all shadow-lg ${
              dialedNumber
                ? 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white shadow-emerald-500/20'
                : 'bg-neutral-850 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Phone className="w-7 h-7 fill-current" />
          </button>
        </div>

        {/* Right: Backspace Button */}
        <div className="flex justify-center">
          {dialedNumber ? (
            <button
              type="button"
              onClick={handleBackspace}
              onMouseDown={handleBackspaceMouseDown}
              onMouseUp={handleBackspaceMouseUp}
              onTouchStart={handleBackspaceMouseDown}
              onTouchEnd={handleBackspaceMouseUp}
              className="w-12 h-12 rounded-full flex items-center justify-center text-neutral-400 hover:text-white active:scale-90 transition-all"
            >
              <Delete className="w-6 h-6 stroke-[1.8]" />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>
      </div>
    </div>
  );
};
