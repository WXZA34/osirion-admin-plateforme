import React, { useState } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Clock,
  Plus,
  X,
  Target
} from 'lucide-react';
import { PushNotificationCampaign } from '../types/admin';

interface PushCampaignsManagerProps {
  campaigns: PushNotificationCampaign[];
  userRole: 'superadmin' | 'auditor';
  onSendCampaign: (campaign: PushNotificationCampaign) => void;
}

export const PushCampaignsManager: React.FC<PushCampaignsManagerProps> = ({
  campaigns,
  userRole,
  onSendCampaign,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('🔥 Votre séance du jour est prête !');
  const [bodyText, setBodyText] = useState('Maintenez votre streak ! Ouvrez Osirion pour valider votre entraînement.');
  const [targetAudience, setTargetAudience] = useState<PushNotificationCampaign['targetAudience']>('ALL_ATHLETES');
  const [deepLinkScreen, setDeepLinkScreen] = useState<PushNotificationCampaign['deepLinkScreen']>('WORKOUT_TODAY');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) return;

    const newCampaign: PushNotificationCampaign = {
      id: `push_${Date.now()}`,
      title,
      bodyText,
      targetAudience,
      scheduledFor: new Date().toISOString(),
      status: 'SENT',
      recipientsCount: targetAudience === 'ALL_ATHLETES' ? 1250 : targetAudience === 'INACTIVE_3_DAYS' ? 240 : 435,
      openRatePercent: 0,
      deepLinkScreen,
    };

    onSendCampaign(newCampaign);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Campagnes de Notifications Push (Firebase FCM)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Envoyez des rappels d'entraînement, alertes de streak et annonces ciblées sur les téléphones des athlètes
          </p>
        </div>

        {userRole === 'superadmin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Créer une notification</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Campaigns Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">
                Historique des notifications envoyées
              </h3>
              <span className="text-xs text-slate-400 font-medium">{campaigns.length} campagnes</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 hover:bg-slate-50/60 transition space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{camp.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{camp.bodyText}</p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        camp.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {camp.status === 'SENT' ? 'Diffusée' : 'Programmée'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      Cible :{' '}
                      {camp.targetAudience === 'ALL_ATHLETES'
                        ? 'Tous les athlètes'
                        : camp.targetAudience === 'INACTIVE_3_DAYS'
                        ? 'Inactifs depuis 3j'
                        : 'Abonnés Pro'}
                    </span>

                    <span>Destinataires : {camp.recipientsCount}</span>

                    {camp.openRatePercent !== undefined && camp.openRatePercent > 0 && (
                      <span className="text-emerald-600 font-semibold">
                        Taux d'ouverture : {camp.openRatePercent}%
                      </span>
                    )}

                    <span className="text-slate-400">
                      Écran lié : <code className="text-slate-600 font-mono">{camp.deepLinkScreen}</code>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Mobile Preview Card */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Smartphone className="w-4 h-4 text-blue-400" />
                Aperçu Écran de Verrouillage Android
              </span>
              <span>En direct</span>
            </div>

            {/* Android Notification Bubble */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    OS
                  </div>
                  <span className="font-semibold text-slate-200">OSIRION</span>
                </div>
                <span>À l'instant</span>
              </div>

              <div>
                <div className="font-semibold text-slate-100 text-xs">{title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{bodyText}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center pt-2">
              Le service Firebase Cloud Messaging garantit une distribution en temps réel avec sonnerie et vibration haptique.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add Campaign */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Nouvelle notification Push FCM
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Titre de la notification :</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Message d'accompagnement :</label>
                <textarea
                  rows={3}
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Audience ciblée :</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="ALL_ATHLETES">Tous les athlètes actifs (~1 250)</option>
                  <option value="INACTIVE_3_DAYS">Inactifs depuis plus de 3 jours (~240)</option>
                  <option value="PRO_SUBSCRIBERS">Abonnés Osirion Pro (~435)</option>
                  <option value="BEGINNERS_ONLY">Débutants inscrits cette semaine (~110)</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Écran mobile de redirection :</label>
                <select
                  value={deepLinkScreen}
                  onChange={(e) => setDeepLinkScreen(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="WORKOUT_TODAY">Séance du jour (Dojo IA)</option>
                  <option value="STORE_PRO">Page d'abonnement Osirion Pro</option>
                  <option value="CHALLENGE_WEEK">Défi hebdomadaire</option>
                  <option value="NEW_SPOT">Carte des spots Street Workout</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Diffuser immédiatement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
