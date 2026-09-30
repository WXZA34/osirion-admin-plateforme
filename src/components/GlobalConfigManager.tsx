import React, { useState } from 'react';
import { DailyVideoConfig, AudioLesson } from '../types/admin';
import {
  Settings,
  Video,
  Headphones,
  BellRing,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  Radio,
  Plus,
  X
} from 'lucide-react';

interface GlobalConfigManagerProps {
  globalConfig: DailyVideoConfig;
  audioLessons: AudioLesson[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateGlobalConfig: (newConfig: DailyVideoConfig) => void;
  onAddAudioLesson: (newAudio: AudioLesson) => void;
}

export const GlobalConfigManager: React.FC<GlobalConfigManagerProps> = ({
  globalConfig,
  audioLessons,
  userRole = 'superadmin',
  onUpdateGlobalConfig,
  onAddAudioLesson,
}) => {
  const [videoConfig, setVideoConfig] = useState<DailyVideoConfig>(globalConfig);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'clan' | 'arc' | 'inactive'>('all');
  const [sentLog, setSentLog] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // New audio lesson
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioSpeaker, setAudioSpeaker] = useState('');
  const [audioCategory, setAudioCategory] = useState<AudioLesson['category']>('Focus');
  const [audioDuration, setAudioDuration] = useState('10');

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'superadmin') return;
    onUpdateGlobalConfig(videoConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle.trim() || !notificationBody.trim() || userRole !== 'superadmin') return;

    setSentLog(`Notification push transmise avec succès au groupe [${targetAudience.toUpperCase()}] !`);
    setNotificationTitle('');
    setNotificationBody('');
    setTimeout(() => setSentLog(null), 4000);
  };

  const handleCreateAudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioTitle.trim()) return;

    const newAudio: AudioLesson = {
      id: `audio_${Date.now()}`,
      title: audioTitle,
      speaker: audioSpeaker || 'Guide Osirion',
      category: audioCategory,
      durationMinutes: parseInt(audioDuration) || 10,
      url: 'https://storage.googleapis.com/osirion-assets/audio/new_lesson.mp3',
    };

    onAddAudioLesson(newAudio);
    setAudioTitle('');
    setShowAudioModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Configuration Globale & Télédiffusion (Remote Config)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mettez à jour le contenu quotidien et diffusez des alertes push sans recompiler l'application mobile
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paramètres synchronisés</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Daily Motivation Video */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" />
              Vidéo & Citation Quotidienne (`global_config`)
            </h3>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              En ligne
            </span>
          </div>

          <form onSubmit={handleSaveVideo} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-600 font-medium mb-1 block">Titre de la capsule vidéo</label>
              <input
                type="text"
                disabled={userRole !== 'superadmin'}
                value={videoConfig.dailyVideoTitle}
                onChange={(e) =>
                  setVideoConfig({ ...videoConfig, dailyVideoTitle: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium mb-1 block">URL Vidéo MP4 / YouTube</label>
              <input
                type="text"
                disabled={userRole !== 'superadmin'}
                value={videoConfig.dailyVideoUrl}
                onChange={(e) =>
                  setVideoConfig({ ...videoConfig, dailyVideoUrl: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-blue-600 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium mb-1 block">Message d'accompagnement</label>
              <textarea
                rows={2}
                disabled={userRole !== 'superadmin'}
                value={videoConfig.dailyVideoDescription}
                onChange={(e) =>
                  setVideoConfig({ ...videoConfig, dailyVideoDescription: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium mb-1 block">Auteur / Source de la citation</label>
              <input
                type="text"
                disabled={userRole !== 'superadmin'}
                value={videoConfig.quoteAuthor}
                onChange={(e) =>
                  setVideoConfig({ ...videoConfig, quoteAuthor: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {userRole === 'superadmin' && (
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Publier dans l'application mobile</span>
              </button>
            )}
          </form>
        </div>

        {/* Section 2: Push Notifications Broadcaster */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              Notifications Push en Direct (FCM)
            </h3>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Canal haute priorité
            </span>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-600 font-medium mb-1 block">Audience ciblée</label>
              <select
                disabled={userRole !== 'superadmin'}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Tous les athlètes actifs (Diffusion globale)</option>
                <option value="arc">Athlètes de l'Arc en cours (Discipline)</option>
                <option value="clan">Membres des clans disputant un bastion</option>
                <option value="inactive">Athlètes inactifs depuis +48h (Rappel de série)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-medium mb-1 block">Titre de la notification</label>
              <input
                type="text"
                required
                disabled={userRole !== 'superadmin'}
                placeholder="ex: ⚔️ Votre Bastion est attaqué !"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium mb-1 block">Message</label>
              <textarea
                rows={2}
                required
                disabled={userRole !== 'superadmin'}
                placeholder="ex: Un guerrier du clan adverse s'entraîne sur votre bastion. Défendez votre territoire !"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {sentLog && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in fade-in">
                {sentLog}
              </div>
            )}

            {userRole === 'superadmin' && (
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer immédiatement</span>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Section 3: Audio Lessons & Sanctuary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-600" />
              Capsules Audio du Sanctuaire (`LibraryAudioEntity`)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pistes audio diffusées dans le Sanctuaire pour la préparation mentale et la concentration
            </p>
          </div>
          {userRole === 'superadmin' && (
            <button
              onClick={() => setShowAudioModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              + Ajouter une piste
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {audioLessons.map((audio) => (
            <div key={audio.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-purple-700">{audio.category}</span>
                <span className="text-slate-400">{audio.durationMinutes} min</span>
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">{audio.title}</h4>
              <p className="text-xs text-slate-500">Orateur : {audio.speaker}</p>
              <div className="text-[11px] font-mono text-slate-400 truncate pt-1">{audio.url}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Audio Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-600" />
              Ajouter une capsule audio
            </h3>
            <form onSubmit={handleCreateAudio} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 font-medium mb-1 block">Titre de la piste</label>
                <input
                  type="text"
                  required
                  placeholder="ex: La Forteresse Intérieure"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium mb-1 block">Orateur / Source</label>
                <input
                  type="text"
                  placeholder="ex: Marc Aurèle Annoté"
                  value={audioSpeaker}
                  onChange={(e) => setAudioSpeaker(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Catégorie</label>
                  <select
                    value={audioCategory}
                    onChange={(e) => setAudioCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Focus">Focus</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Respiration">Respiration</option>
                    <option value="Résilience">Résilience</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Durée (minutes)</label>
                  <input
                    type="number"
                    value={audioDuration}
                    onChange={(e) => setAudioDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAudioModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
