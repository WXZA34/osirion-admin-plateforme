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
  TrendingUp
} from 'lucide-react';
import { WorkoutProgram, AthleteLevel } from '../types/admin';

interface WorkoutProgramsManagerProps {
  programs: WorkoutProgram[];
  userRole: 'superadmin' | 'auditor';
  onAddProgram: (program: WorkoutProgram) => void;
  onTogglePublish: (programId: string) => void;
}

export const WorkoutProgramsManager: React.FC<WorkoutProgramsManagerProps> = ({
  programs,
  userRole,
  onAddProgram,
  onTogglePublish,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<AthleteLevel>('Intermédiaire');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);
  const [exercisesList, setExercisesList] = useState('Pompes, Tractions, Dips, Gainage Planche');

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
      exercisesList: exercisesList.split(',').map((s) => s.trim()).filter(Boolean),
    };

    onAddProgram(newProg);
    setShowAddModal(false);
    setTitle('');
    setTagline('');
    setDescription('');
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
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow transition space-y-4 flex flex-col justify-between"
          >
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
                  {prog.exercisesList.map((exName) => (
                    <span
                      key={exName}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                    >
                      {exName}
                    </span>
                  ))}
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
                <div className="pt-2 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Créé par {prog.author}</span>
                  <button
                    onClick={() => onTogglePublish(prog.id)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {prog.published ? 'Désactiver' : 'Publier'}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Créer un nouveau programme d'entraînement
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
                  Exercices inclus (séparés par des virgules) :
                </label>
                <input
                  type="text"
                  value={exercisesList}
                  onChange={(e) => setExercisesList(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Publier le programme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
