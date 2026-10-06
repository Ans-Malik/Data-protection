import React, { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  Clock,
  Users,
  Grid,
  Voicemail as VoicemailIcon,
  Shield,
  EyeOff,
  Smartphone,
  Maximize2,
  Minimize2,
  KeyRound,
  Lock,
} from 'lucide-react';
import {
  CallLog,
  Contact,
  Voicemail,
  VaultPhoto,
  VaultAlbum,
  VaultConfig,
  AccessLog,
} from './types';
import { Storage } from './utils/storage';
import { StatusBar } from './components/phone/StatusBar';
import { KeypadView } from './components/phone/KeypadView';
import { RecentsView } from './components/phone/RecentsView';
import { ContactsView } from './components/phone/ContactsView';
import { VoicemailView } from './components/phone/VoicemailView';
import { InCallScreen } from './components/phone/InCallScreen';
import { VaultView } from './components/vault/VaultView';
import { BiometricLockModal } from './components/vault/BiometricLockModal';
import { FakeCrashOverlay } from './components/vault/FakeCrashOverlay';
import { SecretGuideModal } from './components/common/SecretGuideModal';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'keypad' | 'recents' | 'contacts' | 'voicemail'>('keypad');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultType, setVaultType] = useState<'real' | 'decoy' | null>(null);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [pendingUnlockType, setPendingUnlockType] = useState<'real' | 'decoy' | null>(null);
  const [activeCall, setActiveCall] = useState<{ number: string; name?: string } | null>(null);
  const [showFakeCrash, setShowFakeCrash] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [frameMode, setFrameMode] = useState<'phone' | 'fullscreen'>('phone');
  const [initialContactNumber, setInitialContactNumber] = useState('');

  // Data Store
  const [config, setConfig] = useState<VaultConfig>(() => Storage.getConfig());
  const [contacts, setContacts] = useState<Contact[]>(() => Storage.getContacts());
  const [calls, setCalls] = useState<CallLog[]>(() => Storage.getCalls());
  const [voicemails, setVoicemails] = useState<Voicemail[]>(() => Storage.getVoicemails());
  const [albums, setAlbums] = useState<VaultAlbum[]>(() => Storage.getAlbums());
  const [logs, setLogs] = useState<AccessLog[]>(() => Storage.getLogs());
  const [photos, setPhotos] = useState<VaultPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Initialize DB & load photos
  const loadPhotos = useCallback(async (isDecoy: boolean) => {
    setIsLoadingPhotos(true);
    try {
      const data = await Storage.getAllPhotos(isDecoy);
      setPhotos(data);
    } catch {
      setPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    Storage.initStorage().then(() => {
      setConfig(Storage.getConfig());
      setContacts(Storage.getContacts());
      setCalls(Storage.getCalls());
      setVoicemails(Storage.getVoicemails());
      setAlbums(Storage.getAlbums());
      setLogs(Storage.getLogs());
    });
  }, []);

  // When vault is unlocked or type changes, reload photos
  useEffect(() => {
    if (isVaultUnlocked && vaultType) {
      loadPhotos(vaultType === 'decoy');
    }
  }, [isVaultUnlocked, vaultType, loadPhotos]);

  // Handle secret code trigger from Keypad
  const handleUnlockTrigger = (type: 'real' | 'decoy') => {
    if (type === 'real') {
      if (config.biometricsEnabled) {
        setPendingUnlockType('real');
        setShowBiometrics(true);
      } else {
        openVault('real');
      }
    } else {
      // Decoy Vault unlocks directly or if biometrics is required
      if (config.decoyVaultEnabled) {
        openVault('decoy');
      } else {
        // If decoy disabled, treat as real with biometrics
        setPendingUnlockType('real');
        setShowBiometrics(true);
      }
    }
  };

  const openVault = (type: 'real' | 'decoy') => {
    setIsVaultUnlocked(true);
    setVaultType(type);
    setShowBiometrics(false);
    setPendingUnlockType(null);

    // Record access event
    const log = Storage.addLog({
      timestamp: Date.now(),
      type: type === 'real' ? 'real_vault' : 'decoy_vault',
      codeUsed: type === 'real' ? config.realPasscode : config.decoyPasscode,
    });
    setLogs((prev) => [log, ...prev]);
  };

  const handleBiometricSuccess = () => {
    if (pendingUnlockType) {
      openVault(pendingUnlockType);
    } else {
      openVault('real');
    }
  };

  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setVaultType(null);
    setShowBiometrics(false);
    setActiveTab('keypad');
  };

  const handleTriggerFakeCrash = () => {
    setIsVaultUnlocked(false);
    setVaultType(null);
    setShowFakeCrash(true);
  };

  // Calling handlers
  const handleInitiateCall = (number: string) => {
    const contact = contacts.find(
      (c) => c.number.replace(/\D/g, '') === number.replace(/\D/g, '')
    );
    setActiveCall({
      number,
      name: contact ? contact.name : undefined,
    });
  };

  const handleEndCall = (durationSeconds: number) => {
    if (activeCall) {
      const newCall = Storage.addCall({
        name: activeCall.name || activeCall.number,
        number: activeCall.number,
        timestamp: Date.now(),
        type: 'outgoing',
        duration: durationSeconds,
      });
      setCalls((prev) => [newCall, ...prev]);
    }
    setActiveCall(null);
  };

  // Vault Photo Handlers
  const handleAddPhoto = async (photo: VaultPhoto) => {
    await Storage.addPhoto(photo);
    setPhotos((prev) => [photo, ...prev]);
  };

  const handleUpdatePhoto = async (photo: VaultPhoto) => {
    await Storage.updatePhoto(photo);
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? photo : p)));
  };

  const handleDeletePhoto = async (id: string) => {
    await Storage.deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreateAlbum = (name: string, isDecoy: boolean) => {
    const newAlbum = Storage.addAlbum(name, isDecoy);
    setAlbums((prev) => [...prev, newAlbum]);
  };

  const handleSaveConfig = (updated: Partial<VaultConfig>) => {
    const newCfg = Storage.saveConfig(updated);
    setConfig(newCfg);
  };

  const handleResetData = async () => {
    await Storage.resetAllToDefault();
    setConfig(Storage.getConfig());
    setContacts(Storage.getContacts());
    setCalls(Storage.getCalls());
    setVoicemails(Storage.getVoicemails());
    setAlbums(Storage.getAlbums());
    setLogs(Storage.getLogs());
    handleLockVault();
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center font-sans antialiased text-neutral-100 p-0 sm:p-4">
      {/* Stealth Floating Utility Banner */}
      <header className="w-full max-w-sm mb-3 px-3 hidden sm:flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 hover:text-white transition-colors border border-neutral-800 text-[11px]"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Codes: <strong className="text-blue-400 font-mono">*#7777#</strong> / <strong className="text-emerald-400 font-mono">*#1234#</strong></span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Frame mode toggle */}
          <button
            onClick={() => setFrameMode((prev) => (prev === 'phone' ? 'fullscreen' : 'phone'))}
            className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-800 transition-colors"
            title={frameMode === 'phone' ? 'Switch to Fullscreen' : 'Switch to Phone Chassis'}
          >
            {frameMode === 'phone' ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Phone Chassis Container */}
      <section
        aria-label="Phone Dialer Application"
        className={`w-full transition-all duration-300 relative overflow-hidden bg-neutral-950 ${
          frameMode === 'phone'
            ? 'max-w-[390px] h-[844px] rounded-[48px] border-[10px] border-neutral-850 shadow-2xl shadow-black ring-1 ring-neutral-750 flex flex-col'
            : 'h-screen max-w-lg rounded-none border-0 flex flex-col'
        }`}
      >
        {/* Hardware Notch / Status Bar */}
        <StatusBar
          onQuickInfo={() => setShowGuide(true)}
          isVaultMode={isVaultUnlocked}
          vaultType={vaultType || undefined}
        />

        {/* View Switcher: Active Call / Secret Vault / Phone App Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Ongoing Phone Call Screen */}
          {activeCall ? (
            <InCallScreen
              number={activeCall.number}
              name={activeCall.name}
              onEndCall={handleEndCall}
            />
          ) : isVaultUnlocked && vaultType ? (
            /* Unlocked Secret Vault (Real or Decoy) */
            <VaultView
              isDecoy={vaultType === 'decoy'}
              photos={photos}
              albums={albums}
              config={config}
              logs={logs}
              onLock={handleLockVault}
              onTriggerFakeCrash={handleTriggerFakeCrash}
              onAddPhoto={handleAddPhoto}
              onUpdatePhoto={handleUpdatePhoto}
              onDeletePhoto={handleDeletePhoto}
              onCreateAlbum={handleCreateAlbum}
              onSaveConfig={handleSaveConfig}
              onResetData={handleResetData}
            />
          ) : (
            /* Standard Phone Call App Views */
            <>
              {activeTab === 'keypad' && (
                <KeypadView
                  realCode={config.realPasscode}
                  decoyCode={config.decoyPasscode}
                  onCall={handleInitiateCall}
                  onUnlockVault={handleUnlockTrigger}
                  onAddContact={(num) => {
                    setInitialContactNumber(num);
                    setActiveTab('contacts');
                  }}
                  onOpenGuide={() => setShowGuide(true)}
                />
              )}

              {activeTab === 'recents' && (
                <RecentsView
                  calls={calls}
                  onCall={handleInitiateCall}
                  onClearCalls={() => {
                    Storage.clearCalls();
                    setCalls([]);
                  }}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsView
                  contacts={contacts}
                  initialAddNumber={initialContactNumber}
                  onClearInitialAddNumber={() => setInitialContactNumber('')}
                  onCall={handleInitiateCall}
                  onSaveContact={(c) => {
                    const updated = Storage.saveContact(c);
                    setContacts([...updated]);
                  }}
                  onDeleteContact={(id) => {
                    const updated = Storage.deleteContact(id);
                    setContacts([...updated]);
                  }}
                />
              )}

              {activeTab === 'voicemail' && (
                <VoicemailView
                  voicemails={voicemails}
                  onCall={handleInitiateCall}
                  onMarkRead={(id) => {
                    const updated = Storage.markVoicemailRead(id);
                    setVoicemails([...updated]);
                  }}
                  onDelete={(id) => {
                    const updated = Storage.deleteVoicemail(id);
                    setVoicemails([...updated]);
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Phone Navigation Tab Bar (Visible when in dialer mode) */}
        {!isVaultUnlocked && !activeCall && (
          <nav
            aria-label="Phone navigation"
            className="h-16 border-t border-neutral-900 bg-neutral-950/95 backdrop-blur-md grid grid-cols-4 items-center shrink-0 select-none pb-safe"
          >
            {/* Recents */}
            <button
              onClick={() => setActiveTab('recents')}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'recents' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Clock className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium tracking-tight mt-1">Recents</span>
            </button>

            {/* Contacts */}
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'contacts' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Users className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium tracking-tight mt-1">Contacts</span>
            </button>

            {/* Keypad */}
            <button
              onClick={() => setActiveTab('keypad')}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'keypad' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Grid className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium tracking-tight mt-1">Keypad</span>
            </button>

            {/* Voicemail */}
            <button
              onClick={() => setActiveTab('voicemail')}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'voicemail' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <VoicemailIcon className="w-5 h-5 stroke-[2]" />
              <span className="text-[10px] font-medium tracking-tight mt-1">Voicemail</span>
            </button>
          </nav>
        )}

        {/* iPhone Home Indicator bar */}
        <div className="w-32 h-1 bg-neutral-700/60 rounded-full mx-auto my-1.5 shrink-0 pointer-events-none" />
      </section>

      {/* Biometric Verification Modal */}
      {showBiometrics && (
        <BiometricLockModal
          correctCode={config.realPasscode}
          onSuccess={handleBiometricSuccess}
          onCancel={() => {
            setShowBiometrics(false);
            setPendingUnlockType(null);
          }}
        />
      )}

      {/* Simulated System Crash Dialog */}
      {showFakeCrash && (
        <FakeCrashOverlay
          onDismiss={() => {
            setShowFakeCrash(false);
            handleLockVault();
          }}
        />
      )}

      {/* Secret Guide & Quick Test Modal */}
      {showGuide && (
        <SecretGuideModal
          realCode={config.realPasscode}
          decoyCode={config.decoyPasscode}
          onClose={() => setShowGuide(false)}
          onQuickUnlock={(type) => {
            handleUnlockTrigger(type);
          }}
        />
      )}
    </main>
  );
}
