import React, { useState } from 'react';
import {
  Settings,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sliders,
  Mail,
  Download
} from 'lucide-react';
import { GlobalAppSettings } from '../types/admin';

interface AppSettingsManagerProps {
  settings: GlobalAppSettings;
  userRole: 'superadmin' | 'auditor';
  onUpdateSettings: (newSettings: GlobalAppSettings) => void;
  onExportJsonBackup: () => void;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({
  settings,
  userRole,
  onUpdateSettings,
  onExportJsonBackup,
}) => {
  const [appName, setAppName] = useState(settings.appName);
  const [minSupportedVersion, setMinSupportedVersion] = useState(settings.minSupportedVersion);
  const [latestVersion, setLatestVersion] = useState(settings.latestVersion);
  const [forceUpdateEnabled, setForceUpdateEnabled] = useState(settings.forceUpdateEnabled);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [maintenanceNotice, setMaintenanceNotice] = useState(settings.maintenanceNotice);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [aiDetectionSensitivity, setAiDetectionSensitivity] = useState(settings.aiDetectionSensitivity);
  const [antiCheatTolerancePercent, setAntiCheatTolerancePercent] = useState(settings.antiCheatTolerancePercent);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      appName,
      minSupportedVersion,
      latestVersion,
      forceUpdateEnabled,
      maintenanceMode,
      maintenanceNotice,
      supportEmail,
      aiDetectionSensitivity,
      antiCheatTolerancePercent,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Paramètres Techniques de l'Application Mobile
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez la version minimale forcée, le mode maintenance et les seuils de détection IA sur Android
          </p>
        </div>

        <button
          onClick={onExportJsonBackup}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exporter sauvegarde Firestore JSON</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Android Versioning Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Contrôle de Versioning & Mise à Jour Forcée</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 font-medium">
              Application ID : {settings.appPackageId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-medium text-slate-700 block">Version actuelle publiée :</label>
              <input
                type="text"
                value={latestVersion}
                onChange={(e) => setLatestVersion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 block">Version minimale requise :</label>
              <input
                type="text"
                value={minSupportedVersion}
                onChange={(e) => setMinSupportedVersion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700 block">Email Support client :</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={forceUpdateEnabled}
                onChange={(e) => setForceUpdateEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium text-slate-800">
                Bloquer les versions antérieures à {minSupportedVersion} avec invite de mise à jour Play Store
              </span>
            </label>
          </div>
        </div>

        {/* Maintenance Mode Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Mode Maintenance Globale</span>
            </div>
            {maintenanceMode ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[11px]">
                Actuellement en maintenance
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                Service opérationnel
              </span>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <div>
                <span className="font-semibold text-amber-900 block">
                  Activer le mode maintenance sur les téléphones
                </span>
                <span className="text-[11px] text-amber-700">
                  L'application affichera un écran d'attente bloquant sans déconnecter les athlètes.
                </span>
              </div>
            </label>

            {maintenanceMode && (
              <div className="space-y-1">
                <label className="font-medium text-slate-700 block">Message affiché aux utilisateurs :</label>
                <textarea
                  rows={2}
                  value={maintenanceNotice}
                  onChange={(e) => setMaintenanceNotice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* AI & Anti-Cheat Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Seuils de Tolérance de l'Arbitrage IA (ML Kit)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Sensibilité de détection de pose :</span>
                <span className="font-bold text-slate-900">{Math.round(aiDetectionSensitivity * 100)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={Math.round(aiDetectionSensitivity * 100)}
                onChange={(e) => setAiDetectionSensitivity(Number(e.target.value) / 100)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Plus la sensibilité est haute, plus l'athlète doit être parfaitement cadré dans l'objectif.
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Tolérance de triche (Vitesse anormale) :</span>
                <span className="font-bold text-slate-900">{antiCheatTolerancePercent}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                value={antiCheatTolerancePercent}
                onChange={(e) => setAntiCheatTolerancePercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Rejette les répétitions effectuées à une vitesse non physiologiquement humaine (&lt;0.4s/rep).
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        {userRole === 'superadmin' && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Paramètres enregistrés et diffusés en direct !
              </span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres globaux</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
