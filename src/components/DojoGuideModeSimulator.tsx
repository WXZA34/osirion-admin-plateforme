import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Flame,
  Award,
  Shield,
  Video,
  Eye,
  Check,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
  Target,
  Dumbbell,
  Compass,
  Sliders,
  Filter,
} from 'lucide-react';
import {
  ExerciseItem,
  DojoTargetArea,
  DojoTrainingType,
  DojoExecutionMode,
  AthleteUser,
} from '../types/admin';
import {
  DOJO_TARGET_AREAS,
  DOJO_TRAINING_TYPES,
  DOJO_EXECUTION_MODES,
} from '../data/mockData';
import { parseVideoUrl } from '../utils/videoUtils';

interface DojoGuideModeSimulatorProps {
  exercises: ExerciseItem[];
  athletes?: AthleteUser[];
  onSessionComplete?: (exercise: ExerciseItem, repsCount: number, durationSeconds: number, earnedXp: number) => void;
}

type FunnelStep = 'SETTINGS' | 'PROTOCOL_LIST' | 'DEMO' | 'PREPARATION' | 'WORKOUT' | 'REPORT';

export const DojoGuideModeSimulator: React.FC<DojoGuideModeSimulatorProps> = ({
  exercises,
  athletes = [],
  onSessionComplete,
}) => {
  // --- 1. FILTER FUNNEL CRITERIA (Mobile Funnel) ---
  const [selectedTargetArea, setSelectedTargetArea] = useState<DojoTargetArea>('HAUT_DU_CORPS');
  const [selectedTrainingType, setSelectedTrainingType] = useState<DojoTrainingType>('FORCE');
  const [selectedExecutionMode, setSelectedExecutionMode] = useState<DojoExecutionMode>('MODE_GUIDE');

  // Selected exercise for the session
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  // Funnel / Session flow state
  const [currentStep, setCurrentStep] = useState<FunnelStep>('SETTINGS');

  // --- 2. WORKOUT TIMERS & INPUT ---
  const [preparationSeconds, setPreparationSeconds] = useState<number>(3);
  const [workoutSeconds, setWorkoutSeconds] = useState<number>(0);
  const [manualRepsInput, setManualRepsInput] = useState<number>(12);
  const [completedSessionData, setCompletedSessionData] = useState<{
    exercise: ExerciseItem;
    reps: number;
    duration: number;
    xpEarned: number;
  } | null>(null);

  const prepTimerRef = useRef<any>(null);
  const workoutTimerRef = useRef<any>(null);

  // --- FILTERED EXERCISES (filteredExercisesProvider logic) ---
  const filteredProtocols = exercises.filter((ex) => {
    // 1. Filter by Target Area
    const matchesTarget = (ex.targetArea || 'HAUT_DU_CORPS') === selectedTargetArea;
    // 2. Filter by Training Type (Force vs Endurance)
    const matchesType = (ex.trainingType || 'FORCE') === selectedTrainingType;
    // 3. Detail important: If Vision Mode is chosen, remove all exercises without AI support
    if (selectedExecutionMode === 'MODE_VISION') {
      const hasAi = ex.hasAiSupport !== false && ex.aiPoseDetection !== false;
      return matchesTarget && matchesType && hasAi;
    }
    // In Mode Guide, all matching exercises are accessible
    return matchesTarget && matchesType;
  });

  // Pick first exercise if none selected or if filtered changes
  useEffect(() => {
    if (filteredProtocols.length > 0 && (!selectedExercise || !filteredProtocols.some((e) => e.id === selectedExercise.id))) {
      setSelectedExercise(filteredProtocols[0]);
    }
  }, [selectedTargetArea, selectedTrainingType, selectedExecutionMode, filteredProtocols]);

  // --- PREPARATION TIMER (3s countdown) ---
  useEffect(() => {
    if (currentStep === 'PREPARATION') {
      setPreparationSeconds(3);
      prepTimerRef.current = setInterval(() => {
        setPreparationSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(prepTimerRef.current);
            setCurrentStep('WORKOUT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    }
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, [currentStep]);

  // --- WORKOUT TIMER (Action chrono) ---
  useEffect(() => {
    if (currentStep === 'WORKOUT') {
      setWorkoutSeconds(0);
      workoutTimerRef.current = setInterval(() => {
        setWorkoutSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    }
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [currentStep]);

  // Format seconds MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Launch Exercise Protocol
  const handleLaunchProtocol = (ex: ExerciseItem) => {
    setSelectedExercise(ex);
    setManualRepsInput(ex.unit === 'seconds' ? (ex.holdTargetSeconds || 30) : 10);
    setCurrentStep('DEMO');
  };

  // Start Preparation
  const handleStartPreparation = () => {
    setCurrentStep('PREPARATION');
  };

  // Finish Workout Action
  const handleFinishWorkout = () => {
    if (!selectedExercise) return;
    setCurrentStep('REPORT');
  };

  // Submit Final Report
  const handleSubmitReport = () => {
    if (!selectedExercise) return;
    const xpPerUnit = selectedExercise.xpRewardPerUnit || 15;
    const earnedXp = manualRepsInput * xpPerUnit;

    const data = {
      exercise: selectedExercise,
      reps: manualRepsInput,
      duration: workoutSeconds,
      xpEarned: earnedXp,
    };
    setCompletedSessionData(data);
    onSessionComplete?.(selectedExercise, manualRepsInput, workoutSeconds, earnedXp);
  };

  // Reset Funnel
  const handleResetSession = () => {
    setCurrentStep('SETTINGS');
    setWorkoutSeconds(0);
    setPreparationSeconds(3);
    setCompletedSessionData(null);
  };

  const activeVideoConfig = selectedExercise
    ? parseVideoUrl(
        selectedExercise.videoDemoUrl ||
          'https://www.youtube.com/watch?v=IODxDxX7oi4'
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Pedagogical Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                ARCHITECTURE OFFICIELLE DOJO MOBILE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">
                Mode Guide / Simulation
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Entonnoir de Filtrage & Simulateur Autonome (Mode Guide)
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Le <strong>Mode Guide</strong> est l’alternative autonome au mode Vision IA : il guide l’athlète via un <strong>tutoriel vidéo en boucle continue (coach fantôme)</strong>, un <strong>compte à rebours de préparation de 3s</strong>, un <strong>chronomètre d'action</strong> et une <strong>validation manuelle finale</strong> avec attribution d'XP au Bastion.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetSession}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser l'entonnoir</span>
            </button>
          </div>
        </div>

        {/* 3 Steps Mobile Funnel Breadcrumbs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className={`p-3 rounded-2xl border transition ${currentStep === 'SETTINGS' ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-400'}`}>
            <span className="text-[10px] font-black tracking-wider uppercase block">1. Paramétrage Athlète</span>
            <span className="text-xs font-bold text-white block mt-0.5">Cible + Type + Mode</span>
          </div>

          <div className={`p-3 rounded-2xl border transition ${currentStep === 'PROTOCOL_LIST' ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-400'}`}>
            <span className="text-[10px] font-black tracking-wider uppercase block">2. Filtrage & Protocoles</span>
            <span className="text-xs font-bold text-white block mt-0.5">Catalogue filtré ({filteredProtocols.length} dispos)</span>
          </div>

          <div className={`p-3 rounded-2xl border transition ${['DEMO', 'PREPARATION', 'WORKOUT', 'REPORT'].includes(currentStep) ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/5 text-slate-400'}`}>
            <span className="text-[10px] font-black tracking-wider uppercase block">3. Session Mode Guide</span>
            <span className="text-xs font-bold text-white block mt-0.5">Démo ➔ 3s Prep ➔ Action ➔ Bilan XP</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid : Control Hub (Left) + Mobile Phone Simulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Funnel Controls & Explanations */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: LE PARAMÉTRAGE PAR L'ATHLÈTE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Paramétrage par l'Athlète (Écran Initial du Dojo)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    L'athlète choisit ses 3 critères avant que le moindre exercice ne soit proposé.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Étape 1 sur 3
              </span>
            </div>

            <div className="space-y-4">
              {/* Criterion 1: Cible corporelle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Cible Corporelle ({DOJO_TARGET_AREAS.length} choix) :</span>
                  <span className="text-[11px] font-mono text-blue-600">
                    {DOJO_TARGET_AREAS.find((a) => a.id === selectedTargetArea)?.label}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOJO_TARGET_AREAS.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => {
                        setSelectedTargetArea(area.id);
                        setCurrentStep('SETTINGS');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                        selectedTargetArea === area.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="block truncate">{area.label}</span>
                      <span className={`text-[10px] block mt-0.5 font-normal truncate ${selectedTargetArea === area.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {area.tagline.split('&')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Criterion 2: Intensité / Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>2. Intensité / Type de Séance :</span>
                  <span className="text-[11px] font-mono text-indigo-600">
                    {DOJO_TRAINING_TYPES.find((t) => t.id === selectedTrainingType)?.label}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DOJO_TRAINING_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrainingType(type.id);
                        setCurrentStep('SETTINGS');
                      }}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                        selectedTrainingType === type.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="block">{type.label}</span>
                      <span className={`text-[10px] block mt-0.5 font-normal ${selectedTrainingType === type.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {type.tagline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Criterion 3: Mode d'Exécution */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>3. Mode d'Exécution (Vision vs Guide) :</span>
                  <span className={`text-[11px] font-mono font-bold ${selectedExecutionMode === 'MODE_GUIDE' ? 'text-emerald-600' : 'text-cyan-600'}`}>
                    {selectedExecutionMode === 'MODE_GUIDE' ? 'Mode Guide / Simulation' : 'Mode Vision (Caméra IA)'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DOJO_EXECUTION_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setSelectedExecutionMode(mode.id);
                        setCurrentStep('SETTINGS');
                      }}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                        selectedExecutionMode === mode.id
                          ? mode.id === 'MODE_GUIDE'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {mode.id === 'MODE_GUIDE' ? <Compass className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span className="block">{mode.label}</span>
                      </div>
                      <span className={`text-[10px] block mt-1 font-normal ${selectedExecutionMode === mode.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {mode.id === 'MODE_GUIDE' ? 'Autonome • Vidéo en boucle • Saisie manuelle' : 'IA Active • Tracking Caméra ML Kit'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtering Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('PROTOCOL_LIST')}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <span>Filtrer les protocoles ({filteredProtocols.length} exercices éligibles)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: LE CATALOGUE DES PROTOCOLES ÉLIGIBLES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Écran de Décision Finale (Protocoles Éligibles)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    L'application affiche le catalogue exact selon les critères. L'athlète clique pour lancer son exercice.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                {filteredProtocols.length} protocoles
              </span>
            </div>

            {selectedExecutionMode === 'MODE_VISION' && (
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>
                  <strong>Règle active :</strong> Mode Vision sélectionné ➔ Seuls les exercices avec <code>hasAiSupport = true</code> sont inclus.
                </span>
              </div>
            )}

            {filteredProtocols.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">
                  Aucun protocole ne correspond exactement à cette combinaison.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Changez la cible ou le type ci-dessus pour afficher les exercices correspondants.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredProtocols.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleLaunchProtocol(ex)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                      selectedExercise?.id === ex.id
                        ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900 group-hover:text-emerald-700 transition">
                          {ex.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                          +{ex.xpRewardPerUnit || 15} XP / {ex.unit === 'seconds' ? 'Sec' : 'Rep'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {ex.instructions || 'Mouvement officiel du Dojo IA'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{ex.difficulty}</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Lancer</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Live Smartphone Simulator (The 4 Steps of Mode Guide) */}
        <div className="lg:col-span-5 sticky top-4">
          <div className="bg-slate-950 p-4 rounded-[40px] border-4 border-slate-800 shadow-2xl space-y-3">
            {/* Phone Notch & Status Header */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-3 pt-1">
              <span>09:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-400 font-bold">DOJO GUIDE</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Mobile Viewport Screen */}
            <div className="bg-slate-900 rounded-[28px] overflow-hidden border border-slate-800 text-white min-h-[580px] flex flex-col justify-between p-4 space-y-4">
              {/* STEP 1: DEMONSTRATION VIDÉO (TUTORIEL EN BOUCLE) */}
              {currentStep === 'DEMO' && selectedExercise && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ÉTAPE 1 : DÉMONSTRATION VIDÉO
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Prenez votre temps
                    </span>
                  </div>

                  {/* Video Player looping */}
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-700 shadow-lg">
                    {activeVideoConfig?.type === 'youtube' || activeVideoConfig?.type === 'vimeo' ? (
                      <iframe
                        src={`${activeVideoConfig.embedUrl}&loop=1`}
                        title={selectedExercise.name}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeVideoConfig?.embedUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-emerald-300">
                      Boucle continue • Forme parfaite
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-black text-sm text-white">
                      {selectedExercise.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedExercise.instructions}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Consigne du Coach Fantôme :</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Observez attentivement la trajectoire et le tempo. Lorsque vous êtes prêt(e), appuyez sur « Commencer » pour enclencher le décompte de 3 secondes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartPreparation}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Commencer la Préparation</span>
                  </button>
                </div>
              )}

              {/* STEP 2: PRÉPARATION (3S COUNTDOWN) */}
              {currentStep === 'PREPARATION' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-200">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    Mise en Position
                  </span>

                  <div className="w-28 h-28 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center text-5xl font-black text-amber-300 animate-pulse shadow-2xl shadow-amber-500/30 font-mono">
                    {preparationSeconds}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-base text-white">
                      Préparez-vous !
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Installez-vous sur votre agrès ou au sol. Le chrono d'action démarre dès zéro.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: ACTION & CHRONOMÈTRE (_workoutSeconds) */}
              {currentStep === 'WORKOUT' && selectedExercise && (
                <div className="space-y-4 flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        EFFORT EN COURS
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">
                        {selectedExercise.name}
                      </span>
                    </div>

                    {/* Ghost Coach Mini Looping Video at top */}
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-700">
                      {activeVideoConfig?.type === 'youtube' || activeVideoConfig?.type === 'vimeo' ? (
                        <iframe
                          src={`${activeVideoConfig.embedUrl}&loop=1`}
                          title="Coach Fantôme"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={activeVideoConfig?.embedUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-300">
                        Guide visuel en temps réel
                      </div>
                    </div>

                    {/* Workout Seconds Chrono */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Chronomètre d'Action
                      </span>
                      <div className="text-4xl font-black font-mono text-emerald-400">
                        {formatTime(workoutSeconds)}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Gérez votre propre rythme sans contrainte IA
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishWorkout}
                    className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Terminer l'Exercice
                  </button>
                </div>
              )}

              {/* STEP 4: BILAN & SAISIE MANUELLE (DojoReportScreen) */}
              {currentStep === 'REPORT' && selectedExercise && (
                <div className="space-y-4 flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        DOJO REPORT SCREEN
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Saisie Manuelle
                      </span>
                    </div>

                    <div className="text-center space-y-1 py-1">
                      <h3 className="font-black text-base text-white">
                        Bravo pour votre série !
                      </h3>
                      <p className="text-xs text-slate-400">
                        Temps d'effort total : <strong>{formatTime(workoutSeconds)}</strong>
                      </p>
                    </div>

                    {/* Manual Reps Counter */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                      <label className="text-xs font-bold text-slate-300 block">
                        Combien de {selectedExercise.unit === 'seconds' ? 'secondes tenues' : 'répétitions validées'} ?
                      </label>

                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setManualRepsInput((prev) => Math.max(0, prev - 1))}
                          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>

                        <span className="text-3xl font-black font-mono text-amber-400 w-16 text-center">
                          {manualRepsInput}
                        </span>

                        <button
                          type="button"
                          onClick={() => setManualRepsInput((prev) => prev + 1)}
                          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-lg transition flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* XP Calculation Live */}
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>
                          Gain : +{manualRepsInput * (selectedExercise.xpRewardPerUnit || 15)} XP Force
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSubmitReport}
                      className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Valider & Enregistrer au Bastion</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('PROTOCOL_LIST')}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold transition"
                    >
                      Choisir un autre exercice
                    </button>
                  </div>
                </div>
              )}

              {/* DEFAULT / SETTINGS STATE IN PHONE */}
              {currentStep === 'SETTINGS' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-white">
                      Dojo Mobile en Attente
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                      Sélectionnez la cible, le type et le mode sur la gauche, puis cliquez sur « Filtrer les protocoles » pour choisir votre mouvement.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('PROTOCOL_LIST')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Voir le Catalogue ({filteredProtocols.length})
                  </button>
                </div>
              )}

              {/* SUCCESS CONFIRMATION MODAL / NOTICE */}
              {completedSessionData && (
                <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 animate-in slide-in-from-bottom-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Séance enregistrée avec succès !</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80">
                    +{completedSessionData.xpEarned} XP crédités pour « {completedSessionData.exercise.name} » ({completedSessionData.reps} reps en {formatTime(completedSessionData.duration)}).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
