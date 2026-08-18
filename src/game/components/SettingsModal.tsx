import React from 'react';
import { X, Volume2, VolumeX, Music, Smartphone, RotateCcw, Info } from 'lucide-react';
import { PlayerSettings } from '../types';
import { audio } from '../audio/audioManager';

interface SettingsModalProps {
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: PlayerSettings) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetGame,
  onClose,
}) => {
  const toggleSound = () => {
    const next = !settings.soundEnabled;
    audio.setMuted(!next);
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const toggleMusic = () => {
    const next = !settings.musicEnabled;
    audio.setMusicMuted(!next);
    onUpdateSettings({ ...settings, musicEnabled: next });
  };

  const toggleHaptics = () => {
    onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-black text-amber-300">Game Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle options */}
        <div className="py-4 space-y-3">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <span className="text-xs font-bold">Sound Effects</span>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Ambient Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Music
                className={`w-5 h-5 ${
                  settings.musicEnabled ? 'text-purple-400 animate-pulse' : 'text-slate-500'
                }`}
              />
              <span className="text-xs font-bold">Ambient Harp Music</span>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.musicEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.musicEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold">Haptic Feedback</span>
            </div>
            <button
              onClick={toggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.hapticsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Save Section */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all game progress and restart Wishenbloom from the beginning?')) {
                onResetGame();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 font-bold text-xs border border-red-800/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Save Data</span>
          </button>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 pt-1">
            <Info className="w-3 h-3" />
            <span>Wishenbloom v1.0.0 • Cozy Fantasy Mobile Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
