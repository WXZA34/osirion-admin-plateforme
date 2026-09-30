import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Activity,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Wifi,
  Cpu,
  ShieldCheck,
  Send,
  X,
  Copy,
  Check
} from 'lucide-react';

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  tag: 'DOJO_MLKIT' | 'FIREBASE_REALTIME' | 'ARENA_H3' | 'APP_CHECK' | 'CAMERAX' | 'AUTH' | 'FCM';
  message: string;
  payload: Record<string, any>;
  device: string;
  latencyMs: number;
}

const INITIAL_LOGS: TelemetryLog[] = [
  {
    id: 'log_01',
    timestamp: '14:26:41.204',
    level: 'SUCCESS',
    tag: 'DOJO_MLKIT',
    message: 'Répétition de pompe validée via Machine à États (Angle : 68.4°, ROM : 94/100)',
    payload: { exercise: 'pushup', repCount: 24, elbowAngle: 68.4, trunkDeviation: 4.2, qualityScore: 94 },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 12,
  },
  {
    id: 'log_02',
    timestamp: '14:26:42.015',
    level: 'INFO',
    tag: 'FIREBASE_REALTIME',
    message: 'Synchronisation TugOfWarBar : joueur 1 en tête à 68%',
    payload: { matchId: 'duel_8892', player1: 'Ares_Reborn', p1Score: 24, p2Score: 19, delta: +5 },
    device: 'Samsung Galaxy S24 (Android 15)',
    latencyMs: 18,
  },
  {
    id: 'log_03',
    timestamp: '14:26:42.890',
    level: 'INFO',
    tag: 'ARENA_H3',
    message: 'Projection Ghost Runner verrouillée sur le tracé Mapbox (segment #14)',
    payload: { h3Index: '881fb46623fffff', lat: 48.8568, lng: 2.3524, distanceToPath: 0.2, paceMinKm: '4:22' },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 8,
  },
  {
    id: 'log_04',
    timestamp: '14:26:43.410',
    level: 'SUCCESS',
    tag: 'APP_CHECK',
    message: 'Attestation Play Integrity validée avec succès (MEETS_STRONG_INTEGRITY)',
    payload: { provider: 'AndroidProvider.playIntegrity', verdict: 'MEETS_STRONG_INTEGRITY', expirySeconds: 3600 },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 45,
  },
  {
    id: 'log_05',
    timestamp: '14:26:44.112',
    level: 'WARN',
    tag: 'CAMERAX',
    message: 'Contournement CameraX appliqué : bascule sur le moteur natif Camera2',
    payload: { engine: 'Camera2', resolution: '1080x1920@30fps', sensorOrientation: 90 },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 14,
  },
];

const STREAMING_TEMPLATES: Omit<TelemetryLog, 'id' | 'timestamp'>[] = [
  {
    level: 'SUCCESS',
    tag: 'DOJO_MLKIT',
    message: 'Traction validée : menton au-dessus de la barre (Angle : 62.1°, Note : 96/100)',
    payload: { exercise: 'pullup', repCount: 14, chinY: 184.2, wristY: 189.5, qualityScore: 96 },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 11,
  },
  {
    level: 'INFO',
    tag: 'ARENA_H3',
    message: 'Hexagone H3 contesté : Secteur Alpha disputé par le clan Légion Noire',
    payload: { h3Index: '881fb46623fffff', currentLeaderKms: 142.8, status: 'CONTESTED' },
    device: 'Xiaomi 14 Ultra (Android 15)',
    latencyMs: 22,
  },
  {
    level: 'SUCCESS',
    tag: 'FIREBASE_REALTIME',
    message: 'Arbitrage duel Firebase : impulsion haptique envoyée sur la montre Wear OS',
    payload: { hapticType: 'REP_VALIDATED', durationMs: 60, target: 'WearOS_Watch' },
    device: 'Google Pixel Watch 2',
    latencyMs: 9,
  },
  {
    level: 'INFO',
    tag: 'FCM',
    message: 'Notification push FCM délivrée : "⚔️ Bastion du Fort Militaire assiégé !"',
    payload: { channelId: 'high_importance_channel', priority: 'high', clanId: 'clan_01' },
    device: 'Google Pixel 8 Pro (Android 16)',
    latencyMs: 34,
  },
  {
    level: 'WARN',
    tag: 'DOJO_MLKIT',
    message: 'Alerte posture : affaissement du bassin détecté (Angle : 142° < 165°)',
    payload: { warning: 'HIP_SAGGING', scorePenalty: -15, audioFeedback: 'Gaine les abdos !' },
    device: 'Samsung Galaxy S24 (Android 15)',
    latencyMs: 15,
  },
];

