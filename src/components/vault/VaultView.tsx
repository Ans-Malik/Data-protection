import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Plus,
  Search,
  Settings,
  Heart,
  Image as ImageIcon,
  Camera,
  FolderPlus,
  Shield,
  EyeOff,
  AlertTriangle,
  Folder,
  SlidersHorizontal,
} from 'lucide-react';
import { VaultPhoto, VaultAlbum, VaultConfig, AccessLog } from '../../types';
import { PhotoLightbox } from './PhotoLightbox';
import { CameraModal } from './CameraModal';
import { VaultSettingsModal } from './VaultSettingsModal';

interface VaultViewProps {
  isDecoy: boolean;
  photos: VaultPhoto[];
  albums: VaultAlbum[];
  config: VaultConfig;
  logs: AccessLog[];
  onLock: () => void;
  onTriggerFakeCrash: () => void;
  onAddPhoto: (photo: VaultPhoto) => void;
  onUpdatePhoto: (photo: VaultPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onCreateAlbum: (name: string, isDecoy: boolean) => void;
  onSaveConfig: (updated: Partial<VaultConfig>) => void;
  onResetData: () => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  isDecoy,
  photos,
  albums,
  config,
  logs,
  onLock,
  onTriggerFakeCrash,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  onCreateAlbum,
  onSaveConfig,
  onResetData,
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activePhoto, setActivePhoto] = useState<VaultPhoto | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddAlbumOpen, setIsAddAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Panic button (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (config.panicAction === 'fake_crash') {
          onTriggerFakeCrash();
        } else {
          onLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.panicAction, onLock, onTriggerFakeCrash]);

  // Filter current photos
  const filteredPhotos = photos.filter((p) => {
    if (onlyFavorites && !p.isFavorite) return false;
    if (selectedAlbum !== 'all' && p.album !== selectedAlbum) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      const matchNotes = p.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchNotes) return false;
    }
    return true;
  });

  // Filter albums for current mode
  const currentAlbums = albums.filter((a) => a.isDecoy === isDecoy);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newPhoto: VaultPhoto = {
            id: 'photo_' + Date.now() + Math.random().toString(36).substring(2, 6),
            title: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl: reader.result,
            timestamp: Date.now(),
            album: selectedAlbum !== 'all' ? selectedAlbum : (currentAlbums[0]?.name || 'General'),
            isFavorite: false,
            size: file.size,
            mimeType: file.type || 'image/jpeg',
            tags: ['upload'],
            isDecoy,
          };
          onAddPhoto(newPhoto);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCameraCapture = (dataUrl: string) => {
    const newPhoto: VaultPhoto = {
      id: 'photo_' + Date.now(),
      title: `Snapshot_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}`,
      dataUrl,
      timestamp: Date.now(),
      album: selectedAlbum !== 'all' ? selectedAlbum : (currentAlbums[0]?.name || 'General'),
      isFavorite: false,
      size: Math.round(dataUrl.length * 0.75),
      mimeType: 'image/jpeg',
      tags: ['camera', 'secure-capture'],
      isDecoy,
    };
    onAddPhoto(newPhoto);
    setIsCameraOpen(false);
  };

  const handleCreateAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    onCreateAlbum(newAlbumName.trim(), isDecoy);
    setSelectedAlbum(newAlbumName.trim());
    setNewAlbumName('');
    setIsAddAlbumOpen(false);
  };

  const handleToggleFavorite = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) {
      onUpdatePhoto({ ...target, isFavorite: !target.isFavorite });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-hidden select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Vault Top Bar */}
      <div className="px-5 pt-3 pb-3 border-b border-neutral-900 bg-neutral-950 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDecoy ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  {isDecoy ? 'Private Album' : 'Encrypted Vault'}
                </h1>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                    isDecoy
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {isDecoy ? 'Decoy Safe' : 'Master Safe'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                {photos.length} item{photos.length === 1 ? '' : 's'} protected
              </span>
            </div>
          </div>

          {/* Action buttons: Panic Lock, Add, Settings */}
          <div className="flex items-center gap-2">
            {/* Panic Lock button */}
            <button
              onClick={() => {
                if (config.panicAction === 'fake_crash') {
                  onTriggerFakeCrash();
                } else {
                  onLock();
                }
              }}
              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all border border-red-500/30 active:scale-95"
              title="PANIC SWITCH: Instantly lock & hide vault!"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>

            {/* Upload File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center transition-colors"
              title="Upload Photos"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Camera Capture */}
            <button
              onClick={() => setIsCameraOpen(true)}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 flex items-center justify-center transition-colors"
              title="Camera Capture"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 flex items-center justify-center transition-colors"
              title="Vault Settings & Security"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Favorites Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, or note..."
              className="w-full bg-neutral-900 text-xs text-neutral-200 placeholder:text-neutral-500 rounded-lg pl-8 pr-3 py-2 border border-neutral-850 focus:outline-none focus:border-neutral-700"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              onlyFavorites
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-850'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            <span>Favs</span>
          </button>
        </div>

        {/* Albums Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3 py-1 rounded-md shrink-0 transition-colors ${
              selectedAlbum === 'all'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Items ({photos.length})
          </button>

          {currentAlbums.map((album) => {
            const count = photos.filter((p) => p.album === album.name).length;
            return (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album.name)}
                className={`px-3 py-1 rounded-md shrink-0 transition-colors flex items-center gap-1.5 ${
                  selectedAlbum === album.name
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{album.name}</span>
                <span className="text-[10px] text-neutral-500">({count})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddAlbumOpen(true)}
            className="px-2.5 py-1 text-blue-400 hover:text-blue-300 shrink-0 flex items-center gap-1"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Album</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500 text-xs gap-3 text-center">
            <ImageIcon className="w-10 h-10 opacity-30" />
            <div>
              <p className="font-semibold text-neutral-400 text-sm mb-1">No Photos Found</p>
              <p className="max-w-xs text-neutral-500">
                {search
                  ? 'No photos matching your query.'
                  : 'Tap the + or Camera button above to import encrypted photos into this vault.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer border border-neutral-850 hover:border-neutral-700 transition-all duration-200 shadow-sm"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Favorite badge */}
                {photo.isFavorite && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-red-500">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}

                {/* Hover overlay with title & album */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                  <span className="text-xs font-semibold text-white truncate block">
                    {photo.title}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    {photo.album}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <PhotoLightbox
          photo={activePhoto}
          albums={currentAlbums}
          onClose={() => setActivePhoto(null)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={onDeletePhoto}
          onUpdatePhoto={(updated) => {
            onUpdatePhoto(updated);
            setActivePhoto(updated);
          }}
        />
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Vault Settings Modal */}
      {isSettingsOpen && (
        <VaultSettingsModal
          config={config}
          logs={logs}
          onSaveConfig={onSaveConfig}
          onResetData={onResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Add New Album Dialog */}
      {isAddAlbumOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xs w-full p-5 text-neutral-100 shadow-2xl">
            <h3 className="text-sm font-bold mb-3">Create New Album</h3>
            <form onSubmit={handleCreateAlbumSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Album name..."
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                className="w-full bg-neutral-850 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAlbumOpen(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
