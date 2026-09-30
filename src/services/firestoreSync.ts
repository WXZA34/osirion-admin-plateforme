import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import {
  INITIAL_ATHLETES,
  INITIAL_EXERCISES,
  INITIAL_PROGRAMS,
  INITIAL_SPOTS,
  INITIAL_PUSH_CAMPAIGNS,
  INITIAL_GLOBAL_SETTINGS,
} from '../data/mockData';
import { INITIAL_LIBRARY_BOOKS, INITIAL_LIBRARY_AUDIOS } from '../data/libraryData';
import { INITIAL_TRANSMISSIONS } from '../data/dailyTransmissionData';
import { INITIAL_USER_REPORTS } from '../data/moderationData';
import { INITIAL_PANTHEON_RECORDS } from '../data/pantheonData';
import { INITIAL_BASTIONS_SPOTS } from '../data/arenaData';

export interface FirestoreRubriqueInfo {
  id: string;
  name: string;
  category: 'Supervision & Revenus' | 'Contenu & Entraînement' | 'Communauté & Géolocalisation' | 'Système & Technique';
  firestorePath: string;
  type: 'COLLECTION' | 'DOCUMENT';
  description: string;
  mobileMapping: string;
  sampleItemCount: number;
}

export const FIRESTORE_RUBRIQUES: FirestoreRubriqueInfo[] = [
  // 1. Supervision & Revenus
  {
    id: 'users',
    name: 'Comptes Athlètes',
    category: 'Supervision & Revenus',
    firestorePath: 'users',
    type: 'COLLECTION',
    description: 'Profils réels, statistiques biomécaniques, XP, streaks et abonnements',
    mobileMapping: 'lib/features/auth/domain/entities/user_entity.dart',
    sampleItemCount: INITIAL_ATHLETES.length,
  },
  {
    id: 'pantheon',
    name: 'Le Panthéon & Légendes',
    category: 'Supervision & Revenus',
    firestorePath: 'pantheon_records',
    type: 'COLLECTION',
    description: 'Records certifiés par vision par ordinateur ML Kit et titres honorifiques',
    mobileMapping: 'lib/features/pantheon/data/models/record_model.dart',
    sampleItemCount: INITIAL_PANTHEON_RECORDS.length,
  },
  {
    id: 'subscriptions',
    name: 'Abonnements & Revenus',
    category: 'Supervision & Revenus',
    firestorePath: 'subscriptions',
    type: 'COLLECTION',
    description: 'Reçus Google Play Billing (9,99€/mois et 79,99€/an) et statut VIP',
    mobileMapping: 'lib/features/subscription/services/in_app_purchase_service.dart',
    sampleItemCount: 12,
  },
  {
    id: 'analytics',
    name: 'KPIs & Croissance Live',
    category: 'Supervision & Revenus',
    firestorePath: 'global_config/analytics_summary',
    type: 'DOCUMENT',
    description: 'Agrégats de rétention D1/D7/D30, MRR et complétions de séances',
    mobileMapping: 'lib/core/services/telemetry_service.dart',
    sampleItemCount: 1,
  },

  // 2. Contenu & Entraînement
  {
    id: 'exercises',
    name: 'Exercices & Dojo IA',
    category: 'Contenu & Entraînement',
    firestorePath: 'exercises',
    type: 'COLLECTION',
    description: 'Catalogue complet avec seuils d’angles, TUT, déviation max du tronc et mode vision',
    mobileMapping: 'lib/features/dojo/domain/entities/exercise.dart',
    sampleItemCount: INITIAL_EXERCISES.length,
  },
  {
    id: 'programs',
    name: 'Programmes d’Entraînement',
    category: 'Contenu & Entraînement',
    firestorePath: 'programs',
    type: 'COLLECTION',
    description: 'Cycles progressifs structurés (Fondations, Prise de Masse, Muscle-up, Front Lever)',
    mobileMapping: 'lib/features/workout/domain/entities/workout_program.dart',
    sampleItemCount: INITIAL_PROGRAMS.length,
  },
  {
    id: 'daily_transmission',
    name: 'Transmission du Jour (Vidéo)',
    category: 'Contenu & Entraînement',
    firestorePath: 'global_config/daily_content',
    type: 'DOCUMENT',
    description: 'Vidéo active du jour, question de sondage ou sujet de commentaires',
    mobileMapping: 'lib/features/home/widgets/daily_video_card.dart',
    sampleItemCount: 1,
  },
  {
    id: 'daily_transmissions_archive',
    name: 'Historique des Transmissions',
    category: 'Contenu & Entraînement',
    firestorePath: 'daily_transmissions',
    type: 'COLLECTION',
    description: 'Archives intégrales des vidéos passées avec votes et commentaires des athlètes',
    mobileMapping: 'lib/features/home/services/daily_transmission_service.dart',
    sampleItemCount: INITIAL_TRANSMISSIONS.length,
  },
  {
    id: 'library_books',
    name: 'Bibliothèque de Manuscrits (PDF)',
    category: 'Contenu & Entraînement',
    firestorePath: 'library_books',
    type: 'COLLECTION',
    description: 'Traités de Marc Aurèle, Épictète et manuels techniques de callisthénie',
    mobileMapping: 'lib/features/library/domain/entities/book.dart',
    sampleItemCount: INITIAL_LIBRARY_BOOKS.length,
  },
  {
    id: 'library_audios',
    name: 'Capsules Audio & Focus',
    category: 'Contenu & Entraînement',
    firestorePath: 'library_audios',
    type: 'COLLECTION',
    description: 'Méditations guidées, respirations pré-workout et podcasts stoïciens',
    mobileMapping: 'lib/features/library/domain/entities/audio_lesson.dart',
    sampleItemCount: INITIAL_LIBRARY_AUDIOS.length,
  },
  {
    id: 'arena',
    name: 'L’Arène (Bastions & Boss)',
    category: 'Contenu & Entraînement',
    firestorePath: 'bastions',
    type: 'COLLECTION',
    description: 'Bastions urbains, boss locaux, clans dominants et jauges de déclin temporel',
    mobileMapping: 'lib/features/arena/domain/entities/bastion.dart',
    sampleItemCount: INITIAL_BASTIONS_SPOTS.length,
  },

  // 3. Communauté & Géolocalisation
  {
    id: 'spots',
    name: 'Spots de Street Workout',
    category: 'Communauté & Géolocalisation',
    firestorePath: 'spots',
    type: 'COLLECTION',
    description: 'Parcs de calisthénie géolocalisés (GPS, équipements, photos)',
    mobileMapping: 'lib/features/spots/domain/entities/spot.dart',
    sampleItemCount: INITIAL_SPOTS.length,
  },
  {
    id: 'notifications',
    name: 'Campagnes Push FCM',
    category: 'Communauté & Géolocalisation',
    firestorePath: 'push_campaigns',
    type: 'COLLECTION',
    description: 'Historique des notifications push ciblées envoyées sur Android',
    mobileMapping: 'lib/core/services/firebase_messaging_service.dart',
    sampleItemCount: INITIAL_PUSH_CAMPAIGNS.length,
  },
  {
    id: 'connect_moderation',
    name: 'Signalements & Modération E2EE',
    category: 'Communauté & Géolocalisation',
    firestorePath: 'moderation_reports',
    type: 'COLLECTION',
    description: 'Signalements déposés par les utilisateurs sans compromission du chiffrement E2EE',
    mobileMapping: 'lib/features/connect/domain/entities/report.dart',
    sampleItemCount: INITIAL_USER_REPORTS.length,
  },

  // 4. Système & Technique
  {
    id: 'config',
    name: 'Paramètres Mobile & Remote Config',
    category: 'Système & Technique',
    firestorePath: 'global_config/mobile_app',
    type: 'DOCUMENT',
    description: 'Version minimale obligatoire (v1.0.30), mode maintenance, flags de fonctionnalités',
    mobileMapping: 'lib/core/services/remote_config_service.dart',
    sampleItemCount: 1,
  },
  {
    id: 'telemetry',
    name: 'Audit Android & Télémétrie Live',
    category: 'Système & Technique',
    firestorePath: 'telemetry_logs',
    type: 'COLLECTION',
    description: 'Logs en temps réel des détections ML Kit, erreurs et crash reports',
    mobileMapping: 'lib/core/logging/telemetry_logger.dart',
    sampleItemCount: 15,
  },
];

