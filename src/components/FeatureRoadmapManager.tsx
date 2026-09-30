import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  MapPin,
  Swords,
  Watch,
  Coins,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Flame,
  Star,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const FeatureRoadmapManager: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>('pullup_counter');
  const [votes, setVotes] = useState<{ [id: string]: number }>({
    pullup_counter: 42,
    dips_counter: 58,
    quality_rom_engine: 64,
    ghost_path_snapping: 51,
    clan_raids_service: 37,
    tournament_colosseum: 29,
  });

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const featureList = [
    {
      id: 'pullup_counter',
      title: 'Tractions Strictes (Pullup Counter)',
      category: 'vision_ai',
      categoryLabel: 'Dojo Vision IA',
      impact: 'Critique',
      difficulty: 'Moyen',
      estimatedDays: '3-4 jours',
      summary: 'Validation du menton au-dessus des poignets et extension complète des coudes.',
      detailedSpecs: [
        'Analyse de l’élévation verticale du nez par rapport à la ligne des poignets.',
        'Contrôle de l’extension complète des coudes (> 150°) en phase basse.',
        'Calcul du score biomécanique en temps réel (0 à 100).'
      ],
      techStack: ['google_mlkit_pose_detection', 'IValerionCounter'],
      osirionSynergy: 'Permet d’utiliser l’IA sur les barres de traction des Bastions extérieurs.'
    },
    {
      id: 'dips_counter',
      title: 'Dips Barres Parallèles',
      category: 'vision_ai',
      categoryLabel: 'Dojo Vision IA',
      impact: 'Très Élevé',
      difficulty: 'Moyen',
      estimatedDays: '3 jours',
      summary: 'Validation de l’angle droit (90°) aux coudes et verrouillage articulaire haut.',
      detailedSpecs: [
        'Angle coude-épaule-poignet calculé avec PoseMathService.',
        'Machine à états Locked ➔ Descent ➔ Bottom ➔ Validated.'
      ],
      techStack: ['google_mlkit_pose_detection', 'PoseMathService'],
      osirionSynergy: 'Complète la suite Street Workout aux côtés des pompes existantes.'
    },
    {
      id: 'quality_rom_engine',
      title: 'Score Biomécanique (ROM & Anti-Triche)',
      category: 'vision_ai',
      categoryLabel: 'Dojo Vision IA',
      impact: 'Très Élevé',
      difficulty: 'Moyen',
      estimatedDays: '3 jours',
      summary: 'Évalue la rectitude du gainage et attribue une note de 0 à 100.',
      detailedSpecs: [
        'Détection du bassin affaissé ou des fesses trop hautes.',
        'Bonus de +25% d’XP pour une exécution parfaite (score >= 80).'
      ],
      techStack: ['MovementQualityService', 'flutter_tts'],
      osirionSynergy: 'Garantit l’équité absolue lors des duels 1v1 en ligne.'
    },
    {
      id: 'ghost_path_snapping',
      title: 'Ghost Runner & Path Snapping',
      category: 'arena_h3',
      categoryLabel: 'Arena GPS & H3',
      impact: 'Élevé',
      difficulty: 'Facile',
      estimatedDays: '2 jours',
      summary: 'Projection orthogonale du coureur fantôme sur le tracé de la route sans dérive.',
      detailedSpecs: [
        'Projection mathématique sur les segments vectoriels de la polyline.',
        'Indicateur sonore de distance d’avance ou de retard en mètres.'
      ],
      techStack: ['latlong2', 'mapbox_maps_flutter'],
      osirionSynergy: 'Finalise la spécification en attente dans lib/features/arena/task.md.'
    },
    {
      id: 'clan_raids_service',
      title: 'Raids Synchronisés & Prise de Bastions',
      category: 'arena_h3',
      categoryLabel: 'Arena GPS & H3',
      impact: 'Très Élevé',
      difficulty: 'Complexe',
      estimatedDays: '5 jours',
      summary: 'Siège collectif où plusieurs membres de clan doivent se trouver physiquement sur le spot.',
      detailedSpecs: [
        'Géofencing actif (rayon de 35m) validant la présence simultanée.',
        'Cumul collectif de répétitions (ex: 500 tractions) pour capturer le bastion.'
      ],
      techStack: ['cloud_firestore', 'geolocator'],
      osirionSynergy: 'Transforme l’entraînement individuel en rassemblement d’équipe physique.'
    },
    {
      id: 'tournament_colosseum',
      title: 'Tournoi Hebdomadaire "Le Colisée" (8 Joueurs)',
      category: 'multiplayer',
      categoryLabel: 'Duels & Multijoueur',
      impact: 'Différenciant',
      difficulty: 'Complexe',
      estimatedDays: '6 jours',
      summary: 'Arbre de tournoi à élimination directe synchronisé en temps réel.',
      detailedSpecs: [
        'Quarts, demi-finales et finale avec rounds de 90 secondes.',
        'Jauge de Tir à la Corde arbitrée par Firebase Realtime Database.'
      ],
      techStack: ['firebase_database', 'TournamentSyncService'],
      osirionSynergy: 'Crée un pic d’engagement massif chaque week-end.'
    },
    {
      id: 'wear_os_health_bridge',
      title: 'Compagnon Montre Connectée (Wear OS)',
      category: 'hardware',
      categoryLabel: 'Hardware & Capteurs',
      impact: 'Critique',
      difficulty: 'Complexe',
      estimatedDays: '7 jours',
      summary: 'Impulsions haptiques au poignet et écriture dans Google Health Connect.',
      detailedSpecs: [
        'Vibration simple à chaque rep validée, double impulsion si mauvaise posture.',
        'Mesure continue du rythme cardiaque (BPM).'
      ],
      techStack: ['HealthConnectBridge.kt', 'androidx.health.connect'],
      osirionSynergy: 'Permet de s’entraîner sans jamais regarder l’écran du téléphone.'
    },
    {
      id: 'battle_pass_service',
      title: 'Passe de Saison (30 Paliers)',
      category: 'economy',
      categoryLabel: 'Économie & Rétention',
      impact: 'Très Élevé',
      difficulty: 'Moyen',
      estimatedDays: '4 jours',
      summary: 'Paliers de récompenses gratuites et Premium (Halos, Or, Titres).',
      detailedSpecs: [
        '30 paliers de progression trimestriels.',
        'Monétisation éthique basée uniquement sur des cosmétiques de prestige.'
      ],
      techStack: ['cloud_firestore', 'in_app_purchase'],
      osirionSynergy: 'Alimente l’économie de l’Aether et la boutique de reliques.'
    }
  ];

  const filtered = featureList.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feuille de route stratégique</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">8 chantiers certifiés</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Fonctionnalités prioritaires pour l'application Osirion
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Spécifications détaillées, dépendances logicielles et impact utilisateur pour consolider 
            la position d'Osirion en tant que plateforme d'entraînement physique d'élite.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {[
            { id: 'all', label: 'Toutes les fonctionnalités' },
            { id: 'vision_ai', label: 'Vision IA & Dojo' },
            { id: 'arena_h3', label: 'Arena & Bastions H3' },
            { id: 'multiplayer', label: 'Duels & Tournois' },
            { id: 'hardware', label: 'Hardware & Capteurs' },
            { id: 'economy', label: 'Économie & Progression' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-3">
        {filtered.map((feat) => {
          const isExpanded = expandedFeatureId === feat.id;
          const voteCount = votes[feat.id] || 0;

          return (
            <div
              key={feat.id}
              onClick={() => setExpandedFeatureId(isExpanded ? null : feat.id)}
              className={`bg-white rounded-2xl border transition-all cursor-pointer ${
                isExpanded
                  ? 'border-blue-500/50 shadow-md ring-2 ring-blue-500/5'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                    {feat.category === 'vision_ai' && <Cpu className="w-5 h-5 text-blue-600" />}
                    {feat.category === 'arena_h3' && <MapPin className="w-5 h-5 text-indigo-600" />}
                    {feat.category === 'multiplayer' && <Swords className="w-5 h-5 text-amber-600" />}
                    {feat.category === 'hardware' && <Watch className="w-5 h-5 text-emerald-600" />}
                    {feat.category === 'economy' && <Coins className="w-5 h-5 text-purple-600" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {feat.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {feat.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {feat.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      feat.impact === 'Critique'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : feat.impact === 'Très Élevé'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {feat.impact}
                  </span>

                  <button
                    onClick={(e) => handleVote(feat.id, e)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 transition"
                    title="Voter pour ce projet"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{voteCount}</span>
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Règles & Critères de Validation
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1.5">
                        {feat.detailedSpecs.map((spec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
                          Intégration dans le Code Osirion
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {feat.osirionSynergy}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1 font-medium">Dépendances requises :</span>
                        <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                          {feat.techStack.map((tech, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Délai estimé : <strong className="text-slate-700">{feat.estimatedDays}</strong></span>
                    </span>
                    <span>Complexité : <strong className="text-slate-700">{feat.difficulty}</strong></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
