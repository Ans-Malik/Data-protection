export type CallType = 'incoming' | 'outgoing' | 'missed';

export interface CallLog {
  id: string;
  name: string;
  number: string;
  timestamp: number;
  type: CallType;
  duration?: number; // seconds
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  avatar?: string;
  favorite: boolean;
  email?: string;
  label: 'Mobile' | 'Work' | 'Home';
}

export interface Voicemail {
  id: string;
  name: string;
  number: string;
  timestamp: number;
  duration: number; // seconds
  transcript: string;
  unread: boolean;
}

export interface VaultPhoto {
  id: string;
  title: string;
  dataUrl: string;
  timestamp: number;
  album: string;
  isFavorite: boolean;
  size: number; // bytes
  mimeType: string;
  tags: string[];
  isDecoy: boolean;
  notes?: string;
}

export interface VaultAlbum {
  id: string;
  name: string;
  isDecoy: boolean;
  description?: string;
}

export interface AccessLog {
  id: string;
  timestamp: number;
  type: 'real_vault' | 'decoy_vault' | 'failed_code';
  codeUsed: string;
  note?: string;
}

export interface VaultConfig {
  realPasscode: string;     // e.g. "*#7777#"
  decoyPasscode: string;    // e.g. "*#1234#"
  biometricsEnabled: boolean;
  decoyVaultEnabled: boolean;
  panicAction: 'dialer' | 'fake_crash';
  autoLockSeconds: number;
  vaultDisguiseName: string;
}
