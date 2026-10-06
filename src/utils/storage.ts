import { CallLog, Contact, Voicemail, VaultPhoto, VaultAlbum, VaultConfig, AccessLog } from '../types';

const DB_NAME = 'PhoneDialerVaultDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

const DEFAULT_CONFIG: VaultConfig = {
  realPasscode: '*#7777#',
  decoyPasscode: '*#1234#',
  biometricsEnabled: true,
  decoyVaultEnabled: true,
  panicAction: 'dialer',
  autoLockSeconds: 0,
  vaultDisguiseName: 'Private Album',
};

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        store.createIndex('isDecoy', 'isDecoy', { unique: false });
        store.createIndex('album', 'album', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Default Seed Contacts
const DEFAULT_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Mom ❤️', number: '+1 (555) 234-8901', favorite: true, label: 'Mobile' },
  { id: 'c2', name: 'Alex Henderson', number: '+1 (555) 987-6543', favorite: true, label: 'Mobile', email: 'alex.h@gmail.com' },
  { id: 'c3', name: 'Dr. Sarah Mitchell', number: '+1 (555) 432-1098', favorite: false, label: 'Work', email: 'dr.mitchell@clinic.org' },
  { id: 'c4', name: 'Emma Watson', number: '+1 (555) 876-5432', favorite: false, label: 'Mobile' },
  { id: 'c5', name: 'Home Wifi Tech Support', number: '+1 (800) 555-0199', favorite: false, label: 'Home' },
  { id: 'c6', name: 'Marcus Sterling', number: '+1 (555) 345-6789', favorite: true, label: 'Work', email: 'm.sterling@capital.com' },
  { id: 'c7', name: 'Rachel Green', number: '+1 (555) 210-9876', favorite: false, label: 'Mobile' },
];

// Default Seed Call History
const DEFAULT_CALLS: CallLog[] = [
  { id: 'cl1', name: 'Mom ❤️', number: '+1 (555) 234-8901', timestamp: Date.now() - 1000 * 60 * 24, type: 'incoming', duration: 342 },
  { id: 'cl2', name: 'Alex Henderson', number: '+1 (555) 987-6543', timestamp: Date.now() - 1000 * 60 * 85, type: 'outgoing', duration: 114 },
  { id: 'cl3', name: 'Unknown Caller', number: '+1 (800) 443-2910', timestamp: Date.now() - 1000 * 60 * 210, type: 'missed' },
  { id: 'cl4', name: 'Dr. Sarah Mitchell', number: '+1 (555) 432-1098', timestamp: Date.now() - 1000 * 60 * 60 * 5, type: 'outgoing', duration: 65 },
  { id: 'cl5', name: 'Marcus Sterling', number: '+1 (555) 345-6789', timestamp: Date.now() - 1000 * 60 * 60 * 22, type: 'incoming', duration: 520 },
];

// Default Seed Voicemails
const DEFAULT_VOICEMAILS: Voicemail[] = [
  {
    id: 'vm1',
    name: 'Mom ❤️',
    number: '+1 (555) 234-8901',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    duration: 38,
    transcript: "Hey honey! Just checking in to see if you're coming over for Sunday brunch. Let me know by tomorrow so I can pick up the groceries. Love you!",
    unread: true,
  },
  {
    id: 'vm2',
    name: 'Dr. Sarah Mitchell',
    number: '+1 (555) 432-1098',
    timestamp: Date.now() - 1000 * 60 * 60 * 28,
    duration: 24,
    transcript: "Hello, this is City Medical. Calling to confirm your annual checkup appointment for Thursday at 2:30 PM. Please bring your health insurance card.",
    unread: false,
  },
];

// Default Albums
export const DEFAULT_ALBUMS: VaultAlbum[] = [
  // Real Vault Albums
  { id: 'album_secure_docs', name: 'Confidential Documents', isDecoy: false, description: 'Passports, IDs and recovery seeds' },
  { id: 'album_secure_personal', name: 'Personal & Private', isDecoy: false, description: 'Private photos and memories' },
  { id: 'album_secure_finance', name: 'Financial Records', isDecoy: false, description: 'Cards, receipts and contracts' },
  
  // Decoy Vault Albums (Innocent!)
  { id: 'album_decoy_pets', name: 'Bella & Pets', isDecoy: true, description: 'Park walks and cute pet moments' },
  { id: 'album_decoy_travel', name: 'Rocky Mountain Trip', isDecoy: true, description: 'Summer vacation 2026' },
  { id: 'album_decoy_food', name: 'Favorite Recipes & Cafes', isDecoy: true, description: 'Brunch, latte art & baking' },
];

