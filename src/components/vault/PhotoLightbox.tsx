import React, { useState } from 'react';
import { X, Heart, Trash2, Download, Info, Tag, Calendar, Folder, FileText, Check } from 'lucide-react';
import { VaultPhoto, VaultAlbum } from '../../types';

interface PhotoLightboxProps {
  photo: VaultPhoto;
  albums: VaultAlbum[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePhoto: (updated: VaultPhoto) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  albums,
  onClose,
  onToggleFavorite,
  onDelete,
  onUpdatePhoto,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [notes, setNotes] = useState(photo.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(photo.album);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `${photo.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveNotes = () => {
    onUpdatePhoto({
      ...photo,
      notes,
      album: currentAlbum,
    });
    setIsEditingNotes(false);
  };

  const handleAlbumChange = (newAlbum: string) => {
    setCurrentAlbum(newAlbum);
    onUpdatePhoto({
      ...photo,
      album: newAlbum,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between animate-in fade-in select-none">
      {/* Top Controls Bar */}
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-[200px] sm:max-w-xs truncate">
            <h3 className="text-sm font-semibold text-white truncate">{photo.title}</h3>
            <span className="text-[11px] text-neutral-400 font-mono">{photo.album}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(photo.id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              photo.isFavorite
                ? 'bg-red-500/20 text-red-500'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              showInfo
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300'
            }`}
            title="Photo Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 flex items-center justify-center transition-colors"
            title="Download / Export"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm('Permanently remove this photo from the encrypted vault?')) {
                onDelete(photo.id);
                onClose();
              }
            }}
            className="w-9 h-9 rounded-full bg-neutral-900/80 hover:bg-red-600/30 text-neutral-300 hover:text-red-400 flex items-center justify-center transition-colors"
            title="Delete Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden">
        <img
          src={photo.dataUrl}
          alt={photo.title}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all"
        />

        {/* Info & Metadata Drawer */}
        {showInfo && (
          <div className="absolute right-4 top-4 bottom-4 w-80 bg-neutral-900/95 border border-neutral-800 backdrop-blur-md rounded-2xl p-5 overflow-y-auto flex flex-col gap-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Photo Metadata
              </span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block mb-0.5">Title</span>
                <span className="text-white font-medium">{photo.title}</span>
              </div>

              <div>
                <span className="text-neutral-500 block mb-0.5">Album Location</span>
                <select
                  value={currentAlbum}
                  onChange={(e) => handleAlbumChange(e.target.value)}
                  className="w-full bg-neutral-800 text-white rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:outline-none"
                >
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.name}>
                      {alb.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-neutral-500 block mb-0.5">Date Added</span>
                <span className="text-neutral-300 font-mono">{formatTimestamp(photo.timestamp)}</span>
              </div>

              <div>
                <span className="text-neutral-500 block mb-0.5">File Size</span>
                <span className="text-neutral-300 font-mono">{formatFileSize(photo.size)}</span>
              </div>

              <div>
                <span className="text-neutral-500 block mb-0.5">Storage Mode</span>
                <span className="text-emerald-400 font-medium">Local Encrypted IndexedDB</span>
              </div>

              {photo.tags.length > 0 && (
                <div>
                  <span className="text-neutral-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1 text-[11px] text-neutral-300 font-mono">
                    {photo.tags.map((t, idx) => (
                      <span key={t}>
                        #{t}
                        {idx < photo.tags.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Private Notes */}
              <div className="pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Private Note</span>
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-blue-400 hover:text-blue-300 text-[11px]"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add secure notes for this photo..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <p className="text-neutral-300 italic bg-neutral-800/60 p-2.5 rounded-lg text-[11px] leading-relaxed">
                    {notes || 'No private notes attached.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Thumbnail Bar */}
      <div className="p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
        <span className="text-xs text-neutral-500 font-mono">
          Protected by Biometric Security Layer
        </span>
      </div>
    </div>
  );
};
