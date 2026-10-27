import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Target,
  Lock,
  Unlock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Edit2,
  Trash2,
  BarChart2,
  Video,
  Upload
} from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { WorkoutProgram, AthleteLevel, ExerciseItem } from '../types/admin';

interface WorkoutProgramsManagerProps {
  programs: WorkoutProgram[];
  exercises: ExerciseItem[];
  userRole: 'superadmin' | 'auditor';
  onAddProgram: (program: WorkoutProgram) => void;
  onTogglePublish: (programId: string) => void;
  onUpdateProgram: (program: WorkoutProgram) => void;
  onDeleteProgram: (programId: string) => void;
  onAddExercise: (exercise: ExerciseItem) => void;
}

export const WorkoutProgramsManager: React.FC<WorkoutProgramsManagerProps> = ({
  programs,
  exercises,
  userRole,
  onAddProgram,
  onTogglePublish,
  onUpdateProgram,
  onDeleteProgram,
  onAddExercise,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);
  const [viewDetailsProgram, setViewDetailsProgram] = useState<WorkoutProgram | null>(null);
  
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<AthleteLevel>('Intermédiaire');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [programExercises, setProgramExercises] = useState<{ exerciseId: string; sets: number; reps: number }[]>([]);

  // Fast Video Exercise creation states
  const [quickVideoName, setQuickVideoName] = useState('');
  const [quickVideoUrl, setQuickVideoUrl] = useState('');
  const [isUploadingQuickVideo, setIsUploadingQuickVideo] = useState(false);
  const [quickUploadProgress, setQuickUploadProgress] = useState(0);

  const handleQuickVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 100 Mo).");
      return;
    }

    try {
      setIsUploadingQuickVideo(true);
      setQuickUploadProgress(0);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `exercises/${Date.now()}_${cleanName}`);
      const uploadTask = uploadBytesResumable(fileRef, file, { contentType: file.type || 'video/mp4' });

      uploadTask.on(
        'state_changed',
        (snap) => {
          if (snap.totalBytes > 0) {
            setQuickUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
          }
        },
        (err) => {
          console.error("Upload error:", err);
          setIsUploadingQuickVideo(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setQuickVideoUrl(downloadUrl);
          setIsUploadingQuickVideo(false);
        }
      );
    } catch {
      setIsUploadingQuickVideo(false);
    }
  };

  const handleQuickAddVideoExercise = () => {
    if (!quickVideoName.trim() || !quickVideoUrl.trim()) return;

    const newExId = `ex_video_${Date.now()}`;
    const newEx: ExerciseItem = {
      id: newExId,
      name: quickVideoName,
      category: 'Corps Complet (Full Body)',
      difficulty: 'Débutant',
      equipment: 'Poids du corps',
      targetMuscles: [],
      targetArea: 'HAUT_DU_CORPS',
      trainingType: 'FORCE',
      executionMode: 'MODE_GUIDE', // It's just a video guide, no AI
      dojoMode: 'DYNAMIC_REPS',
      movementSplit: 'FULL_BODY',
      configProfile: 'STANDARD_DAILY',
      aiPoseDetection: false,
      hasAiSupport: false,
      minAngle: 0,
      maxAngle: 0,
      sensitivity: 0,
      strictMode: false,
      maxTrunkDeviationDeg: 0,
      minTUTSeconds: 0,
      monitoredLandmarks: [],
      stateMachineLabels: { start: '', inflection: '', completion: '' },
      instructions: 'Suivez la vidéo.',
      videoDemoUrl: quickVideoUrl,
      popularityRank: 1,
      activeInWorkouts: true,
      xpRewardPerUnit: 10,
      unit: 'reps',
    };
    (newEx as any).videoUrl = quickVideoUrl;

    onAddExercise(newEx);
    setSelectedExerciseIds([...selectedExerciseIds, newExId]);
    setProgramExercises([...programExercises, { exerciseId: newExId, sets: 3, reps: 10 }]);
    setQuickVideoName('');
    setQuickVideoUrl('');
  };

  const toggleExercise = (id: string) => {
    if (selectedExerciseIds.includes(id)) {
      setSelectedExerciseIds(selectedExerciseIds.filter((exId) => exId !== id));
      setProgramExercises(programExercises.filter((pe) => pe.exerciseId !== id));
    } else {
      setSelectedExerciseIds([...selectedExerciseIds, id]);
      setProgramExercises([...programExercises, { exerciseId: id, sets: 3, reps: 10 }]);
    }
  };

  const updateProgramExercise = (exerciseId: string, sets: number, reps: number) => {
    setProgramExercises(programExercises.map((pe) => 
      pe.exerciseId === exerciseId ? { ...pe, sets, reps } : pe
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProg: WorkoutProgram = {
      id: `prog_${Date.now()}`,
      title,
      tagline,
      description,
      difficulty,
      durationWeeks,
      sessionsPerWeek,
      targetObjective: 'Progression structurée et gain de force',
      enrolledAthletes: 0,
      completionRate: 0,
      isPremiumOnly,
      published: true,
      author: 'Équipe Osirion Staff',
      imageUrl: imageUrl.trim() || undefined,
      exercisesList: selectedExerciseIds, // Now storing IDs
      programExercises: programExercises,
    };

    onAddProgram(newProg);
    resetForm();
  };

  const handleEditClick = (prog: WorkoutProgram) => {
    setEditingProgram(prog);
    setTitle(prog.title);
    setTagline(prog.tagline);
    setDescription(prog.description);
    setDifficulty(prog.difficulty);
    setDurationWeeks(prog.durationWeeks);
    setSessionsPerWeek(prog.sessionsPerWeek);
    setIsPremiumOnly(prog.isPremiumOnly);
    setImageUrl(prog.imageUrl || '');
    setSelectedExerciseIds(prog.exercisesList);
    setProgramExercises(prog.programExercises || prog.exercisesList.map(id => ({ exerciseId: id, sets: 3, reps: 10 })));
    setShowAddModal(true);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingProgram(null);
    setTitle('');
    setTagline('');
    setDescription('');
    setImageUrl('');
    setSelectedExerciseIds([]);
    setProgramExercises([]);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !editingProgram) return;

    const updatedProg: WorkoutProgram = {
      ...editingProgram,
      title,
      tagline,
      description,
      difficulty,
      durationWeeks,
      sessionsPerWeek,
      isPremiumOnly,
      imageUrl: imageUrl.trim() || undefined,
      exercisesList: selectedExerciseIds,
      programExercises: programExercises,
    };

    onUpdateProgram(updatedProg);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Programmes d'Entraînement de Callisthénie
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cycles d'entraînement guidés, répartitions hebdomadaires et suivi de la complétion des athlètes
          </p>
        </div>

        {userRole === 'superadmin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un programme</span>
          </button>
        )}
      </div>

      {/* Programs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow transition space-y-4 flex flex-col justify-between overflow-hidden"
          >
            {prog.imageUrl && (
              <div className="-mx-6 -mt-6 mb-4 h-32 bg-slate-100 overflow-hidden relative">
                <img src={prog.imageUrl} alt={prog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    prog.difficulty === 'Débutant'
                      ? 'bg-emerald-50 text-emerald-700'
                      : prog.difficulty === 'Intermédiaire'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {prog.difficulty}
                </span>

                <div className="flex items-center gap-1.5">
                  {prog.isPremiumOnly ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Lock className="w-3 h-3" />
                      Abonnés Pro
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Accès Gratuit
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-base">{prog.title}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{prog.tagline}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Durée</span>
                    <span className="font-semibold text-slate-800">{prog.durationWeeks} semaines</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Rythme</span>
                    <span className="font-semibold text-slate-800">{prog.sessionsPerWeek} séances/sem.</span>
                  </div>
                </div>
              </div>

              {/* Exercises in Program */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Mouvements au programme :
                </span>
                <div className="flex flex-wrap gap-1">
                  {prog.exercisesList.map((exId) => {
                    const exName = exercises.find((e) => e.id === exId)?.name || exId;
                    return (
                      <span
                        key={exId}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                      >
                        {exName}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Enrolled Stats */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Athlètes inscrits :
                </span>
                <span className="font-bold text-slate-900">{prog.enrolledAthletes}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Taux de complétion</span>
                  <span className="font-semibold text-emerald-600">{prog.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${prog.completionRate}%` }}
                  />
                </div>
              </div>

              {userRole === 'superadmin' && (
                <div className="pt-3 flex flex-wrap gap-2 justify-between items-center text-[11px]">
                  <span className="text-slate-400">Créé par {prog.author}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewDetailsProgram(prog)}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                      title="Détails & Statistiques"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(prog)}
                      className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                      title="Modifier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment supprimer le programme "${prog.title}" ?`)) {
                          onDeleteProgram(prog.id);
                        }
                      }}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
              {userRole === 'superadmin' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onTogglePublish(prog.id)}
                    className={`text-[11px] font-medium ${prog.published ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    {prog.published ? 'Désactiver (Cacher)' : 'Publier (Rendre visible)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Program */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  {editingProgram ? 'Modifier le programme d\'entraînement' : 'Créer un nouveau programme d\'entraînement'}
                </h3>
              </div>
              <button onClick={resetForm} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingProgram ? handleUpdateSubmit : handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Titre du programme :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maîtrise du Front Lever"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Accroche courte :</label>
                <input
                  type="text"
                  placeholder="Ex: Cycle de 6 semaines pour verrouiller la ligne horizontale"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Niveau :</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as AthleteLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Élite">Élite</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Semaines :</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Séances/sem :</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Description détaillée :</label>
                <textarea
                  rows={3}
                  placeholder="Expliquez la méthodologie et les adaptations physiologiques..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  URL de l'image d'illustration (optionnelle) :
                </label>
                <input
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-2">
                  Sélectionner les exercices inclus :
                </label>

                {/* Option 1: Select from existing library */}
                <div className="max-h-40 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1">Option 1 : Piocher dans la librairie</div>
                  {exercises.map((ex) => (
                    <label key={ex.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExerciseIds.includes(ex.id)}
                        onChange={() => toggleExercise(ex.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-slate-700 text-xs">{ex.name}</span>
                      {!ex.hasAiSupport && <Video className="w-3 h-3 text-slate-400 ml-auto" />}
                    </label>
                  ))}
                </div>

                {/* Option 2: Quick add video block */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                  <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">Option 2 : Ajouter une vidéo personnalisée rapide</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Étirement)"
                      value={quickVideoName}
                      onChange={(e) => setQuickVideoName(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="Lien de la vidéo (Youtube/MP4 ou Storage)"
                      value={quickVideoUrl}
                      onChange={(e) => setQuickVideoUrl(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-hidden"
                    />
                    <label className="cursor-pointer px-2.5 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 flex items-center justify-center gap-1 shrink-0">
                      <Upload className={`w-3.5 h-3.5 ${isUploadingQuickVideo ? 'animate-bounce text-blue-600' : 'text-blue-600'}`} />
                      <span>{isUploadingQuickVideo ? `Envoi (${quickUploadProgress}%)...` : 'Fichier .mp4'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/*"
                        className="hidden"
                        disabled={isUploadingQuickVideo}
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = '';
                        }}
                        onChange={handleQuickVideoUpload}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleQuickAddVideoExercise}
                      disabled={isUploadingQuickVideo}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                  {isUploadingQuickVideo && (
                    <div className="w-full bg-blue-200 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${quickUploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {programExercises.length > 0 && (
                  <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                    <div className="text-[10px] uppercase font-bold text-emerald-600 mb-2">Séries & Répétitions</div>
                    {programExercises.map((pe) => {
                      const exName = exercises.find((e) => e.id === pe.exerciseId)?.name || 'Vidéo personnalisée';
                      return (
                        <div key={pe.exerciseId} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded border border-emerald-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <span className="truncate flex-1 text-[11px] font-semibold text-slate-700">{exName}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={pe.sets}
                              onChange={(e) => updateProgramExercise(pe.exerciseId, Number(e.target.value), pe.reps)}
                              className="w-14 px-2 py-1 text-xs border border-emerald-200 rounded focus:outline-hidden"
                            />
                            <span className="text-[10px] text-slate-500">Séries</span>
                            <input
                              type="number"
                              min="1"
                              value={pe.reps}
                              onChange={(e) => updateProgramExercise(pe.exerciseId, pe.sets, Number(e.target.value))}
                              className="w-14 px-2 py-1 text-xs border border-emerald-200 rounded focus:outline-hidden"
                            />
                            <span className="text-[10px] text-slate-500">Reps</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isPrem"
                  checked={isPremiumOnly}
                  onChange={(e) => setIsPremiumOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isPrem" className="text-slate-700 font-medium">
                  Réservé aux abonnés Osirion Pro (Option payante)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {editingProgram ? 'Enregistrer les modifications' : 'Publier le programme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Details & Statistiques */}
      {viewDetailsProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-lg">
                  Statistiques : {viewDetailsProgram.title}
                </h3>
              </div>
              <button onClick={() => setViewDetailsProgram(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Athlètes inscrits</p>
                <p className="text-3xl font-bold text-slate-900">{viewDetailsProgram.enrolledAthletes}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Taux de complétion moyen</p>
                <p className="text-3xl font-bold text-slate-900">{viewDetailsProgram.completionRate}%</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">Évolution des inscriptions (30 derniers jours)</h4>
              {/* Mock chart representation */}
              <div className="h-48 flex items-end justify-between gap-1 px-2 border-b border-l border-slate-200 pb-1 pt-4">
                {[4, 12, 15, 22, 28, 35, 42, 45, 52, 60].map((val, i) => (
                  <div key={i} className="w-full bg-blue-100 rounded-t-sm hover:bg-blue-200 transition relative group" style={{ height: `${(val / 60) * 100}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {val} inscrits
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>Il y a 30 jours</span>
                <span>Aujourd'hui</span>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
               <button
                  type="button"
                  onClick={() => setViewDetailsProgram(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                >
                  Fermer
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