// Initial seed photos
const SEED_PHOTOS: VaultPhoto[] = [
  // Decoy Photos (Innocent)
  {
    id: 'photo_decoy_1',
    title: 'Sunny morning at the park with Bella',
    dataUrl: '/src/assets/images/decoy_golden_retriever_1791262775450.jpg',
    timestamp: Date.now() - 86400000 * 2,
    album: 'Bella & Pets',
    isFavorite: true,
    size: 2420000,
    mimeType: 'image/jpeg',
    tags: ['dog', 'golden retriever', 'park'],
    isDecoy: true,
    notes: 'Bella caught the frisbee 3 times in a row!',
  },
  {
    id: 'photo_decoy_2',
    title: 'Lake Louise reflection peaks',
    dataUrl: '/src/assets/images/decoy_mountain_landscape_1791262790131.jpg',
    timestamp: Date.now() - 86400000 * 5,
    album: 'Rocky Mountain Trip',
    isFavorite: true,
    size: 3180000,
    mimeType: 'image/jpeg',
    tags: ['mountains', 'lake', 'canada', 'nature'],
    isDecoy: true,
    notes: 'Incredible sunrise at 6:15 AM before crowds arrived.',
  },
  {
    id: 'photo_decoy_3',
    title: 'Oat cappuccino & fresh croissant',
    dataUrl: '/src/assets/images/decoy_artisan_coffee_1791262801261.jpg',
    timestamp: Date.now() - 86400000 * 7,
    album: 'Favorite Recipes & Cafes',
    isFavorite: false,
    size: 1950000,
    mimeType: 'image/jpeg',
    tags: ['coffee', 'bakery', 'breakfast'],
    isDecoy: true,
    notes: 'The roasted hazelnut notes were delicious.',
  },

  // Real Vault Photos (Confidential / Private)
  {
    id: 'photo_real_1',
    title: 'Secret Skyline Terrace - Project Horizon',
    dataUrl: '/src/assets/images/vault_night_skyline_1791262813698.jpg',
    timestamp: Date.now() - 86400000 * 3,
    album: 'Personal & Private',
    isFavorite: true,
    size: 2840000,
    mimeType: 'image/jpeg',
    tags: ['private', 'twilight', 'location'],
    isDecoy: false,
    notes: 'Confidential rendezvous rooftop location.',
  },
  {
    id: 'photo_real_2',
    title: 'Biometric Passport Scan & Travel Visa (Encrypted Backup)',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#0f172a"/>
        <rect x="40" y="40" width="720" height="520" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <rect x="80" y="80" width="200" height="240" rx="12" fill="#090d16" stroke="#475569" stroke-dasharray="4 4"/>
        <circle cx="180" cy="170" r="45" fill="#3b82f6" opacity="0.3"/>
        <path d="M140 270 C140 220, 220 220, 220 270" stroke="#60a5fa" stroke-width="6" fill="none"/>
        <circle cx="180" cy="165" r="28" fill="#93c5fd"/>
        
        <text x="320" y="110" fill="#94a3b8" font-family="monospace" font-size="14">PASSPORT / PASSEPORT</text>
        <text x="320" y="140" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="bold">CONFIDENTIAL IDENTITY DOCUMENT</text>
        
        <text x="320" y="190" fill="#64748b" font-family="sans-serif" font-size="12">SURNAME / NOM</text>
        <text x="320" y="215" fill="#e2e8f0" font-family="monospace" font-size="18" font-weight="600">VAULT HOLDER</text>
        
        <text x="320" y="260" fill="#64748b" font-family="sans-serif" font-size="12">PASSPORT NO.</text>
        <text x="320" y="285" fill="#38bdf8" font-family="monospace" font-size="18">P889201476B</text>
        
        <text x="540" y="260" fill="#64748b" font-family="sans-serif" font-size="12">NATIONALITY</text>
        <text x="540" y="285" fill="#e2e8f0" font-family="monospace" font-size="18">SECURE / PRIV</text>
        
        <rect x="80" y="370" width="640" height="130" rx="8" fill="#0f172a" stroke="#1e293b"/>
        <text x="100" y="420" fill="#38bdf8" font-family="monospace" font-size="18" letter-spacing="4">P&lt;PRVVAULT&lt;&lt;HOLDER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
        <text x="100" y="460" fill="#38bdf8" font-family="monospace" font-size="18" letter-spacing="4">8892014760PRV8901018M3201015&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text>

        <rect x="620" y="80" width="80" height="40" rx="6" fill="#10b981" opacity="0.15"/>
        <text x="635" y="105" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="bold">VALID</text>
      </svg>
    `)}`,
    timestamp: Date.now() - 86400000 * 12,
    album: 'Confidential Documents',
    isFavorite: true,
    size: 420000,
    mimeType: 'image/svg+xml',
    tags: ['passport', 'identity', 'confidential', 'official'],
    isDecoy: false,
    notes: 'Encrypted travel backup document. Expires 2034.',
  },
  {
    id: 'photo_real_3',
    title: 'Cryptographic Hardware Wallet Backup Key (Paper Seed)',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#18181b"/>
        <rect x="40" y="40" width="720" height="520" rx="16" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>
        <circle cx="100" cy="90" r="24" fill="#f59e0b" opacity="0.2"/>
        <text x="92" y="98" fill="#fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">₿</text>
        <text x="140" y="88" fill="#f4f4f5" font-family="sans-serif" font-size="20" font-weight="bold">COLD RECOVERY SEED SHEET</text>
        <text x="140" y="112" fill="#a1a1aa" font-family="sans-serif" font-size="13">BIP39 24-Word Master Hardware Seed (Do not share)</text>
        
        <g fill="#18181b" stroke="#3f3f46" stroke-width="1">
          <rect x="80" y="150" width="180" height="44" rx="8"/>
          <rect x="310" y="150" width="180" height="44" rx="8"/>
          <rect x="540" y="150" width="180" height="44" rx="8"/>

          <rect x="80" y="210" width="180" height="44" rx="8"/>
          <rect x="310" y="210" width="180" height="44" rx="8"/>
          <rect x="540" y="210" width="180" height="44" rx="8"/>

          <rect x="80" y="270" width="180" height="44" rx="8"/>
          <rect x="310" y="270" width="180" height="44" rx="8"/>
          <rect x="540" y="270" width="180" height="44" rx="8"/>

          <rect x="80" y="330" width="180" height="44" rx="8"/>
          <rect x="310" y="330" width="180" height="44" rx="8"/>
          <rect x="540" y="330" width="180" height="44" rx="8"/>
        </g>

        <g fill="#e4e4e7" font-family="monospace" font-size="14">
          <text x="100" y="177">01. quantum</text>
          <text x="330" y="177">02. nebula</text>
          <text x="560" y="177">03. timber</text>

          <text x="100" y="237">04. velvet</text>
          <text x="330" y="237">05. glacier</text>
          <text x="560" y="237">06. falcon</text>

          <text x="100" y="297">07. sapphire</text>
          <text x="330" y="297">08. orbital</text>
          <text x="560" y="297">09. catalyst</text>

          <text x="100" y="357">10. thunder</text>
          <text x="330" y="357">11. beacon</text>
          <text x="560" y="357">12. prism</text>
        </g>
        
        <rect x="80" y="420" width="640" height="80" rx="8" fill="#451a03" stroke="#78350f"/>
        <text x="110" y="455" fill="#fde68a" font-family="sans-serif" font-size="14" font-weight="bold">WARNING: HIGH SECURITY MATERIAL</text>
        <text x="110" y="480" fill="#fef3c7" font-family="sans-serif" font-size="12">Never enter these words into unverified web applications. Stored in phone biometric vault.</text>
      </svg>
    `)}`,
    timestamp: Date.now() - 86400000 * 18,
    album: 'Financial Records',
    isFavorite: false,
    size: 210000,
    mimeType: 'image/svg+xml',
    tags: ['crypto', 'seed', 'recovery', 'finance', 'backup'],
    isDecoy: false,
    notes: 'Emergency master key phrase for cold storage.',
  },
];

