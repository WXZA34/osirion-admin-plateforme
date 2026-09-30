import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  CheckCircle2,
  Sliders,
  Flame,
  X,
  Edit2,
  Trash2,
  Cpu,
  Activity,
  ShieldCheck,
  Play,
  RotateCcw,
  Check,
  Info,
  Clock,
  LayoutGrid,
  Split,
  Target,
  Zap,
  FolderKanban,
  ArrowRight,
  MoveRight,
  Settings2,
  Eye,
  Video,
  Upload,
  Link,
  Film,
  Camera,
  Code,
  Sparkles,
  HelpCircle,
  Copy,
  Terminal,
  Database,
  RefreshCw,
  Compass,
} from 'lucide-react';
import {
  ExerciseItem,
  MuscleGroup,
  AthleteLevel,
  EquipmentRequired,
  DojoMode,
  MovementSplit,
  DojoConfigProfile,
  DojoTargetArea,
  DojoTrainingType,
  DojoExecutionMode,
} from '../types/admin';
import {
  DOJO_CONFIG_PROFILES,
  DOJO_TARGET_AREAS,
  DOJO_TRAINING_TYPES,
  DOJO_EXECUTION_MODES,
  DojoProfilePreset,
} from '../data/mockData';
import { ExerciseVideoModal, ExerciseVideoPlayer } from './ExerciseVideoModal';
import { inferDojoMetadata } from '../utils/exerciseClassifier';
import { DojoGuideModeSimulator } from './DojoGuideModeSimulator';

interface ExerciseLibraryManagerProps {
  exercises: ExerciseItem[];
  userRole: 'superadmin' | 'auditor';
  onAddExercise: (exercise: ExerciseItem) => void;
  onUpdateExercise: (exercise: ExerciseItem) => void;
  onDeleteExercise: (id: string) => void;
}

export type ViewTab =
  | 'distribution_rubriques' // Rubriques Officielles Dojo (Cible, Type, Mode)
  | 'mode_guide_simulator' // Simulateur Entonnoir & Mode Guide (4 étapes)
  | 'dojo_ai_guide' // Guide & Intégration Mode IA (ML Kit)
  | 'distribution_profiles' // Répartition par Profil de Configuration Dojo
  | 'distribution_modes' // Répartition par Mode de Détection
  | 'distribution_splits' // Répartition par Split Musculaire
  | 'catalog' // Catalogue Global
  | 'dojo_simulator'; // Banc d'Essai Dojo

export type RubricAxis = 'targetArea' | 'trainingType' | 'executionMode';