export interface RubriqueSyncStatus {
  rubriqueId: string;
  status: 'CONNECTED' | 'EMPTY' | 'FALLBACK_LOCAL' | 'LOADING';
  documentCount: number;
  lastSyncedAt: string;
  errorMessage?: string;
}

// -------------------------------------------------------------
// Récupérer le statut de synchronisation de toutes les 16 rubriques
// -------------------------------------------------------------
export async function getRubriquesSyncStatus(): Promise<Record<string, RubriqueSyncStatus>> {
  const result: Record<string, RubriqueSyncStatus> = {};

  for (const rub of FIRESTORE_RUBRIQUES) {
    try {
      if (rub.type === 'COLLECTION') {
        const snap = await getDocs(collection(db, rub.firestorePath));
        result[rub.id] = {
          rubriqueId: rub.id,
          status: snap.empty ? 'EMPTY' : 'CONNECTED',
          documentCount: snap.size,
          lastSyncedAt: new Date().toLocaleTimeString('fr-FR'),
        };
      } else {
        const snap = await getDoc(doc(db, rub.firestorePath));
        result[rub.id] = {
          rubriqueId: rub.id,
          status: snap.exists() ? 'CONNECTED' : 'EMPTY',
          documentCount: snap.exists() ? 1 : 0,
          lastSyncedAt: new Date().toLocaleTimeString('fr-FR'),
        };
      }
    } catch (err: any) {
      result[rub.id] = {
        rubriqueId: rub.id,
        status: 'FALLBACK_LOCAL',
        documentCount: rub.sampleItemCount,
        lastSyncedAt: 'Mode Local Réactif',
        errorMessage: err?.message || 'Connexion locale',
      };
    }
  }

  return result;
}

