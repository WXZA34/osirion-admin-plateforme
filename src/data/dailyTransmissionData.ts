import { DailyTransmissionVideo } from '../types/dailyTransmission';

export const INITIAL_TRANSMISSIONS: DailyTransmissionVideo[] = [
  // 1. TRANSMISSION ACTIVE D'AUJOURD'HUI (Directement synchronisée sur global_config/daily_content)
  {
    id: 'trans_2026_09_30',
    dateKey: '2026-09-30',
    displayDate: 'Aujourd’hui • 30 Septembre 2026',
    title: 'force',
    description: 'soit fort ',
    videoUrl: 'https://youtu.be/RsBD1POgx-c?is=nVRUHsKb3NuWFMLK',
    thumbnailUrl: 'https://img.youtube.com/vi/RsBD1POgx-c/hqdefault.jpg',
    videoSourceType: 'YOUTUBE',
    arc: 'Winter Arc',
    durationFormatted: '03m 45s',
    status: 'ACTIVE',
    viewsCount: 1420,
    likesCount: 382,
    interactionType: 'BOTH', // L'admin a choisi d'activer à la fois un Sondage ET une session de Commentaires !
    poll: {
      id: 'poll_2026_09_30',
      question: 'Quel est votre principal point de blocage sur le Front Lever ?',
      totalVotes: 348,
      allowMultipleChoices: false,
      isClosed: false,
      options: [
        {
          id: 'opt_1',
          text: 'Force de rétraction scapulaire (omoplates)',
          votesCount: 162,
          voters: [
            { userId: 'usr_849204', pseudo: 'max_frontlever', votedAt: 'Il y a 2h' },
            { userId: 'usr_849201', pseudo: 'thomas_calisthenics', votedAt: 'Il y a 3h' },
          ],
        },
        {
          id: 'opt_2',
          text: 'Gainage abdominal & bascule du bassin (anti-cambrure)',
          votesCount: 94,
          voters: [
            { userId: 'usr_849202', pseudo: 'sarah_fit_pullups', votedAt: 'Il y a 1h' },
          ],
        },
        {
          id: 'opt_3',
          text: 'Tension des avant-bras & poigne (grip)',
          votesCount: 52,
          voters: [],
        },
        {
          id: 'opt_4',
          text: 'Aucun blocage : je tiens déjà 5s en full !',
          votesCount: 40,
          voters: [
            { userId: 'usr_849203', pseudo: 'lucas_street_workout', votedAt: 'Il y a 30m' },
          ],
        },
      ],
    },
    commentSession: {
      id: 'comments_2026_09_30',
      prompt:
        'Partagez vos sensations après le protocole de renforcement scapulaire ci-dessus ! Les coachs répondent directement.',
      isOpen: true,
      totalComments: 5,
      comments: [
        {
          id: 'comm_01',
          athleteId: 'usr_849204',
          athletePseudo: 'max_frontlever',
          athleteAvatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          athleteClan: 'Ronin Calisthenics Paris',
          athleteLevel: 'Légende Alpha',
          content:
            'Le tip sur l’abaissement actif des trapèzes avant d’engager le tirage change tout ! J’ai réussi à caler 7 secondes de hold propre sans fléchir les coudes.',
          createdAt: 'Il y a 1h30',
          likesCount: 14,
          isPinned: true,
          status: 'VISIBLE',
          adminReply: {
            id: 'rep_01',
            authorName: 'Roland (Fondateur Osirion)',
            authorRole: 'Fondateur Osirion',
            content:
              'Bravo Max, c’est exactement ça. Continue avec cette rigidité mécanique, c’est ce qui protège aussi les tendons bicipitaux à long terme !',
            repliedAt: 'Il y a 45 min',
          },
        },
        {
          id: 'comm_02',
          athleteId: 'usr_849202',
          athletePseudo: 'sarah_fit_pullups',
          athleteAvatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          athleteClan: 'Vanguard Calisthenics Lyon',
          athleteLevel: 'Guerrier III',
          content:
            'Est-ce qu’on peut remplacer les élastiques de décharge par des répétitions négatives lentes (eccentriques de 5s) si on n’a pas de bande au parc ?',
          createdAt: 'Il y a 55 min',
          likesCount: 6,
          isPinned: false,
          status: 'VISIBLE',
          // L'admin n'a pas encore répondu à ce commentaire, il pourra y répondre immédiatement depuis la console !
        },
        {
          id: 'comm_03',
          athleteId: 'usr_849203',
          athletePseudo: 'lucas_street_workout',
          athleteAvatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          athleteClan: 'Spartiates du Prado',
          athleteLevel: 'Légende Alpha',
          content:
            'Vidéo ultra limpide. Pour ceux qui ont mal aux coudes, insistez bien sur les supinations en échauffement comme mentionné à 03:15.',
          createdAt: 'Il y a 25 min',
          likesCount: 8,
          isPinned: false,
          status: 'VISIBLE',
        },
      ],
    },
    publishedAt: '2026-09-30T06:00:00Z',
    publishedBy: 'Roland Kokou (Superadmin)',
    isSyncedToFirestore: true,
  },

  // 2. TRANSMISSION D'HIER (ARCHIVÉE) - AVEC SONDAGE UNIQUEMENT
  {
    id: 'trans_2026_09_29',
    dateKey: '2026-09-29',
    displayDate: 'Hier • 29 Septembre 2026',
    title: 'Discipline de Fer : Le Protocole des 100 Pompes au Réveil',
    description:
      'Comment ancrer la routine matinale stoïcienne sans négociation avec son esprit. Analyse de la charge cardiovasculaire et nerveuse.',
    videoUrl:
      'https://firebasestorage.googleapis.com/v0/b/valerion-55414.firebasestorage.app/o/daily_videos%2Fdiscipline_pompes.mp4?alt=media',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
    videoSourceType: 'FIREBASE_MP4',
    arc: 'Winter Arc',
    durationFormatted: '04m 12s',
    status: 'ARCHIVED',
    viewsCount: 2890,
    likesCount: 620,
    interactionType: 'POLL', // Uniquement sondage pour cette vidéo !
    poll: {
      id: 'poll_2026_09_29',
      question: 'Avez-vous complété vos 100 pompes matinales aujourd’hui ?',
      totalVotes: 890,
      allowMultipleChoices: false,
      isClosed: true,
      options: [
        {
          id: 'opt_1',
          text: 'Oui, d’une traite (1 seule série max)',
          votesCount: 245,
        },
        {
          id: 'opt_2',
          text: 'Oui, fractionné en 4x25 ou 5x20',
          votesCount: 480,
        },
        {
          id: 'opt_3',
          text: 'Non, jour de repos programmé',
          votesCount: 115,
        },
        {
          id: 'opt_4',
          text: 'Échoué, je me rattrape ce soir !',
          votesCount: 50,
        },
      ],
    },
    publishedAt: '2026-09-29T06:00:00Z',
    publishedBy: 'Roland Kokou (Superadmin)',
    isSyncedToFirestore: false,
  },

  // 3. TRANSMISSION DU 28 SEPTEMBRE (ARCHIVÉE) - AVEC SESSION COMMENTAIRES SEULEMENT
  {
    id: 'trans_2026_09_28',
    dateKey: '2026-09-28',
    displayDate: '28 Septembre 2026',
    title: 'Stratégie Colisée : Comment Déjouer le Tug-of-War en 1v1',
    description:
      'Gestion de l’effort lactique dans les duels synchronisés. Pourquoi partir à 100% de vitesse est souvent une erreur fatale.',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    videoSourceType: 'YOUTUBE',
    arc: 'Royal Arc',
    durationFormatted: '08m 10s',
    status: 'ARCHIVED',
    viewsCount: 3410,
    likesCount: 780,
    interactionType: 'COMMENTS', // Uniquement session de commentaires
    commentSession: {
      id: 'comments_2026_09_28',
      prompt:
        'Avez-vous déjà testé la tactique du faux rythme en duel ? Débattez de vos techniques de combat ci-dessous.',
      isOpen: false,
      totalComments: 4,
      comments: [
        {
          id: 'comm_hist_01',
          athleteId: 'usr_849201',
          athletePseudo: 'thomas_calisthenics',
          athleteAvatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          athleteClan: 'Ronin Calisthenics Paris',
          athleteLevel: 'Vétéran',
          content:
            'Exactement ce qui m’est arrivé contre Lucas hier sur les pompes : j’ai explosé après 30 reps alors qu’il maintenait 1 rep toutes les 1.5s régulières.',
          createdAt: '28 Septembre à 14h',
          likesCount: 19,
          status: 'VISIBLE',
          adminReply: {
            id: 'rep_hist_01',
            authorName: 'Roland (Fondateur Osirion)',
            authorRole: 'Fondateur Osirion',
            content:
              'Le pacing est la clé universelle du Colisée. En gardant 10% sous ton seuil lactique, tu absorbes les à-coups sans que l’acide te tétanise.',
            repliedAt: '28 Septembre à 16h',
          },
        },
        {
          id: 'comm_hist_02',
          athleteId: 'usr_849205',
          athletePseudo: 'camille_athletic',
          athleteClan: 'Sans Clan',
          athleteLevel: 'Novice',
          content:
            'Est-ce que la détection de pose IA pénalise si on ne verrouille pas les coudes en haut ?',
          createdAt: '28 Septembre à 18h',
          likesCount: 11,
          status: 'VISIBLE',
          adminReply: {
            id: 'rep_hist_02',
            authorName: 'Coach IA Osirion',
            authorRole: 'Coach Principal',
            content:
              'Oui ! L’angle du coude doit atteindre au moins 165° pour valider la répétition. Zéro demi-mouvement toléré dans l’Arène.',
            repliedAt: '28 Septembre à 18h30',
          },
        },
      ],
    },
    publishedAt: '2026-09-28T06:00:00Z',
    publishedBy: 'Roland Kokou (Superadmin)',
    isSyncedToFirestore: false,
  },

  // 4. TRANSMISSION DU 25 SEPTEMBRE (ARCHIVÉE) - VIDÉO SEULE
  {
    id: 'trans_2026_09_25',
    dateKey: '2026-09-25',
    displayDate: '25 Septembre 2026',
    title: 'Nutrition Anabolique : Le Régime Stoïcien Sans Compléments Chimiques',
    description:
      'Aliments denses en nutriments, minéraux essentiels pour les tendons et récupération nocturne.',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    videoSourceType: 'YOUTUBE',
    arc: 'Summer Body',
    durationFormatted: '11m 40s',
    status: 'ARCHIVED',
    viewsCount: 4120,
    likesCount: 910,
    interactionType: 'NONE',
    publishedAt: '2026-09-25T06:00:00Z',
    publishedBy: 'Roland Kokou (Superadmin)',
    isSyncedToFirestore: false,
  },
];