export const ExerciseLibraryManager: React.FC<ExerciseLibraryManagerProps> = ({
  exercises,
  userRole,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('distribution_rubriques');
  const [rubricAxis, setRubricAxis] = useState<RubricAxis>('targetArea');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || 'ex_pullups_pron');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [reassigningExercise, setReassigningExercise] = useState<ExerciseItem | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // --- VIDEO PREVIEW & PLAYER STATES ---
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<ExerciseItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [simulatorShowVideoSplit, setSimulatorShowVideoSplit] = useState(true);

  // Quick picker to move an exercise directly into a specific rubric
  const [quickMoveTargetRubric, setQuickMoveTargetRubric] = useState<{
    axis: RubricAxis;
    value: string;
  } | null>(null);

  // --- DOJO LIVE SIMULATOR STATES ---
  const currentDojoExercise = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];
  const [simulatedAngle, setSimulatedAngle] = useState<number>(currentDojoExercise ? currentDojoExercise.maxAngle : 170);
  const [simulatedTrunkDeviation, setSimulatedTrunkDeviation] = useState<number>(6);
  const [simulatedRepsCount, setSimulatedRepsCount] = useState<number>(0);
  const [simulatedPhase, setSimulatedPhase] = useState<'DÉPART' | 'MOUVEMENT' | 'INFLECTION' | 'VALIDÉE'>('DÉPART');
  const [hasHitInflection, setHasHitInflection] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MuscleGroup>('Pectoraux');
  const [formDifficulty, setFormDifficulty] = useState<AthleteLevel>('Intermédiaire');
  const [formEquipment, setFormEquipment] = useState<EquipmentRequired>('Poids du corps');
  const [formTargetArea, setFormTargetArea] = useState<DojoTargetArea>('HAUT_DU_CORPS');
  const [formTrainingType, setFormTrainingType] = useState<DojoTrainingType>('FORCE');
  const [formExecutionMode, setFormExecutionMode] = useState<DojoExecutionMode>('MODE_VISION');
  const [formDojoMode, setFormDojoMode] = useState<DojoMode>('DYNAMIC_REPS');
  const [formMovementSplit, setFormMovementSplit] = useState<MovementSplit>('PUSH');
  const [formConfigProfile, setFormConfigProfile] = useState<DojoConfigProfile>('STANDARD_DAILY');
  const [formHoldTargetSeconds, setFormHoldTargetSeconds] = useState<number>(30);
  const [formTargetMuscles, setFormTargetMuscles] = useState('');
  const [formAiDetection, setFormAiDetection] = useState(true);
  const [formMinAngle, setFormMinAngle] = useState(85);
  const [formMaxAngle, setFormMaxAngle] = useState(170);
  const [formSensitivity, setFormSensitivity] = useState(0.85);
  const [formStrictMode, setFormStrictMode] = useState(true);
  const [formMaxTrunkDeviation, setFormMaxTrunkDeviation] = useState(12);
  const [formMinTUT, setFormMinTUT] = useState(0.8);
  const [formInstructions, setFormInstructions] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('https://www.youtube.com/watch?v=IODxDxX7oi4');
  const [formRequiredCameraAngle, setFormRequiredCameraAngle] = useState<'profile' | 'face'>('profile');
  const [formXpReward, setFormXpReward] = useState<number>(15);
  const [formUnit, setFormUnit] = useState<'reps' | 'seconds'>('reps');
  const [formAiKeyword, setFormAiKeyword] = useState<string>('pompes');

  const muscleCategories: MuscleGroup[] = [
    'Pectoraux',
    'Dorsaux',
    'Épaules',
    'Bras (Triceps & Biceps)',
    'Abdominaux & Core',
    'Jambes & Fessiers',
    'Corps Complet (Full Body)',
  ];

  // Handler to update video for an exercise
  const handleUpdateExerciseVideo = (exerciseId: string, newVideoUrl: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const updated: ExerciseItem = { ...ex, videoDemoUrl: newVideoUrl };
    onUpdateExercise(updated);
    if (selectedVideoExercise?.id === exerciseId) {
      setSelectedVideoExercise(updated);
    }
    setSyncFeedback(`Vidéo associée à « ${ex.name} » mise à jour avec succès !`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Quick re-assignment of target area (Cible)
  const handleAssignTargetArea = (exercise: ExerciseItem, newArea: DojoTargetArea) => {
    if (userRole !== 'superadmin') return;
    const targetItem = DOJO_TARGET_AREAS.find((a) => a.id === newArea);
    const updated: ExerciseItem = {
      ...exercise,
      targetArea: newArea,
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » a été rangé dans la rubrique « ${targetItem?.label || newArea} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Quick re-assignment of training type (Type)
  const handleAssignTrainingType = (exercise: ExerciseItem, newType: DojoTrainingType) => {
    if (userRole !== 'superadmin') return;
    const typeItem = DOJO_TRAINING_TYPES.find((t) => t.id === newType);
    const updated: ExerciseItem = {
      ...exercise,
      trainingType: newType,
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » a été reclassé en type « ${typeItem?.label || newType} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Quick re-assignment of execution mode (Mode)
  const handleAssignExecutionMode = (exercise: ExerciseItem, newMode: DojoExecutionMode) => {
    if (userRole !== 'superadmin') return;
    const modeItem = DOJO_EXECUTION_MODES.find((m) => m.id === newMode);
    const updated: ExerciseItem = {
      ...exercise,
      executionMode: newMode,
      aiPoseDetection: newMode === 'MODE_VISION',
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » basculé en mode « ${modeItem?.label || newMode} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Quick re-assignment of configuration profile
  const handleAssignProfile = (exercise: ExerciseItem, newProfile: DojoConfigProfile) => {
    if (userRole !== 'superadmin') return;
    const preset = DOJO_CONFIG_PROFILES.find((p) => p.id === newProfile);
    const updated: ExerciseItem = {
      ...exercise,
      configProfile: newProfile,
      sensitivity: preset ? preset.defaultSensitivity : exercise.sensitivity,
      strictMode: preset ? preset.strictKippingCheck : exercise.strictMode,
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » réassigné au profil d'arbitrage « ${preset?.name || newProfile} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Quick re-assignment of detection mode
  const handleAssignMode = (exercise: ExerciseItem, newMode: DojoMode) => {
    if (userRole !== 'superadmin') return;
    const updated: ExerciseItem = {
      ...exercise,
      dojoMode: newMode,
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » configuré en mode « ${newMode} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Quick re-assignment of movement split
  const handleAssignSplit = (exercise: ExerciseItem, newSplit: MovementSplit) => {
    if (userRole !== 'superadmin') return;
    const updated: ExerciseItem = {
      ...exercise,
      movementSplit: newSplit,
    };
    onUpdateExercise(updated);
    setSyncFeedback(`« ${exercise.name} » réaffecté au split « ${newSplit} » !`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  // Batch auto-sync all exercises into Firestore with smart classification
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);
  const [batchSyncProgress, setBatchSyncProgress] = useState<number | null>(null);

  const handleBatchSyncDojoClassification = async () => {
    setIsBatchSyncing(true);
    let count = 0;
    try {
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const inferred = inferDojoMetadata(ex, ex.id);
        const updated: ExerciseItem = {
          ...ex,
          targetArea: ex.targetArea || inferred.targetArea,
          trainingType: ex.trainingType || inferred.trainingType,
          executionMode: ex.executionMode || inferred.executionMode,
          dojoMode: ex.dojoMode || inferred.dojoMode,
          movementSplit: ex.movementSplit || inferred.movementSplit,
          configProfile: ex.configProfile || inferred.configProfile,
          hasAiSupport: typeof ex.hasAiSupport === 'boolean' ? ex.hasAiSupport : inferred.hasAiSupport,
        };
        onUpdateExercise(updated);
        count++;
        if (i % 20 === 0 || i === exercises.length - 1) {
          setBatchSyncProgress(Math.round(((i + 1) / exercises.length) * 100));
        }
      }
      setSyncFeedback(`✅ ${count} exercices classés et enregistrés dans Firestore ! Plus aucune rubrique à 0.`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err) {
      console.error('Batch sync error:', err);
    } finally {
      setIsBatchSyncing(false);
      setBatchSyncProgress(null);
    }
  };

  // Handle angle slider in live Dojo simulator
  const handleAngleSliderChange = (newAngle: number) => {
    setSimulatedAngle(newAngle);

    if (newAngle <= currentDojoExercise.minAngle) {
      setSimulatedPhase('INFLECTION');
      setHasHitInflection(true);
    } else if (newAngle >= currentDojoExercise.maxAngle - 5) {
      if (hasHitInflection) {
        setSimulatedRepsCount((prev) => prev + 1);
        setSimulatedPhase('VALIDÉE');
        setHasHitInflection(false);
      } else {
        setSimulatedPhase('DÉPART');
      }
    } else {
      setSimulatedPhase('MOUVEMENT');
    }
  };

  const handleOpenAdd = () => {
    setEditingExercise(null);
    setFormName('');
    setFormCategory('Pectoraux');
    setFormDifficulty('Intermédiaire');
    setFormEquipment('Poids du corps');
    setFormTargetArea(rubricAxis === 'targetArea' ? 'HAUT_DU_CORPS' : 'CORPS_ENTIER');
    setFormTrainingType('FORCE');
    setFormExecutionMode('MODE_VISION');
    setFormDojoMode('DYNAMIC_REPS');
    setFormMovementSplit('PUSH');
    setFormConfigProfile('STANDARD_DAILY');
    setFormHoldTargetSeconds(30);
    setFormTargetMuscles('Pectoraux, Triceps, Gainage');
    setFormAiDetection(true);
    setFormMinAngle(85);
    setFormMaxAngle(170);
    setFormSensitivity(0.85);
    setFormStrictMode(true);
    setFormMaxTrunkDeviation(12);
    setFormMinTUT(0.8);
    setFormInstructions('');
    setFormVideoUrl('https://storage.googleapis.com/osirion-videos/exercises/demo.mp4');
    setFormRequiredCameraAngle('profile');
    setFormXpReward(15);
    setFormUnit('reps');
    setFormAiKeyword('pompes');
    setShowAddModal(true);
  };

  const handleOpenEdit = (ex: ExerciseItem) => {
    setEditingExercise(ex);
    setFormName(ex.name);
    setFormCategory(ex.category);
    setFormDifficulty(ex.difficulty);
    setFormEquipment(ex.equipment);
    setFormTargetArea(ex.targetArea || 'HAUT_DU_CORPS');
    setFormTrainingType(ex.trainingType || 'FORCE');
    setFormExecutionMode(ex.executionMode || 'MODE_VISION');
    setFormDojoMode(ex.dojoMode);
    setFormMovementSplit(ex.movementSplit);
    setFormConfigProfile(ex.configProfile);
    setFormHoldTargetSeconds(ex.holdTargetSeconds || 30);
    setFormTargetMuscles(ex.targetMuscles.join(', '));
    setFormAiDetection(ex.aiPoseDetection);
    setFormMinAngle(ex.minAngle);
    setFormMaxAngle(ex.maxAngle);
    setFormSensitivity(ex.sensitivity);
    setFormStrictMode(ex.strictMode);
    setFormMaxTrunkDeviation(ex.maxTrunkDeviationDeg);
    setFormMinTUT(ex.minTUTSeconds);
    setFormInstructions(ex.instructions);
    setFormVideoUrl(ex.videoDemoUrl);
    setFormRequiredCameraAngle(ex.requiredCameraAngle || 'profile');
    setFormXpReward(ex.xpRewardPerUnit || 15);
    setFormUnit(ex.unit || (ex.dojoMode === 'STATIC_HOLD' ? 'seconds' : 'reps'));
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const targetMusclesArray = formTargetMuscles
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const targetAreaLabel =
      DOJO_TARGET_AREAS.find((a) => a.id === formTargetArea)?.label || formTargetArea;

    if (editingExercise) {
      const updated: ExerciseItem = {
        ...editingExercise,
        name: formName,
        category: formCategory,
        difficulty: formDifficulty,
        equipment: formEquipment,
        targetArea: formTargetArea,
        trainingType: formTrainingType,
        executionMode: formExecutionMode,
        dojoMode: formDojoMode,
        movementSplit: formMovementSplit,
        configProfile: formConfigProfile,
        holdTargetSeconds: formHoldTargetSeconds,
        targetMuscles: targetMusclesArray,
        aiPoseDetection: formExecutionMode === 'MODE_VISION' ? formAiDetection : false,
        requiredCameraAngle: formRequiredCameraAngle,
        xpRewardPerUnit: formXpReward,
        unit: formUnit,
        minAngle: formMinAngle,
        maxAngle: formMaxAngle,
        sensitivity: formSensitivity,
        strictMode: formStrictMode,
        maxTrunkDeviationDeg: formMaxTrunkDeviation,
        minTUTSeconds: formMinTUT,
        instructions: formInstructions,
        videoDemoUrl: formVideoUrl,
      };
      onUpdateExercise(updated);
      setSyncFeedback(`« ${formName} » mis à jour et rangé dans la rubrique « ${targetAreaLabel} » !`);
    } else {
      // Auto-tag ID with AI keyword if mode is MODE_VISION for Flutter hasAiSupport compatibility
      const sanitizedName = formName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const generatedId = formExecutionMode === 'MODE_VISION' && formAiKeyword
        ? `sw_${sanitizedName}_${formAiKeyword}`
        : `ex_${Date.now()}`;

      const newEx: ExerciseItem = {
        id: generatedId,
        name: formName,
        category: formCategory,
        difficulty: formDifficulty,
        equipment: formEquipment,
        targetArea: formTargetArea,
        trainingType: formTrainingType,
        executionMode: formExecutionMode,
        dojoMode: formDojoMode,
        movementSplit: formMovementSplit,
        configProfile: formConfigProfile,
        holdTargetSeconds: formHoldTargetSeconds,
        targetMuscles: targetMusclesArray,
        aiPoseDetection: formExecutionMode === 'MODE_VISION' ? formAiDetection : false,
        requiredCameraAngle: formRequiredCameraAngle,
        xpRewardPerUnit: formXpReward,
        unit: formUnit,
        minAngle: formMinAngle,
        maxAngle: formMaxAngle,
        sensitivity: formSensitivity,
        strictMode: formStrictMode,
        maxTrunkDeviationDeg: formMaxTrunkDeviation,
        minTUTSeconds: formMinTUT,
        monitoredLandmarks: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST', 'LEFT_HIP'],
        stateMachineLabels: {
          start: 'POSITION_DÉPART',
          inflection: 'FLEXION_MAX',
          completion: 'RÉPÉTITION_VALIDÉE',
        },
        instructions: formInstructions,
        videoDemoUrl: formVideoUrl,
        popularityRank: exercises.length + 1,
        activeInWorkouts: true,
      };
      onAddExercise(newEx);
      setSyncFeedback(`« ${formName} » créé et rangé directement dans la rubrique « ${targetAreaLabel} » !`);
    }

    setTimeout(() => setSyncFeedback(null), 3500);
    setShowAddModal(false);
  };

  const filteredExercises = exercises.filter((ex) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (ex.name || '').toLowerCase().includes(q) ||
      (ex.instructions || '').toLowerCase().includes(q) ||
      (Array.isArray(ex.targetMuscles) && ex.targetMuscles.some((m) => (m || '').toLowerCase().includes(q)));
    const matchesDiff = selectedDifficulty === 'ALL' || ex.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Bibliothèque & Rubriques du Dojo IA
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Les exercices se rangent automatiquement dans leurs rubriques officielles (Cible, Type de séance, Mode Vision IA) et peuvent être reclassés à tout moment.
          </p>
        </div>

        {userRole === 'superadmin' && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto">
            <button
              onClick={handleBatchSyncDojoClassification}
              disabled={isBatchSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              title="Enregistrer la classification intelligente dans votre base Firestore"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isBatchSyncing
                  ? `Synchronisation (${batchSyncProgress || 0}%)...`
                  : 'Enregistrer le Rangement dans Firestore'}
              </span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un exercice</span>
            </button>
          </div>
        )}
      </div>

      {/* Explication & Status Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-slate-50 border border-blue-200/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <span>Pourquoi certaines rubriques étaient à 0 auparavant ?</span>
              <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Résolu : 152 mouvements classés
              </span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              La base de données brute ne possédait au départ que le champ générique <code>targetBodyPart</code> (UPPER, LOWER, CORE). En l'absence de sous-rubriques détaillées, tous les mouvements se retrouvaient empilés dans une seule catégorie par défaut (ex: tout en <strong>Haut du Corps</strong> et tout en <strong>Push</strong>), laissant les catégories <strong>Tirage (PULL)</strong>, <strong>Isométrie</strong>, <strong>Corps Entier</strong> ou <strong>Ciblage Isolé</strong> à <strong>0</strong>. L'analyse biomécanique a désormais classé chaque mouvement dans sa rubrique exacte.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      {syncFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{syncFeedback}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveViewTab('distribution_rubriques')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'distribution_rubriques'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Rubriques Dojo Mobile (Cible, Type, Mode)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('mode_guide_simulator')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'mode_guide_simulator'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Simulateur Mode Guide (4 étapes & Entonnoir)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('distribution_profiles')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'distribution_profiles'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Par Profil de Tolérance (Strict / Standard)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('distribution_modes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'distribution_modes'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Par Mode Détection (Reps / Isométrie)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('distribution_splits')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'distribution_splits'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Par Split Musculaire</span>
          </button>

          <button
            onClick={() => setActiveViewTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'catalog'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Catalogue Global ({exercises.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('dojo_simulator')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeViewTab === 'dojo_simulator'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Banc d'Essai Dojo (Simulateur Caméra)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VUE 0 : RUBRIQUES OFFICIELLES DU DOJO MOBILE (CIBLE, TYPE, MODE)*/}
      {/* ============================================================== */}
      {activeViewTab === 'distribution_rubriques' && (
        <div className="space-y-6">
          {/* Sub-selector for the Rubric axis */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Rubrique de classement active de l'application mobile :</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Sélectionnez la dimension selon laquelle ranger et reclasser vos mouvements. Tout changement est synchronisé avec l'application.
              </p>
            </div>

            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
              <button
                onClick={() => setRubricAxis('targetArea')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  rubricAxis === 'targetArea'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Choix de la Cible ({DOJO_TARGET_AREAS.length})
              </button>
              <button
                onClick={() => setRubricAxis('trainingType')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  rubricAxis === 'trainingType'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Type d'Entraînement ({DOJO_TRAINING_TYPES.length})
              </button>
              <button
                onClick={() => setRubricAxis('executionMode')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  rubricAxis === 'executionMode'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Mode d'Exécution ({DOJO_EXECUTION_MODES.length})
              </button>
            </div>
          </div>

          {/* AXIS 1: CHOIX DE LA CIBLE */}
          {rubricAxis === 'targetArea' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/70 text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Écran « 1. CHOIX DE LA CIBLE » du Dojo :</strong> Vos athlètes choisissent parmi ces 5 rubriques sur mobile. Utilisez le sélecteur rapide sur chaque carte pour déplacer instantanément un exercice vers une autre rubrique.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {DOJO_TARGET_AREAS.map((rubric) => {
                  const assignedExercises = exercises.filter(
                    (e) => (e.targetArea || 'HAUT_DU_CORPS') === rubric.id
                  );

                  return (
                    <div
                      key={rubric.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Rubric Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${rubric.badgeColor}`}>
                              {rubric.label}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-xs mt-1.5">
                              {rubric.tagline}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {rubric.description}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                            {assignedExercises.length}
                          </span>
                        </div>

                        {/* List of exercises inside this rubric */}
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                          {assignedExercises.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                              <p className="text-xs text-slate-400">
                                Aucun exercice dans cette rubrique pour le moment.
                              </p>
                            </div>
                          ) : (
                            assignedExercises.map((ex) => (
                              <div
                                key={ex.id}
                                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-blue-300 transition space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                                      {ex.name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                                        {ex.difficulty}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                                        {ex.trainingType === 'ENDURANCE' ? 'Endurance' : 'Force'}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 font-medium border border-cyan-200">
                                        {ex.executionMode === 'MODE_GUIDE' ? 'Guide 3D' : 'Vision IA'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {ex.targetMuscles.join(' • ')}
                                </p>

                                {/* Action bar to quickly re-range or configure */}
                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                  {/* Quick Target Re-Range Selector */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                      Ranger dans :
                                    </span>
                                    <select
                                      disabled={userRole !== 'superadmin'}
                                      value={ex.targetArea || 'HAUT_DU_CORPS'}
                                      onChange={(e) =>
                                        handleAssignTargetArea(ex, e.target.value as DojoTargetArea)
                                      }
                                      className="text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-800 hover:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                    >
                                      {DOJO_TARGET_AREAS.map((a) => (
                                        <option key={a.id} value={a.id}>
                                          {a.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      title="Visualiser la vidéo de démonstration"
                                      onClick={() => {
                                        setSelectedVideoExercise(ex);
                                        setIsVideoModalOpen(true);
                                      }}
                                      className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition flex items-center gap-1 font-semibold text-[11px]"
                                    >
                                      <Video className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Vidéo</span>
                                    </button>
                                    <button
                                      title="Tester dans le Dojo IA"
                                      onClick={() => {
                                        setSelectedExerciseId(ex.id);
                                        setActiveViewTab('dojo_simulator');
                                      }}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                    >
                                      <Play className="w-3.5 h-3.5" />
                                    </button>
                                    {userRole === 'superadmin' && (
                                      <>
                                        <button
                                          title="Reclasser / Changer toutes les rubriques"
                                          onClick={() => setReassigningExercise(ex)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                        >
                                          <Settings2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          title="Modifier la fiche complète"
                                          onClick={() => handleOpenEdit(ex)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Quick "Ranger un exercice ici" footer */}
                      {userRole === 'superadmin' && (
                        <div className="pt-3 border-t border-slate-100">
                          <button
                            onClick={() =>
                              setQuickMoveTargetRubric({
                                axis: 'targetArea',
                                value: rubric.id,
                              })
                            }
                            className="w-full py-1.5 px-2.5 rounded-xl border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50/70 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                            <span>Ranger un exercice dans « {rubric.label} »</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AXIS 2: TYPE D'ENTRAÎNEMENT (FORCE vs ENDURANCE) */}
          {rubricAxis === 'trainingType' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/70 text-xs text-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Écran « 2. TYPE D'ENTRAÎNEMENT » du Dojo :</strong> Répartition des mouvements entre la <strong>FORCE</strong> (répétitions lentes et contrôlées) et l'<strong>ENDURANCE</strong> (cardio long, séries d'épuisement).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DOJO_TRAINING_TYPES.map((typeRubric) => {
                  const assignedExercises = exercises.filter(
                    (e) => (e.trainingType || 'FORCE') === typeRubric.id
                  );

                  return (
                    <div
                      key={typeRubric.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${typeRubric.badgeColor}`}>
                              {typeRubric.label}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm mt-1.5">
                              {typeRubric.tagline}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {typeRubric.description}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            {assignedExercises.length} mouvement{assignedExercises.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                          {assignedExercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-indigo-300 transition space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-900">
                                    {ex.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                                      Cible : {DOJO_TARGET_AREAS.find((a) => a.id === ex.targetArea)?.label || ex.targetArea}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 font-medium border border-cyan-200">
                                      {ex.executionMode === 'MODE_GUIDE' ? 'Guide 3D' : 'Vision IA'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    title="Visualiser la vidéo de démonstration"
                                    onClick={() => {
                                      setSelectedVideoExercise(ex);
                                      setIsVideoModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Tester"
                                    onClick={() => {
                                      setSelectedExerciseId(ex.id);
                                      setActiveViewTab('dojo_simulator');
                                    }}
                                    className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  {userRole === 'superadmin' && (
                                    <button
                                      title="Reclasser"
                                      onClick={() => setReassigningExercise(ex)}
                                      className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    >
                                      <Settings2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Quick Switch for Training Type */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Bascule rapide du type :
                                </span>
                                <select
                                  disabled={userRole !== 'superadmin'}
                                  value={ex.trainingType || 'FORCE'}
                                  onChange={(e) =>
                                    handleAssignTrainingType(ex, e.target.value as DojoTrainingType)
                                  }
                                  className="text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-800 hover:border-indigo-500"
                                >
                                  {DOJO_TRAINING_TYPES.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {userRole === 'superadmin' && (
                        <div className="pt-3 border-t border-slate-100">
                          <button
                            onClick={() =>
                              setQuickMoveTargetRubric({
                                axis: 'trainingType',
                                value: typeRubric.id,
                              })
                            }
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50/70 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                            <span>Ranger un exercice en « {typeRubric.label} »</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AXIS 3: MODE D'EXÉCUTION (MODE VISION vs MODE GUIDE) */}
          {rubricAxis === 'executionMode' && (
            <div className="space-y-6">
              <div className="bg-cyan-50/70 p-4 rounded-2xl border border-cyan-200/70 text-xs text-cyan-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>
                    <strong>Écran « 3. MODE D'EXÉCUTION » du Dojo :</strong> Répartition des mouvements entre le <strong>MODE VISION</strong> (arbitrage automatique IA par détection de pose Google ML Kit) et le <strong>MODE GUIDE</strong> (simulation 3D et chronomètre libre).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DOJO_EXECUTION_MODES.map((modeRubric) => {
                  const assignedExercises = exercises.filter(
                    (e) => (e.executionMode || 'MODE_VISION') === modeRubric.id
                  );

                  return (
                    <div
                      key={modeRubric.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${modeRubric.badgeColor}`}>
                              {modeRubric.label}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm mt-1.5">
                              {modeRubric.tagline}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {modeRubric.description}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            {assignedExercises.length} mouvement{assignedExercises.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                          {assignedExercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-cyan-300 transition space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-900">
                                    {ex.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                                      Cible : {DOJO_TARGET_AREAS.find((a) => a.id === ex.targetArea)?.label || ex.targetArea}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                                      Type : {ex.trainingType === 'ENDURANCE' ? 'Endurance' : 'Force'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    title="Visualiser la vidéo de démonstration"
                                    onClick={() => {
                                      setSelectedVideoExercise(ex);
                                      setIsVideoModalOpen(true);
                                    }}
                                    className="p-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Tester"
                                    onClick={() => {
                                      setSelectedExerciseId(ex.id);
                                      setActiveViewTab('dojo_simulator');
                                    }}
                                    className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  {userRole === 'superadmin' && (
                                    <button
                                      title="Reclasser"
                                      onClick={() => setReassigningExercise(ex)}
                                      className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    >
                                      <Settings2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Quick Switch for Execution Mode */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Bascule rapide du mode :
                                </span>
                                <select
                                  disabled={userRole !== 'superadmin'}
                                  value={ex.executionMode || 'MODE_VISION'}
                                  onChange={(e) =>
                                    handleAssignExecutionMode(ex, e.target.value as DojoExecutionMode)
                                  }
                                  className="text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-200 font-medium text-slate-800 hover:border-cyan-500"
                                >
                                  {DOJO_EXECUTION_MODES.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {userRole === 'superadmin' && (
                        <div className="pt-3 border-t border-slate-100">
                          <button
                            onClick={() =>
                              setQuickMoveTargetRubric({
                                axis: 'executionMode',
                                value: modeRubric.id,
                              })
                            }
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-cyan-300 text-cyan-700 hover:bg-cyan-50/70 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                            <span>Ranger un exercice en « {modeRubric.label} »</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VUE MODE GUIDE : ENTONNOIR DE SÉLECTION & SIMULATEUR 4 ÉTAPES   */}
      {/* ============================================================== */}
      {activeViewTab === 'mode_guide_simulator' && (
        <DojoGuideModeSimulator
          exercises={exercises}
          onSessionComplete={(exercise, reps, duration, earnedXp) => {
            setSyncFeedback(`Séance Mode Guide validée : +${earnedXp} XP enregistrés pour « ${exercise.name} » (${reps} reps en ${duration}s) !`);
            setTimeout(() => setSyncFeedback(null), 4000);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* VUE 1 : RÉPARTITION PAR PROFIL DE CONFIGURATION DOJO IA         */}
      {/* ============================================================== */}
      {activeViewTab === 'distribution_profiles' && (
        <div className="space-y-6">
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/70 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Configurations d'arbitrage possibles :</strong> Répartissez les exercices selon le niveau de tolérance et le contexte de match (duels 1v1 stricts, entraînement quotidien, débutants).
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
              4 Profils Actifs
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {DOJO_CONFIG_PROFILES.map((profile) => {
              const assignedExercises = exercises.filter((e) => e.configProfile === profile.id);

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${profile.badgeColor}`}>
                          {profile.name}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm mt-1">{profile.tagline}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {assignedExercises.length} mouvement{assignedExercises.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {profile.description}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between">
                        <span>Tolérance de sensibilité :</span>
                        <strong className="text-slate-800">{(profile.defaultSensitivity * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Contrôle Anti-Kipping / Balancier :</span>
                        <strong className={profile.strictKippingCheck ? 'text-emerald-700' : 'text-slate-600'}>
                          {profile.strictKippingCheck ? 'Strict (Interdit)' : 'Permissif'}
                        </strong>
                      </div>
                    </div>

                    {/* Assigned movements */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Mouvements affectés à cette règle ({assignedExercises.length}) :
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {assignedExercises.map((ex) => (
                          <div
                            key={ex.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs hover:bg-blue-50/40 transition group"
                          >
                            <div>
                              <span className="font-medium text-slate-800">{ex.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{ex.category}</span>
                                <span>•</span>
                                <span>{ex.difficulty}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <select
                                disabled={userRole !== 'superadmin'}
                                value={ex.configProfile}
                                onChange={(e) =>
                                  handleAssignProfile(ex, e.target.value as DojoConfigProfile)
                                }
                                className="text-[11px] py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium cursor-pointer hover:border-blue-500"
                              >
                                {DOJO_CONFIG_PROFILES.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name.split(' ')[0]}
                                  </option>
                                ))}
                              </select>
                              <button
                                title="Tester"
                                onClick={() => {
                                  setSelectedExerciseId(ex.id);
                                  setActiveViewTab('dojo_simulator');
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VUE 2 : RÉPARTITION PAR MODE DE DÉTECTION (DYNAMIC, ISOMETRIC..)*/}
      {/* ============================================================== */}
      {activeViewTab === 'distribution_modes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'DYNAMIC_REPS' as DojoMode,
                name: 'Répétitions Dynamiques',
                desc: 'Comptage aller-retour flexion/extension (Pompes, Tractions, Dips, Squats)',
                badge: 'bg-blue-50 text-blue-700 border-blue-200',
              },
              {
                id: 'STATIC_HOLD' as DojoMode,
                name: 'Maintien Isométrique',
                desc: 'Chronomètre actif tant que la posture angulaire est tenue (L-Sit, Planche)',
                badge: 'bg-amber-50 text-amber-700 border-amber-200',
              },
              {
                id: 'AMRAP_TIMED' as DojoMode,
                name: 'Vitesse / AMRAP',
                desc: 'Maximum de répétitions propres validées en temps limité avec chrono',
                badge: 'bg-rose-50 text-rose-700 border-rose-200',
              },
              {
                id: 'PROGRESSION_DRILL' as DojoMode,
                name: 'Éducatif / Progression',
                desc: 'Mouvement d’apprentissage guidé avec tolérance pour débutants',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              },
            ].map((mode) => {
              const assigned = exercises.filter((e) => e.dojoMode === mode.id);

              return (
                <div
                  key={mode.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mode.badge}`}>
                        {mode.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {assigned.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{mode.desc}</p>

                    <div className="space-y-1.5 pt-2 max-h-56 overflow-y-auto">
                      {assigned.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">{ex.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              title="Vidéo Démo"
                              onClick={() => {
                                setSelectedVideoExercise(ex);
                                setIsVideoModalOpen(true);
                              }}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                            <select
                              disabled={userRole !== 'superadmin'}
                              value={ex.dojoMode}
                              onChange={(e) => handleAssignMode(ex, e.target.value as DojoMode)}
                              className="text-[10px] py-0.5 px-1.5 rounded bg-white border border-slate-200"
                            >
                              <option value="DYNAMIC_REPS">Reps</option>
                              <option value="STATIC_HOLD">Isométrie</option>
                              <option value="AMRAP_TIMED">AMRAP</option>
                              <option value="PROGRESSION_DRILL">Éducatif</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VUE 3 : RÉPARTITION PAR SPLIT MUSCULAIRE                       */}
      {/* ============================================================== */}
      {activeViewTab === 'distribution_splits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: 'PUSH' as MovementSplit, name: 'Poussée (Push)', desc: 'Pectoraux, Triceps, Épaules', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
              { id: 'PULL' as MovementSplit, name: 'Tirage (Pull)', desc: 'Dorsaux, Biceps, Avant-bras', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700' },
              { id: 'LEGS' as MovementSplit, name: 'Jambes (Legs)', desc: 'Quadriceps, Fessiers, Mollets', color: 'border-purple-200 bg-purple-50/40 text-purple-700' },
              { id: 'CORE' as MovementSplit, name: 'Gainage (Core)', desc: 'Abdominaux & Transverse', color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
              { id: 'FULL_BODY' as MovementSplit, name: 'Full Body', desc: 'Combos & Polyarticulaires', color: 'border-rose-200 bg-rose-50/40 text-rose-700' },
            ].map((split) => {
              const assigned = exercises.filter((e) => e.movementSplit === split.id);

              return (
                <div
                  key={split.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${split.color}`}>
                        {split.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {assigned.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{split.desc}</p>

                    <div className="space-y-1.5 pt-2 max-h-60 overflow-y-auto">
                      {assigned.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate mr-1.5">{ex.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              title="Vidéo Démo"
                              onClick={() => {
                                setSelectedVideoExercise(ex);
                                setIsVideoModalOpen(true);
                              }}
                              className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                            <select
                              disabled={userRole !== 'superadmin'}
                              value={ex.movementSplit}
                              onChange={(e) => handleAssignSplit(ex, e.target.value as MovementSplit)}
                              className="text-[10px] py-0.5 px-1 rounded bg-white border border-slate-200"
                            >
                              <option value="PUSH">Push</option>
                              <option value="PULL">Pull</option>
                              <option value="LEGS">Legs</option>
                              <option value="CORE">Core</option>
                              <option value="FULL_BODY">Full</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VUE 4 : CATALOGUE GLOBAL & RECHERCHE                           */}
      {/* ============================================================== */}
      {activeViewTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, muscle..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium"
              >
                <option value="ALL">Tous les niveaux</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Élite">Élite</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {ex.category}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm mt-1">{ex.name}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {ex.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      Cible : {DOJO_TARGET_AREAS.find((a) => a.id === ex.targetArea)?.label || ex.targetArea}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                      Type : {ex.trainingType === 'ENDURANCE' ? 'Endurance' : 'Force'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-medium border border-cyan-200">
                      {ex.executionMode === 'MODE_GUIDE' ? 'Mode Guide 3D' : 'Mode Vision IA'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{ex.instructions}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Équipement requis :</span>
                      <strong className="text-slate-700">{ex.equipment}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Angles articulaires :</span>
                      <strong className="text-slate-700">
                        {ex.minAngle}° (inflexion) → {ex.maxAngle}° (extension)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedExerciseId(ex.id);
                        setActiveViewTab('dojo_simulator');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tester</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedVideoExercise(ex);
                        setIsVideoModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-600" />
                      <span>Vidéo</span>
                    </button>
                  </div>

                  {userRole === 'superadmin' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setReassigningExercise(ex)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                      >
                        Ranger
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer « ${ex.name} » ?`)) {
                            onDeleteExercise(ex.id);
                          }
                        }}
                        className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VUE 5 : BANC D'ESSAI DU DOJO IA (SIMULATEUR INTERACTIF)        */}
      {/* ============================================================== */}
      {activeViewTab === 'dojo_simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Camera & Articulation Simulator */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                      Banc d'Essai Dojo • Moteur ML Kit Pose Detection
                    </h3>
                    <p className="text-xs text-slate-400">
                      Simulation cinématique en temps réel • Exercice : <strong>{currentDojoExercise?.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    {currentDojoExercise?.configProfile}
                  </span>
                  <button
                    onClick={() => {
                      setSimulatedRepsCount(0);
                      setSimulatedPhase('DÉPART');
                      setHasHitInflection(false);
                      setSimulatedAngle(currentDojoExercise.maxAngle);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulation Mode Toggle Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium px-1">Mode d'affichage :</span>
                  <button
                    type="button"
                    onClick={() => setSimulatorShowVideoSplit(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      !simulatorShowVideoSplit
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Squelette IA
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorShowVideoSplit(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      simulatorShowVideoSplit
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span>Split-Screen (Squelette + Vidéo Démo)</span>
                  </button>
                </div>

                {currentDojoExercise && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVideoExercise(currentDojoExercise);
                      setIsVideoModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Film className="w-3.5 h-3.5 text-rose-400" />
                    <span>Grand Lecteur Vidéo</span>
                  </button>
                )}
              </div>

              {/* Viewport Simulation Area (Single or Split-Screen) */}
              <div className={`mt-3 grid gap-3 ${simulatorShowVideoSplit ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Panel 1: SVG Skeleton Articulation Overlay */}
                <div className="relative aspect-video bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 400 250">
                    <line x1="200" y1="50" x2="200" y2="120" stroke="#38bdf8" strokeWidth="4" />
                    <circle cx="200" cy="40" r="14" fill="#38bdf8" />
                    {/* Arm angle depiction */}
                    <line
                      x1="200"
                      y1="70"
                      x2={200 - Math.cos((simulatedAngle * Math.PI) / 180) * 50}
                      y2={70 + Math.sin((simulatedAngle * Math.PI) / 180) * 50}
                      stroke="#38bdf8"
                      strokeWidth="4"
                    />
                    <line x1="200" y1="120" x2="170" y2="200" stroke="#38bdf8" strokeWidth="4" />
                    <line x1="200" y1="120" x2="230" y2="200" stroke="#38bdf8" strokeWidth="4" />
                  </svg>

                  {/* Live Pose Badges */}
                  <div className="absolute top-3 left-3 space-y-1">
                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]">
                      <span className="text-slate-400">Angle mesuré :</span>{' '}
                      <strong className="text-blue-400 font-mono font-bold">{simulatedAngle}°</strong>
                    </div>
                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]">
                      <span className="text-slate-400">Déviation tronc :</span>{' '}
                      <strong className="text-amber-400 font-mono font-bold">{simulatedTrunkDeviation}°</strong>
                    </div>
                  </div>

                  {/* Real-time State Machine Badge */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                        Phase courante
                      </span>
                      <strong className="text-xs font-mono text-emerald-400">
                        {simulatedPhase === 'DÉPART' && currentDojoExercise?.stateMachineLabels.start}
                        {simulatedPhase === 'MOUVEMENT' && 'MOUVEMENT_EN_COURS'}
                        {simulatedPhase === 'INFLECTION' && currentDojoExercise?.stateMachineLabels.inflection}
                        {simulatedPhase === 'VALIDÉE' && currentDojoExercise?.stateMachineLabels.completion}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                        Répétitions validées
                      </span>
                      <strong className="text-lg font-bold font-mono text-white">
                        {simulatedRepsCount}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Panel 2 (if split-screen): Real Video Demonstration */}
                {simulatorShowVideoSplit && currentDojoExercise && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black flex flex-col justify-center">
                    <ExerciseVideoPlayer
                      url={currentDojoExercise.videoDemoUrl}
                      exercise={currentDojoExercise}
                      showKinematicOverlay={true}
                      autoPlay={true}
                      loop={true}
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-lg border border-white/10 font-medium">
                      Vidéo de Référence
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Slider Controls */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">
                    Glissez pour simuler la flexion articulaire ({currentDojoExercise?.minAngle}° inflexion ↔ {currentDojoExercise?.maxAngle}° extension)
                  </span>
                  <span className="font-mono text-blue-400 font-bold">{simulatedAngle}°</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={simulatedAngle}
                  onChange={(e) => handleAngleSliderChange(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Mode anti-kipping : {currentDojoExercise?.strictMode ? 'STRICT' : 'PERMISSIF'}</span>
                <span>Sensibilité : {(currentDojoExercise?.sensitivity * 100).toFixed(0)}%</span>
                <span>Temps sous tension min : {currentDojoExercise?.minTUTSeconds}s</span>
              </div>
            </div>
          </div>

          {/* Right: Exercise Selector and Parameters */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Choisir l'exercice à tester
              </h4>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setSelectedExerciseId(ex.id);
                      setSimulatedAngle(ex.maxAngle);
                      setSimulatedPhase('DÉPART');
                      setHasHitInflection(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                      ex.id === selectedExerciseId
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <span>{ex.name}</span>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {ex.category} • {ex.minAngle}° à {ex.maxAngle}°
                      </span>
                    </div>
                    {ex.id === selectedExerciseId && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Règle d'arbitrage active :</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Le Dojo valide une répétition uniquement si l'angle descend sous{' '}
                <strong>{currentDojoExercise?.minAngle}°</strong> puis remonte au-delà de{' '}
                <strong>{currentDojoExercise?.maxAngle - 5}°</strong> avec un temps sous tension minimal de{' '}
                <strong>{currentDojoExercise?.minTUTSeconds}s</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1 : AJOUTER OU MODIFIER UN EXERCICE                      */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingExercise ? 'Modifier l’exercice & son rangement' : 'Ajouter un exercice & le ranger'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: CHOIX DE LA CIBLE (RUBRIQUE MOBILE) */}
              <div className="space-y-2 p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                  1. Choix de la Cible (Rubrique officielle du Dojo mobile)
                </label>
                <p className="text-[11px] text-blue-700">
                  L'exercice sera automatiquement rangé et affiché sous cette rubrique dans l'application :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                  {DOJO_TARGET_AREAS.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setFormTargetArea(a.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        formTargetArea === a.id
                          ? 'border-blue-600 bg-white text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{a.label}</span>
                        {formTargetArea === a.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {a.tagline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2 & 3: TYPE & MODE D'EXÉCUTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Type d'Entraînement
                  </label>
                  <div className="space-y-1.5">
                    {DOJO_TRAINING_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setFormTrainingType(t.id)}
                        className={`w-full p-2 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                          formTrainingType === t.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{t.label}</span>
                          <span className="text-[10px] text-slate-500 block">{t.tagline}</span>
                        </div>
                        {formTrainingType === t.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Mode d'Exécution
                  </label>
                  <div className="space-y-1.5">
                    {DOJO_EXECUTION_MODES.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setFormExecutionMode(m.id);
                          setFormAiDetection(m.id === 'MODE_VISION');
                        }}
                        className={`w-full p-2 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                          formExecutionMode === m.id
                            ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{m.label}</span>
                          <span className="text-[10px] text-slate-500 block">{m.tagline}</span>
                        </div>
                        {formExecutionMode === m.id && (
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nom de l'exercice *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Tractions Australiennes Pronation"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Catégorie musculaire
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MuscleGroup)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    >
                      {muscleCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Difficulté
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as AthleteLevel)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Élite">Élite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Équipement requis
                    </label>
                    <select
                      value={formEquipment}
                      onChange={(e) => setFormEquipment(e.target.value as EquipmentRequired)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <option value="Poids du corps">Poids du corps</option>
                      <option value="Barre de traction">Barre de traction</option>
                      <option value="Barres parallèles">Barres parallèles</option>
                      <option value="Anneaux de gymnastique">Anneaux de gymnastique</option>
                      <option value="Banc ou surface surélevée">Banc ou surface surélevée</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Muscles ciblés (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={formTargetMuscles}
                    onChange={(e) => setFormTargetMuscles(e.target.value)}
                    placeholder="Pectoraux, Triceps, Deltoïde antérieur..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Instructions d'exécution
                  </label>
                  <textarea
                    rows={3}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Détaillez la position de départ, la trajectoire, et les consignes de sécurité..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              {/* SECTION: VIDÉO ASSOCIÉE À L'EXERCICE */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>Vidéo Démonstrative Associée</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    YouTube, Vimeo, MP4 direct, Cloud Storage ou fichier local
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder="Ex: https://www.youtube.com/watch?v=... ou https://cdn.../clip.mp4"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <label className="cursor-pointer px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0 w-full sm:w-auto">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Importer un fichier (.mp4)</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const localUrl = URL.createObjectURL(file);
                            setFormVideoUrl(localUrl);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Suggestions rapides calisthénie */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Exemples rapides :</span>
                    {[
                      { name: 'Pompes HD', url: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
                      { name: 'Tractions HD', url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
                      { name: 'Dips HD', url: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },
                      { name: 'Muscle-Up HD', url: 'https://www.youtube.com/watch?v=yW63V6XbKvg' },
                      { name: 'Pistol Squat HD', url: 'https://www.youtube.com/watch?v=qDcniqddTeE' },
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setFormVideoUrl(item.url)}
                        className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 transition"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>

                  {/* Lecteur d'aperçu en direct dans le formulaire */}
                  {formVideoUrl && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <Film className="w-3.5 h-3.5 text-blue-600" />
                        <span>Aperçu en direct du lecteur :</span>
                      </span>
                      <ExerciseVideoPlayer
                        url={formVideoUrl}
                        className="max-h-56"
                        autoPlay={false}
                        loop={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Kinematic Rules */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Paramètres Kinématiques Google ML Kit Pose Detection
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Angle min (flexion)</label>
                    <input
                      type="number"
                      value={formMinAngle}
                      onChange={(e) => setFormMinAngle(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Angle max (extension)</label>
                    <input
                      type="number"
                      value={formMaxAngle}
                      onChange={(e) => setFormMaxAngle(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tolérance (0.1 à 1.0)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="1.0"
                      value={formSensitivity}
                      onChange={(e) => setFormSensitivity(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">TUT min (sec)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formMinTUT}
                      onChange={(e) => setFormMinTUT(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                >
                  {editingExercise ? 'Enregistrer les modifications' : 'Créer et ranger l’exercice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2 : RECLASSER / CHANGER RAPIDEMENT DE RUBRIQUE           */}
      {/* ============================================================== */}
      {reassigningExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Rangement de l'exercice
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  Reclasser « {reassigningExercise.name} »
                </h3>
              </div>
              <button
                onClick={() => setReassigningExercise(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Choisissez les rubriques précises dans lesquelles ranger ce mouvement. Il sera immédiatement déplacé dans la rubrique correspondante :
            </p>

            <div className="space-y-4">
              {/* 1. Target Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1. Cible Dojo (Rubrique Principale) :
                </label>
                <select
                  value={reassigningExercise.targetArea || 'HAUT_DU_CORPS'}
                  onChange={(e) =>
                    setReassigningExercise({
                      ...reassigningExercise,
                      targetArea: e.target.value as DojoTargetArea,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  {DOJO_TARGET_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.tagline}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Training Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2. Type d'Entraînement :
                </label>
                <select
                  value={reassigningExercise.trainingType || 'FORCE'}
                  onChange={(e) =>
                    setReassigningExercise({
                      ...reassigningExercise,
                      trainingType: e.target.value as DojoTrainingType,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  {DOJO_TRAINING_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} ({t.tagline})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Execution Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Mode d'Exécution :
                </label>
                <select
                  value={reassigningExercise.executionMode || 'MODE_VISION'}
                  onChange={(e) =>
                    setReassigningExercise({
                      ...reassigningExercise,
                      executionMode: e.target.value as DojoExecutionMode,
                      aiPoseDetection: e.target.value === 'MODE_VISION',
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  {DOJO_EXECUTION_MODES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.tagline})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Dojo Tolerance Profile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  4. Profil de Tolérance Dojo :
                </label>
                <select
                  value={reassigningExercise.configProfile}
                  onChange={(e) =>
                    setReassigningExercise({
                      ...reassigningExercise,
                      configProfile: e.target.value as DojoConfigProfile,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
                >
                  {DOJO_CONFIG_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassigningExercise(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateExercise(reassigningExercise);
                  const targetLabel =
                    DOJO_TARGET_AREAS.find((a) => a.id === reassigningExercise.targetArea)?.label ||
                    reassigningExercise.targetArea;
                  setSyncFeedback(
                    `« ${reassigningExercise.name} » a été reclassé avec succès dans la rubrique « ${targetLabel} » !`
                  );
                  setTimeout(() => setSyncFeedback(null), 3000);
                  setReassigningExercise(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
              >
                Appliquer le nouveau rangement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3 : QUICK MOVE AN EXERCISE INTO THIS SPECIFIC RUBRIC     */}
      {/* ============================================================== */}
      {quickMoveTargetRubric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Rangement rapide
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  Ranger un exercice dans cette rubrique
                </h3>
              </div>
              <button
                onClick={() => setQuickMoveTargetRubric(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Sélectionnez un exercice ci-dessous pour le déplacer immédiatement dans cette rubrique :
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {exercises
                .filter((ex) => {
                  if (quickMoveTargetRubric.axis === 'targetArea') {
                    return ex.targetArea !== quickMoveTargetRubric.value;
                  }
                  if (quickMoveTargetRubric.axis === 'trainingType') {
                    return ex.trainingType !== quickMoveTargetRubric.value;
                  }
                  if (quickMoveTargetRubric.axis === 'executionMode') {
                    return ex.executionMode !== quickMoveTargetRubric.value;
                  }
                  return true;
                })
                .map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      let updated: ExerciseItem = { ...ex };
                      if (quickMoveTargetRubric.axis === 'targetArea') {
                        updated.targetArea = quickMoveTargetRubric.value as DojoTargetArea;
                      } else if (quickMoveTargetRubric.axis === 'trainingType') {
                        updated.trainingType = quickMoveTargetRubric.value as DojoTrainingType;
                      } else if (quickMoveTargetRubric.axis === 'executionMode') {
                        updated.executionMode = quickMoveTargetRubric.value as DojoExecutionMode;
                        updated.aiPoseDetection = quickMoveTargetRubric.value === 'MODE_VISION';
                      }
                      onUpdateExercise(updated);
                      setSyncFeedback(`« ${ex.name} » a été rangé dans la rubrique sélectionnée !`);
                      setTimeout(() => setSyncFeedback(null), 3000);
                      setQuickMoveTargetRubric(null);
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                        {ex.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Actuel : {ex.targetArea || 'HAUT_DU_CORPS'} • {ex.trainingType || 'FORCE'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4 : LECTEUR VIDÉO INTERACTIF & GESTIONNAIRE DE VIDÉO     */}
      {/* ============================================================== */}
      <ExerciseVideoModal
        exercise={selectedVideoExercise}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        userRole={userRole}
        onUpdateExerciseVideo={handleUpdateExerciseVideo}
      />
    </div>
  );
};