// -------------------------------------------------------------
// Amorcer les données de référence d'une rubrique dans Firestore
// -------------------------------------------------------------
export async function seedRubrique(rubriqueId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const rub = FIRESTORE_RUBRIQUES.find((r) => r.id === rubriqueId);
    if (!rub) throw new Error('Rubrique introuvable');

    switch (rubriqueId) {
      case 'users': {
        const batch = writeBatch(db);
        for (const user of INITIAL_ATHLETES) {
          batch.set(doc(db, 'users', user.id), user, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_ATHLETES.length };
      }

      case 'exercises': {
        const batch = writeBatch(db);
        for (const ex of INITIAL_EXERCISES) {
          batch.set(doc(db, 'exercises', ex.id), ex, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_EXERCISES.length };
      }

      case 'programs': {
        const batch = writeBatch(db);
        for (const prog of INITIAL_PROGRAMS) {
          batch.set(doc(db, 'programs', prog.id), prog, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_PROGRAMS.length };
      }

      case 'daily_transmission': {
        const activeTrans = INITIAL_TRANSMISSIONS[0];
        await setDoc(doc(db, 'global_config', 'daily_content'), {
          dailyVideoUrl: activeTrans.videoUrl,
          dailyVideoTitle: activeTrans.title,
          dailyVideoDescription: activeTrans.description,
          arc: activeTrans.arc,
          interactionType: activeTrans.interactionType,
          pollQuestion: activeTrans.poll?.question || null,
          pollOptions: activeTrans.poll?.options || null,
          commentPrompt: activeTrans.commentSession?.prompt || null,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        return { success: true, count: 1 };
      }

      case 'daily_transmissions_archive': {
        const batch = writeBatch(db);
        for (const t of INITIAL_TRANSMISSIONS) {
          batch.set(doc(db, 'daily_transmissions', t.id), t, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_TRANSMISSIONS.length };
      }

      case 'library_books': {
        const batch = writeBatch(db);
        for (const b of INITIAL_LIBRARY_BOOKS) {
          batch.set(doc(db, 'library_books', b.id), b, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_LIBRARY_BOOKS.length };
      }

      case 'library_audios': {
        const batch = writeBatch(db);
        for (const a of INITIAL_LIBRARY_AUDIOS) {
          batch.set(doc(db, 'library_audios', a.id), a, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_LIBRARY_AUDIOS.length };
      }

      case 'spots': {
        const batch = writeBatch(db);
        for (const s of INITIAL_SPOTS) {
          batch.set(doc(db, 'spots', s.id), s, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_SPOTS.length };
      }

      case 'arena': {
        const batch = writeBatch(db);
        for (const b of INITIAL_BASTIONS_SPOTS) {
          batch.set(doc(db, 'bastions', b.id), b, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_BASTIONS_SPOTS.length };
      }

      case 'pantheon': {
        const batch = writeBatch(db);
        for (const p of INITIAL_PANTHEON_RECORDS) {
          batch.set(doc(db, 'pantheon_records', p.id), p, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_PANTHEON_RECORDS.length };
      }

      case 'notifications': {
        const batch = writeBatch(db);
        for (const n of INITIAL_PUSH_CAMPAIGNS) {
          batch.set(doc(db, 'push_campaigns', n.id), n, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_PUSH_CAMPAIGNS.length };
      }

      case 'connect_moderation': {
        const batch = writeBatch(db);
        for (const m of INITIAL_USER_REPORTS) {
          batch.set(doc(db, 'moderation_reports', m.id), m, { merge: true });
        }
        await batch.commit();
        return { success: true, count: INITIAL_USER_REPORTS.length };
      }

      case 'config': {
        await setDoc(doc(db, 'global_config', 'mobile_app'), INITIAL_GLOBAL_SETTINGS, { merge: true });
        return { success: true, count: 1 };
      }

      default:
        return { success: true, count: 0 };
    }
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Erreur d’amorçage' };
  }
}

// -------------------------------------------------------------
// Amorcer TOUTES les rubriques d'un coup (Seed All)
// -------------------------------------------------------------
export async function seedAllFirestoreData(): Promise<{ success: boolean; totalUploaded: number; errors: string[] }> {
  let totalUploaded = 0;
  const errors: string[] = [];

  for (const rub of FIRESTORE_RUBRIQUES) {
    const res = await seedRubrique(rub.id);
    if (res.success) {
      totalUploaded += res.count;
    } else if (res.error) {
      errors.push(`${rub.name}: ${res.error}`);
    }
  }

  return {
    success: errors.length === 0,
    totalUploaded,
    errors,
  };
}
