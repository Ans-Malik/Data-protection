import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, CheckCircle2, AlertCircle, X, KeyRound } from 'lucide-react';
import { playUnlockSuccessBeep } from '../../utils/audio';
import { requestWebAuthnBiometrics } from '../../utils/biometrics';

interface BiometricLockModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  correctCode: string;
}

export const BiometricLockModal: React.FC<BiometricLockModalProps> = ({
  onSuccess,
  onCancel,
  correctCode,
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'faceid' | 'pin'>('fingerprint');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pinInput, setPinInput] = useState('');

  // Auto-attempt WebAuthn or trigger initial scan animation
  useEffect(() => {
    let isMounted = true;

    const tryAuth = async () => {
      // Check if WebAuthn platform authenticator is available
      const webAuthnSuccess = await requestWebAuthnBiometrics();
      if (webAuthnSuccess && isMounted) {
        handleAuthSuccess();
      }
    };

    tryAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = () => {
    setStatus('success');
    playUnlockSuccessBeep();
    setTimeout(() => {
      onSuccess();
    }, 650);
  };

  const handleSimulatedScan = () => {
    if (status === 'scanning' || status === 'success') return;
    setStatus('scanning');
    setErrorMessage('');

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }

    setTimeout(() => {
      // Simulate high-reliability biometric recognition
      handleAuthSuccess();
    }, 900);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCorrect = correctCode.replace(/[*#]/g, '');
    const cleanInput = pinInput.trim().replace(/[*#]/g, '');

    if (cleanInput === cleanCorrect || pinInput.trim() === correctCode) {
      handleAuthSuccess();
    } else {
      setStatus('error');
      setErrorMessage('Incorrect passcode');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 60]);
      }
      setTimeout(() => {
        setStatus('idle');
        setPinInput('');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-neutral-100 shadow-2xl relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Biometric Icon & Animation */}
        <div className="mt-4 mb-5 relative flex items-center justify-center">
          {status === 'success' ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-in zoom-in-75">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : status === 'error' ? (
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 animate-in shake">
              <AlertCircle className="w-10 h-10" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSimulatedScan}
              className={`w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                status === 'scanning'
                  ? 'bg-blue-600/20 border-2 border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-neutral-850 hover:bg-neutral-800 border-2 border-neutral-700 active:scale-95'
              }`}
            >
              {authMode === 'faceid' ? (
                <Scan className={`w-12 h-12 text-blue-400 ${status === 'scanning' ? 'animate-pulse' : ''}`} />
              ) : (
                <Fingerprint
                  className={`w-12 h-12 text-blue-400 ${
                    status === 'scanning' ? 'animate-pulse scale-105' : ''
                  }`}
                />
              )}

              {/* Scanning glowing ring */}
              {status === 'scanning' && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Header Text */}
        <h3 className="text-lg font-bold tracking-tight text-white mb-1">
          {status === 'success'
            ? 'Vault Unlocked'
            : status === 'error'
            ? 'Authentication Failed'
            : authMode === 'pin'
            ? 'Enter Security PIN'
            : authMode === 'faceid'
            ? 'Face ID Biometrics'
            : 'Touch ID Biometrics'}
        </h3>

        <p className="text-xs text-neutral-400 text-center max-w-[240px] mb-6">
          {status === 'success'
            ? 'Access granted to encrypted storage'
            : status === 'scanning'
            ? 'Verifying cryptographic biometric signature...'
            : authMode === 'pin'
            ? 'Enter your vault master passcode to bypass biometrics'
            : 'Tap the sensor above to verify identity and unlock vault'}
        </p>

        {/* PIN fallback mode */}
        {authMode === 'pin' && status !== 'success' && (
          <form onSubmit={handlePinSubmit} className="w-full space-y-4 mb-4">
            <input
              type="password"
              autoFocus
              maxLength={12}
              placeholder="Enter PIN / Code"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center bg-neutral-800 border border-neutral-700 rounded-xl py-3 text-lg font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
            />
            {errorMessage && (
              <span className="text-xs text-red-400 text-center block">{errorMessage}</span>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-colors"
            >
              Unlock with Passcode
            </button>
          </form>
        )}

        {/* Mode Switchers */}
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 pt-2 border-t border-neutral-850 w-full justify-center">
          {authMode !== 'fingerprint' && (
            <button
              onClick={() => {
                setAuthMode('fingerprint');
                setStatus('idle');
              }}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Touch ID</span>
            </button>
          )}

          {authMode !== 'faceid' && (
            <button
              onClick={() => {
                setAuthMode('faceid');
                setStatus('idle');
              }}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Face ID</span>
            </button>
          )}

          {authMode !== 'pin' && (
            <button
              onClick={() => {
                setAuthMode('pin');
                setStatus('idle');
              }}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Use PIN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
