import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Scale,
  Wifi,
  Smartphone,
  Flame,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Terminal,
  Clock,
  Radio,
  X,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AthleteUser } from '../types/admin';

interface SupervisorTelemetryBarProps {
  athletes: AthleteUser[];
}

export const SupervisorTelemetryBar: React.FC<SupervisorTelemetryBarProps> = ({ athletes }) => {
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [latencyMs, setLatencyMs] = useState(24);
  const [fpsVal, setFpsVal] = useState(29.8);
  const [activeDojoStreams, setActiveDojoStreams] = useState(18);

  // Événements télémétriques en direct générés dynamiquement
  const [liveTelemetryLogs, setLiveTelemetryLogs] = useState<
    Array<{ id: string; time: string; athlete: string; event: string; type: 'rep' | 'pose' | 'quest' | 'alert' }>
  >([
    {
      id: 'log-1',
      time: '12:24:15',
      athlete: 'Thomas Dupont',
      event: 'Dojo IA : Série de 20 tractions validée • ROM 96.4% (Coudes 165°)',
      type: 'rep',
    },
    {
      id: 'log-2',
      time: '12:23:50',
      athlete: 'Maxime Rousseau',
      event: 'Maintien Isométrique : L-Sit 45s validé • Tolérance angulaire tenue',
      type: 'rep',
    },
    {
      id: 'log-3',
      time: '12:22:30',
      athlete: 'Sarah Benali',
      event: 'Dual Balance : +120 XP Sagesse (Codex 20 pages complété)',
      type: 'quest',
    },
    {
      id: 'log-4',
      time: '12:20:12',
      athlete: 'Lucas Marchand',
      event: 'Pose Detection : Calibration ML Kit effectuée (Samsung S24)',
      type: 'pose',
    },
  ]);

  // Calcul dynamique de la Force globale vs Sagesse globale
  const totalForceXp = athletes.reduce((acc, u) => acc + (u.forceXp || 0), 0);
  const totalWisdomXp = athletes.reduce((acc, u) => acc + (u.wisdomXp || 0), 0);
  const combinedXp = totalForceXp + totalWisdomXp || 1;
  const forcePct = Math.round((totalForceXp / combinedXp) * 100);
  const wisdomPct = 100 - forcePct;

  // Calcul du nombre d'athlètes en ligne ou en entraînement
  const activeTrainingAthletes = athletes.filter((u) => u.onlineStatus === 'training' || u.status === 'ACTIVE').length;

  // Simulation de fluctuations de télémétrie en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuations de latence entre 19ms et 31ms
      setLatencyMs(Math.floor(19 + Math.random() * 12));
      setFpsVal(Number((29.4 + Math.random() * 0.8).toFixed(1)));

      // Occasionnellement ajouter un événement télémétrique
      if (Math.random() > 0.6) {
        const sampleAthletes = athletes.filter((a) => a.status === 'ACTIVE');
        if (sampleAthletes.length > 0) {
          const randAth = sampleAthletes[Math.floor(Math.random() * sampleAthletes.length)];
          const events = [
            `Dojo ML Kit : Angle coude ${Math.floor(82 + Math.random() * 10)}° détecté (Flexion pompe valide)`,
            `Balance des Forces : +50 XP Force octroyés à @${randAth.username}`,
            `GPS Bastion : Snapping d'allure ${Math.floor(3 + Math.random() * 2)}'${Math.floor(10 + Math.random() * 45)}" /km`,
            `Telemetry Heartbeat : Packet FCM reçu depuis ${randAth.deviceModel}`,
          ];
          const newEntry = {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            athlete: randAth.fullName,
            event: events[Math.floor(Math.random() * events.length)],
            type: (Math.random() > 0.5 ? 'rep' : 'pose') as any,
          };
          setLiveTelemetryLogs((prev) => [newEntry, ...prev.slice(0, 15)]);
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [athletes]);

  return (
    <>
      {/* Barre de Supervision Fixe / Omniprésente */}
      <div className="bg-slate-900 border-b border-slate-800 text-white text-xs select-none sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          
          {/* Section 1: Statut Superviseur & Flotte Mobile */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold tracking-wider text-[11px] text-emerald-400 uppercase font-mono">
                SUPERVISEUR ACTIF
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block" />

            {/* Clients Flutter & Latence */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>
                <strong className="text-white font-mono">{activeTrainingAthletes}</strong> athlètes connectés
              </span>
              <span className="text-slate-500">•</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-400">{latencyMs}ms</span>
            </div>
          </div>

          {/* Section 2: Balance des Forces Globale (FORCE vs SAGESSE) */}
          <div className="flex items-center gap-2.5 shrink-0 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-bold text-sky-400 font-mono">FORCE {forcePct}%</span>
              <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden flex p-0.5">
                <div className="h-full bg-sky-400 rounded-l-full transition-all duration-500" style={{ width: `${forcePct}%` }} />
                <div className="h-full bg-amber-400 rounded-r-full transition-all duration-500" style={{ width: `${wisdomPct}%` }} />
              </div>
              <span className="font-bold text-amber-400 font-mono">SAGESSE {wisdomPct}%</span>
            </div>
            <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2 hidden md:inline">
              ROYAL ARC
            </span>
          </div>

          {/* Section 3: Télémétrie Dojo ML Kit & Déclencheur Moniteur */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Pose Stream : <strong className="text-white font-mono">{fpsVal} FPS</strong></span>
              <span className="text-slate-500">•</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Précision ROM : <strong className="text-emerald-400 font-mono">94.2%</strong></span>
            </div>

            <button
              onClick={() => setIsTelemetryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-[11px] font-semibold transition"
            >
              <Terminal className="w-3 h-3 text-blue-400" />
              <span>Moniteur Télémétrie</span>
            </button>
          </div>

        </div>
      </div>

      {/* MODAL / TIROIR DE TÉLÉMÉTRIE EN DIRECT */}
      {isTelemetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Console de Télémétrie & Supervision Osirion</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                      LIVE STREAM
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspection en direct des paquets Flutter ML Kit, de la Balance des Forces et du statut des athlètes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTelemetryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Latence WebSocket</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">{latencyMs} ms</div>
                <div className="text-[10px] text-slate-500">Google Cloud London</div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fréquence Pose ML</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">{fpsVal} FPS</div>
                <div className="text-[10px] text-slate-500">Google ML Kit Pose Engine</div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ratio Force / Sagesse</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400 mt-1">{forcePct}% / {wisdomPct}%</div>
                <div className="text-[10px] text-slate-500">Dual Balance Active</div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Anti-Triche & ROM</span>
                </div>
                <div className="text-lg font-bold font-mono text-purple-400 mt-1">98.4%</div>
                <div className="text-[10px] text-slate-500">Mouvements validés stricts</div>
              </div>
            </div>

            {/* Live Ticker Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Flux d'Événements Télémétriques en Temps Réel</span>
                <span className="text-[11px] text-slate-500 font-mono">Dernières 60 secondes</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
                {liveTelemetryLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-[11px] border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className="text-blue-400 font-semibold shrink-0">@{log.athlete}</span>
                    <span className={log.type === 'rep' ? 'text-emerald-300' : log.type === 'quest' ? 'text-amber-300' : 'text-slate-300'}>
                      {log.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Synchronisation bidirectionnelle Firestore & FCM activée</span>
              </div>

              <button
                onClick={() => setIsTelemetryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
