import React, { useState } from 'react';
import { KinematicRule } from '../types/admin';
import {
  Activity,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Eye,
  Zap,
  Lock
} from 'lucide-react';

interface DojoAiManagerProps {
  rules: KinematicRule[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateRule: (updatedRule: KinematicRule) => void;
}

export const DojoAiManager: React.FC<DojoAiManagerProps> = ({
  rules,
  userRole = 'superadmin',
  onUpdateRule,
}) => {
  const [activeRuleId, setActiveRuleId] = useState<string>(rules[0]?.exerciseId || 'pushup');
  const [savedNotification, setSavedNotification] = useState(false);

  const selectedRule = rules.find((r) => r.exerciseId === activeRuleId) || rules[0];

  const handleSliderChange = (key: keyof KinematicRule, value: any) => {
    if (!selectedRule || userRole !== 'superadmin') return;
    const updated = { ...selectedRule, [key]: value };
    onUpdateRule(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Paramétrage du moteur de vision IA (Dojo)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajustez à distance les angles articulaires et le filtre anti-triche sans republier l'application mobile
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Synchronisé avec l'application</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Exercise Selector */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Exercices supervisés ({rules.length})
          </span>

          <div className="space-y-1.5">
            {rules.map((rule) => {
              const isSelected = rule.exerciseId === activeRuleId;
              return (
                <button
                  key={rule.exerciseId}
                  onClick={() => setActiveRuleId(rule.exerciseId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{rule.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sensibilité : {(rule.sensitivity * 100).toFixed(0)}% • {rule.strictMode ? 'Anti-triche strict' : 'Tolérant'}
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      rule.active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Exercise Details */}
        {selectedRule && (
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedRule.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID Module : {selectedRule.exerciseId}_counter.dart</p>
              </div>

              {userRole === 'superadmin' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <span>Actif dans l'application</span>
                  <input
                    type="checkbox"
                    checked={selectedRule.active}
                    onChange={(e) => handleSliderChange('active', e.target.checked)}
                    className="accent-blue-600 w-4 h-4 rounded"
                  />
                </label>
              )}
            </div>

            {/* Angular Sliders */}
            <div className="space-y-5 text-xs">
              {/* Sensitivity */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Tolérance angulaire (Sensibilité) : {(selectedRule.sensitivity * 100).toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedRule.sensitivity > 0.8
                      ? 'Permissif (Novice)'
                      : selectedRule.sensitivity < 0.5
                      ? 'Strict (Compétition)'
                      : 'Standard'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  disabled={userRole !== 'superadmin'}
                  value={selectedRule.sensitivity}
                  onChange={(e) => handleSliderChange('sensitivity', parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Min & Max angles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Angle bas maximum (Flexion)</span>
                    <span className="text-blue-600">{selectedRule.minAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="110"
                    step="1"
                    disabled={userRole !== 'superadmin'}
                    value={selectedRule.minAngle}
                    onChange={(e) => handleSliderChange('minAngle', parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    L'articulation doit descendre sous cet angle pour valider la phase basse.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Angle haut minimum (Extension)</span>
                    <span className="text-blue-600">{selectedRule.maxAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="180"
                    step="1"
                    disabled={userRole !== 'superadmin'}
                    value={selectedRule.maxAngle}
                    onChange={(e) => handleSliderChange('maxAngle', parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    L'athlète doit verrouiller son articulation au-dessus de cet angle pour compter 1 rep.
                  </p>
                </div>
              </div>

              {/* Anti-cheat Mode */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Arbitrage anti-triche strict (Duels 1v1)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rejette automatiquement les répétitions précipitées (&lt; 0.6s) ou sans gainage lombaire.
                  </p>
                </div>

                {userRole === 'superadmin' && (
                  <button
                    type="button"
                    onClick={() => handleSliderChange('strictMode', !selectedRule.strictMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedRule.strictMode
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedRule.strictMode ? 'Actif' : 'Désactivé'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
