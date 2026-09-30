import React, { useState } from 'react';
import { GENERATED_FEATURE_FILES, FeatureCodeFile } from '../data/featureCodeTemplates';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  Activity,
  Layers,
  Sparkles,
  Cpu,
  Trophy,
  Swords,
  MapPin,
  Flame,
  Award,
  ChevronRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  FolderTree
} from 'lucide-react';

export const FeatureCodeGenerator: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(GENERATED_FEATURE_FILES[0].id);
  const [copied, setCopied] = useState(false);
  const [simulatorMode, setSimulatorMode] = useState<'dojo' | 'ghost' | 'tournament' | 'pass'>('dojo');

  // --- SIMULATOR 1: DOJO (PULLUP & ROM) STATE ---
  const [elbowAngle, setElbowAngle] = useState(165);
  const [trunkDeviation, setTrunkDeviation] = useState(8);
  const [simulatedReps, setSimulatedReps] = useState(0);
  const [simulatedState, setSimulatedState] = useState<'SUSPENSION' | 'MONTÉE' | 'MENTON_VALIDÉ'>('SUSPENSION');
  const [hasReachedTop, setHasReachedTop] = useState(false);

  // --- SIMULATOR 2: GHOST PATH SNAPPING STATE ---
  const [runnerProgress, setRunnerProgress] = useState(45);
  const [ghostPaceLead, setGhostPaceLead] = useState(12);

  // --- SIMULATOR 3: TOURNAMENT BRACKET STATE ---
  const [champion, setChampion] = useState<string | null>('Ares_Reborn');
  const [tugOfWarValue, setTugOfWarValue] = useState(65);

  // --- SIMULATOR 4: BATTLE PASS STATE ---
  const [seasonXp, setSeasonXp] = useState(14500);

  const selectedFile = GENERATED_FEATURE_FILES.find((f) => f.id === selectedFileId) || GENERATED_FEATURE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedFile.filePath.split('/').pop() || 'file.dart';
    a.download = fileName;
    a.click();
  };

  const handleDownloadAllBundle = () => {
    const fullBundle = GENERATED_FEATURE_FILES.map((f) => ({
      path: f.filePath,
      description: f.description,
      content: f.code,
    }));
    const blob = new Blob([JSON.stringify(fullBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osirion_10_features_bundle.json';
    a.click();
  };

  const handleElbowChange = (newAngle: number) => {
    setElbowAngle(newAngle);

    if (newAngle <= 75) {
      setSimulatedState('MENTON_VALIDÉ');
      setHasReachedTop(true);
    } else if (newAngle >= 150) {
      if (hasReachedTop) {
        setSimulatedReps((prev) => prev + 1);
        setHasReachedTop(false);
      }
      setSimulatedState('SUSPENSION');
    } else {
      setSimulatedState('MONTÉE');
    }
  };

  const qualityScore = Math.max(30, Math.min(100, Math.round(100 - trunkDeviation * 2.2)));

  return (
    <div className="space-y-6">
      {/* Top Banner (Stripe / Modern SaaS style) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5" />
            <span>Modules de production prêts au déploiement</span>
          </div>

          <button
            onClick={handleDownloadAllBundle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le pack complet (10 fichiers)</span>
          </button>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Générateur de code & bancs d'essai des nouvelles fonctionnalités
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Consultez le code source en Dart et Kotlin, testez les algorithmes en temps réel via les simulateurs, 
            ou exportez les fichiers directement dans votre projet mobile.
          </p>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE FEATURE SIMULATORS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span>Simulateur d'exécution en direct</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Validez la logique mathématique et les machines à états avant intégration
            </p>
          </div>

          {/* Segmented control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {[
              { id: 'dojo', label: 'Dojo & Tractions' },
              { id: 'ghost', label: 'Ghost Runner' },
              { id: 'tournament', label: 'Tournoi Colisée' },
              { id: 'pass', label: 'Passe de Saison' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSimulatorMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  simulatorMode === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SIMULATOR 1: DOJO KINEMATICS */}
        {simulatorMode === 'dojo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>Flexion des coudes (angle articulaire)</span>
                  <span className="text-blue-600 font-semibold">{elbowAngle}°</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="175"
                  value={elbowAngle}
                  onChange={(e) => handleElbowChange(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>60° (Menton passé)</span>
                  <span>115° (Montée)</span>
                  <span>175° (Suspension)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>Déviation de posture (gainage)</span>
                  <span className={`font-semibold ${trunkDeviation > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {trunkDeviation}° ({trunkDeviation > 20 ? 'Balancier excessif' : 'Alignement optimal'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={trunkDeviation}
                  onChange={(e) => setTrunkDeviation(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  setSimulatedReps(0);
                  setElbowAngle(165);
                  setSimulatedState('SUSPENSION');
                  setHasReachedTop(false);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réinitialiser la série</span>
              </button>
            </div>

            {/* Visual Screen feedback */}
            <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 text-center">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                État de la machine à états
              </span>

              <div className={`text-xl font-bold py-2.5 px-4 rounded-xl border ${
                simulatedState === 'MENTON_VALIDÉ'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : simulatedState === 'MONTÉE'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {simulatedState}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Répétitions</span>
                  <span className="text-3xl font-bold text-slate-900">{simulatedReps}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Score ROM</span>
                  <span className={`text-3xl font-bold ${qualityScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {qualityScore}/100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {qualityScore >= 80
                  ? 'Exécution certifiée conforme (+25% XP attribués)'
                  : 'Avertissement : conservez le tronc gainé'}
              </p>
            </div>
          </div>
        )}

        {/* SIMULATOR 2: GHOST RUNNER */}
        {simulatorMode === 'ghost' && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-slate-700 font-medium">
              <span>Position sur l'itinéraire : <strong className="text-blue-600">{runnerProgress}% (4.2 km)</strong></span>
              <span>Écart avec le fantôme : <strong className="text-slate-900">+{ghostPaceLead} mètres d'avance</strong></span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={runnerProgress}
              onChange={(e) => setRunnerProgress(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="h-28 w-full bg-slate-50 rounded-2xl border border-slate-200 relative flex items-center px-6 overflow-hidden">
              <div className="h-2 w-full bg-slate-200 rounded-full relative z-10">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-150"
                  style={{ width: `${runnerProgress}%` }}
                />
              </div>

              {/* Ghost marker */}
              <div
                className="absolute z-20 top-1/2 -translate-y-1/2 transition-all duration-200"
                style={{ left: `${Math.min(94, runnerProgress + 4)}%` }}
              >
                <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm shadow-xs">
                  👻
                </div>
                <span className="text-[10px] text-amber-700 font-medium block text-center mt-0.5">Fantôme</span>
              </div>

              {/* Runner marker */}
              <div
                className="absolute z-20 top-1/2 -translate-y-1/2 transition-all duration-150"
                style={{ left: `${runnerProgress}%` }}
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-sm shadow-xs">
                  🏃
                </div>
                <span className="text-[10px] text-blue-700 font-medium block text-center mt-0.5">Vous</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>Projection orthogonale Mapbox : <strong className="text-emerald-700">Verrouillée</strong></span>
              <span>Allure cible : <strong className="text-slate-800">4:25 min/km</strong></span>
            </div>
          </div>
        )}

        {/* SIMULATOR 3: TOURNAMENT */}
        {simulatorMode === 'tournament' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">1/4 de finale</span>
                <div className="font-semibold text-slate-800">Ares_Reborn vs Zeus_Overclock</div>
                <div className="text-slate-500">Valkyrie_Nova vs Socrates_Lift</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Demi-finales</span>
                <div className="font-semibold text-blue-600">Ares_Reborn (Qualifié)</div>
                <div className="font-semibold text-blue-600">Kage_Spectre (Qualifié)</div>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 text-center space-y-1">
                <span className="text-[11px] text-blue-600 block font-medium">Vainqueur du Colisée</span>
                <div className="text-sm font-bold text-slate-900">🏆 {champion}</div>
                <span className="text-[11px] text-blue-700 block">+5000 Æ attribués</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-blue-700">Ares_Reborn (48 reps)</span>
                <span className="text-amber-700">Kage_Spectre (39 reps)</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full flex overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${tugOfWarValue}%` }} />
                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${100 - tugOfWarValue}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* SIMULATOR 4: BATTLE PASS */}
        {simulatorMode === 'pass' && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-slate-700 font-medium">
              <span>XP de saison : <strong className="text-blue-600">{seasonXp.toLocaleString()} XP</strong></span>
              <span>Palier débloqué : <strong className="text-slate-900">Palier {Math.min(30, Math.floor(seasonXp / 1000) + 1)} / 30</strong></span>
            </div>

            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={seasonXp}
              onChange={(e) => setSeasonXp(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              {[
                { tier: 1, xp: 500, free: 'Titre : Recrue', premium: 'Halo Lueur d’Aura' },
                { tier: 5, xp: 2500, free: '500 Or', premium: 'Titre : Gladiateur' },
                { tier: 10, xp: 6000, free: 'Bandage Poignet', premium: 'Skin Carte' },
                { tier: 20, xp: 15000, free: '1500 Or', premium: 'Halo Foudre' },
                { tier: 30, xp: 30000, free: 'Titre : Immortel', premium: 'Couronne des Titans' },
              ].map((t) => {
                const isUnlocked = seasonXp >= t.xp;
                return (
                  <div
                    key={t.tier}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-white border-blue-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900">Palier {t.tier}</span>
                      <span className="text-[10px] text-slate-400">{t.xp} XP</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">Gratuit : {t.free}</div>
                    <div className="text-[11px] text-blue-600 font-medium">VIP : {t.premium}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PRODUCTION SOURCE CODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Fichiers générés ({GENERATED_FEATURE_FILES.length})</span>
            <FolderTree className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-1.5">
            {GENERATED_FEATURE_FILES.map((file) => {
              const isSelected = file.id === selectedFileId;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate text-slate-900">{file.featureTitle}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {file.filePath}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md ml-2 shrink-0 ${
                      file.language === 'kotlin'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{selectedFile.featureTitle}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedFile.filePath}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{selectedFile.description}</p>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Dépendances :</span>
            {selectedFile.dependencies.map((dep, idx) => (
              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px] text-slate-700">
                {dep}
              </span>
            ))}
          </div>

          {/* Clean Code Viewer */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 overflow-x-auto max-h-[440px] font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin select-text">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