// LocalStorage Helper
const KEYS = {
  CONFIG: 'vault_config_v1',
  CONTACTS: 'phone_contacts_v1',
  CALLS: 'phone_calls_v1',
  VOICEMAILS: 'phone_voicemails_v1',
  ALBUMS: 'vault_albums_v1',
  LOGS: 'vault_logs_v1',
  SEEDED: 'vault_initialized_v1',
};

export const Storage = {
  // Config
  getConfig(): VaultConfig {
    try {
      const data = localStorage.getItem(KEYS.CONFIG);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig(config: Partial<VaultConfig>): VaultConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(updated));
    return updated;
  },

  // Contacts
  getContacts(): Contact[] {
    try {
      const data = localStorage.getItem(KEYS.CONTACTS);
      return data ? JSON.parse(data) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  },

  saveContact(contact: Contact) {
    const contacts = this.getContacts();
    const index = contacts.findIndex((c) => c.id === contact.id);
    if (index >= 0) {
      contacts[index] = contact;
    } else {
      contacts.unshift(contact);
    }
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    return contacts;
  },

  deleteContact(id: string) {
    const contacts = this.getContacts().filter((c) => c.id !== id);
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    return contacts;
  },

  // Calls
  getCalls(): CallLog[] {
    try {
      const data = localStorage.getItem(KEYS.CALLS);
      return data ? JSON.parse(data) : DEFAULT_CALLS;
    } catch {
      return DEFAULT_CALLS;
    }
  },

  addCall(call: Omit<CallLog, 'id'>): CallLog {
    const calls = this.getCalls();
    const newCall: CallLog = {
      ...call,
      id: 'call_' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    calls.unshift(newCall);
    localStorage.setItem(KEYS.CALLS, JSON.stringify(calls.slice(0, 50)));
    return newCall;
  },

  clearCalls() {
    localStorage.setItem(KEYS.CALLS, JSON.stringify([]));
  },

  // Voicemails
  getVoicemails(): Voicemail[] {
    try {
      const data = localStorage.getItem(KEYS.VOICEMAILS);
      return data ? JSON.parse(data) : DEFAULT_VOICEMAILS;
    } catch {
      return DEFAULT_VOICEMAILS;
    }
  },

  markVoicemailRead(id: string) {
    const vms = this.getVoicemails().map((vm) => (vm.id === id ? { ...vm, unread: false } : vm));
    localStorage.setItem(KEYS.VOICEMAILS, JSON.stringify(vms));
    return vms;
  },

  deleteVoicemail(id: string) {
    const vms = this.getVoicemails().filter((vm) => vm.id !== id);
    localStorage.setItem(KEYS.VOICEMAILS, JSON.stringify(vms));
    return vms;
  },

  // Albums
  getAlbums(): VaultAlbum[] {
    try {
      const data = localStorage.getItem(KEYS.ALBUMS);
      return data ? JSON.parse(data) : DEFAULT_ALBUMS;
    } catch {
      return DEFAULT_ALBUMS;
    }
  },

  addAlbum(name: string, isDecoy: boolean): VaultAlbum {
    const albums = this.getAlbums();
    const newAlbum: VaultAlbum = {
      id: 'album_' + Date.now(),
      name,
      isDecoy,
    };
    albums.push(newAlbum);
    localStorage.setItem(KEYS.ALBUMS, JSON.stringify(albums));
    return newAlbum;
  },

  // Access Logs
  getLogs(): AccessLog[] {
    try {
      const data = localStorage.getItem(KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addLog(entry: Omit<AccessLog, 'id'>) {
    const logs = this.getLogs();
    const newLog: AccessLog = {
      ...entry,
      id: 'log_' + Date.now(),
    };
    logs.unshift(newLog);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 30)));
    return newLog;
  },

  // IndexedDB Photos API
  async getAllPhotos(isDecoy: boolean): Promise<VaultPhoto[]> {
    await this.initStorage();
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(PHOTO_STORE, 'readonly');
        const store = tx.objectStore(PHOTO_STORE);
        const index = store.index('isDecoy');
        const request = index.getAll(IDBKeyRange.only(isDecoy));
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback in memory / localStorage
      return SEED_PHOTOS.filter((p) => p.isDecoy === isDecoy);
    }
  },

  async addPhoto(photo: VaultPhoto): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.put(photo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async updatePhoto(photo: VaultPhoto): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.put(photo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deletePhoto(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Seed on initial launch
  async initStorage(): Promise<void> {
    const isSeeded = localStorage.getItem(KEYS.SEEDED);
    if (!isSeeded) {
      try {
        const db = await openDB();
        const tx = db.transaction(PHOTO_STORE, 'readwrite');
        const store = tx.objectStore(PHOTO_STORE);
        for (const p of SEED_PHOTOS) {
          store.put(p);
        }
        await new Promise((resolve) => {
          tx.oncomplete = resolve;
        });
      } catch (err) {
        console.warn('Could not seed indexeddb:', err);
      }
      localStorage.setItem(KEYS.SEEDED, 'true');
      localStorage.setItem(KEYS.ALBUMS, JSON.stringify(DEFAULT_ALBUMS));
      localStorage.setItem(KEYS.CONTACTS, JSON.stringify(DEFAULT_CONTACTS));
      localStorage.setItem(KEYS.CALLS, JSON.stringify(DEFAULT_CALLS));
      localStorage.setItem(KEYS.VOICEMAILS, JSON.stringify(DEFAULT_VOICEMAILS));
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
  },

  async resetAllToDefault(): Promise<void> {
    localStorage.removeItem(KEYS.SEEDED);
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.CONTACTS);
    localStorage.removeItem(KEYS.CALLS);
    localStorage.removeItem(KEYS.VOICEMAILS);
    localStorage.removeItem(KEYS.ALBUMS);
    localStorage.removeItem(KEYS.LOGS);
    try {
      const db = await openDB();
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).clear();
    } catch {}
    await this.initStorage();
  },
};
