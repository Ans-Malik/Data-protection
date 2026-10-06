import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Grid, Plus, Video, Users, PhoneOff } from 'lucide-react';
import { playCallRingtone } from '../../utils/audio';

interface InCallScreenProps {
  number: string;
  name?: string;
  onEndCall: (durationSeconds: number) => void;
}

export const InCallScreen: React.FC<InCallScreenProps> = ({ number, name, onEndCall }) => {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const ringtone = playCallRingtone();

    // Connect call after 2.5 seconds
    const connectTimer = setTimeout(() => {
      ringtone.stop();
      setStatus('connected');
    }, 2800);

    return () => {
      ringtone.stop();
      clearTimeout(connectTimer);
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === 'connected') {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950 flex flex-col justify-between p-6 animate-in fade-in duration-200 select-none">
      {/* Top Caller Info */}
      <div className="flex flex-col items-center pt-10">
        <div className="w-20 h-20 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-2xl font-bold text-neutral-300 mb-4 shadow-inner">
          {(name || number).charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{name || number}</h2>
        <span className="text-sm font-mono text-neutral-400 mt-1">
          {status === 'calling' ? 'Calling...' : formatTimer(duration)}
        </span>
      </div>

      {/* Middle Controls Grid */}
      <div className="grid grid-cols-3 gap-6 max-w-[280px] mx-auto w-full">
        {/* Mute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-16 h-16 mx-auto rounded-full flex flex-col items-center justify-center transition-all ${
            isMuted
              ? 'bg-white text-neutral-900 shadow-md'
              : 'bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-[10px] mt-1 font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>

        {/* Keypad */}
        <button
          className="w-16 h-16 mx-auto rounded-full bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800 flex flex-col items-center justify-center transition-all"
        >
          <Grid className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Keypad</span>
        </button>

        {/* Speaker */}
        <button
          onClick={() => setIsSpeaker(!isSpeaker)}
          className={`w-16 h-16 mx-auto rounded-full flex flex-col items-center justify-center transition-all ${
            isSpeaker
              ? 'bg-white text-neutral-900 shadow-md'
              : 'bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800'
          }`}
        >
          {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          <span className="text-[10px] mt-1 font-medium">{isSpeaker ? 'Speaker' : 'Audio'}</span>
        </button>

        {/* Add Call */}
        <button
          className="w-16 h-16 mx-auto rounded-full bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800 flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
        >
          <Plus className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Add Call</span>
        </button>

        {/* Video */}
        <button
          className="w-16 h-16 mx-auto rounded-full bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800 flex flex-col items-center justify-center opacity-60 cursor-not-allowed"
        >
          <Video className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">FaceTime</span>
        </button>

        {/* Contacts */}
        <button
          className="w-16 h-16 mx-auto rounded-full bg-neutral-900/90 hover:bg-neutral-850 text-white border border-neutral-800 flex flex-col items-center justify-center"
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium">Contacts</span>
        </button>
      </div>

      {/* Bottom End Call Button */}
      <div className="flex justify-center pb-6">
        <button
          onClick={() => onEndCall(duration)}
          className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-all"
          title="End Call"
        >
          <PhoneOff className="w-8 h-8 fill-current" />
        </button>
      </div>
    </div>
  );
};