export const LiveEventLogger: React.FC = () => {
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto stream simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const template = STREAMING_TEMPLATES[Math.floor(Math.random() * STREAMING_TEMPLATES.length)];
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      const newLog: TelemetryLog = {
        ...template,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp,
      };

      setLogs((prev) => [...prev.slice(-99), newLog]);
    }, 3200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesTag = selectedTag === 'ALL' || log.tag === selectedTag;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      (log.message || '').toLowerCase().includes(q) ||
      (log.tag || '').toLowerCase().includes(q) ||
      (JSON.stringify(log.payload || '')).toLowerCase().includes(q);

    return matchesTag && matchesSearch;
  });

  const handleClearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osirion_telemetry_logs_${Date.now()}.json`;
    a.click();
  };

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Top Controls & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              Journal de télémétrie en temps réel (Live Events)
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {isStreaming ? 'Flux actif' : 'En pause'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Événements émis par l'application Android vers Firestore, Realtime Database et ML Kit
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-slate-500" /> : <Play className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isStreaming ? 'Suspendre' : 'Reprendre'}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            title="Effacer le flux"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition"
            title="Exporter l'historique"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Device & Diagnostics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-400 block font-medium">Terminal Android cible</span>
          <span className="font-semibold text-slate-800 mt-0.5 block truncate">Pixel 8 Pro (SDK 36)</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-400 block font-medium">Latence Firebase</span>
          <span className="font-semibold text-blue-600 mt-0.5 block">14 ms (Optimale)</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-400 block font-medium">Fréquence ML Kit</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">29.8 FPS (Camera2)</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-400 block font-medium">Play Integrity</span>
          <span className="font-semibold text-emerald-600 mt-0.5 block">Certifié conforme</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'DOJO_MLKIT', 'FIREBASE_REALTIME', 'ARENA_H3', 'APP_CHECK', 'CAMERAX'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedTag === tag
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tag === 'ALL' ? 'Tous les flux' : tag}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer les messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Clean Log List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 font-mono text-xs">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <span className="text-slate-300 font-medium">Flux d'événements ({filteredLogs.length})</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span>Défilement automatique</span>
          </label>
        </div>

        <div className="p-3 space-y-1 max-h-72 overflow-y-auto scrollbar-thin select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              Aucun événement ne correspond à vos critères.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center space-x-3 transition ${
                    isSelected
                      ? 'bg-slate-800 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                      log.level === 'SUCCESS'
                        ? 'bg-emerald-950/80 text-emerald-400'
                        : log.level === 'WARN'
                        ? 'bg-amber-950/80 text-amber-400'
                        : log.level === 'ERROR'
                        ? 'bg-rose-950/80 text-rose-400'
                        : 'bg-blue-950/80 text-blue-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-400 text-[11px] shrink-0 font-medium">[{log.tag}]</span>
                  <span className="flex-1 truncate text-xs">{log.message}</span>
                  <span className="text-[11px] text-slate-500 shrink-0">{log.latencyMs}ms</span>
                </div>
              );
            })
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Detailed Log Drawer */}
      {selectedLog && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">Détails de l'événement</span>
              <span className="text-xs text-slate-500">({selectedLog.timestamp})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyPayload(selectedLog.payload)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier JSON'}</span>
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
            <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
