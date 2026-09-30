import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { AthleteUser } from '../types/admin';
import {
  DailyTransmissionVideo,
  TransmissionInteractionType,
  VideoSourceType,
  TransmissionArc,
  TransmissionComment,
  PollOption,
} from '../types/dailyTransmission';
import { INITIAL_TRANSMISSIONS } from '../data/dailyTransmissionData';
import { parseVideoUrl } from '../utils/videoUtils';
import { IntegratedVideoModal } from './IntegratedVideoModal';
import { FirestoreRulesGuideModal } from './FirestoreRulesGuideModal';
import {
  Radio,
  Play,
  Pause,
  Plus,
  Trash2,
  Search,
  Eye,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  MessageSquare,
  BarChart3,
  Send,
  Pin,
  Flame,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Calendar,
  Share2,
  TrendingUp,
  Vote,
  ThumbsUp,
  CornerDownRight,
  History,
  Smartphone,
  Tv,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  UploadCloud,
  Upload,
  Link,
  FileVideo,
  Database,
  Film,
  Sliders,
} from 'lucide-react';

interface DailyTransmissionManagerProps {
  athletes: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateAthlete?: (updated: AthleteUser) => void;
  onSendPushNotification?: (title: string, body: string) => void;
}

export const DailyTransmissionManager: React.FC<DailyTransmissionManagerProps> = ({
  athletes,
  userRole = 'superadmin',
  onUpdateAthlete,
  onSendPushNotification,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'analytics'>('current');

  // Datasets
  const [transmissions, setTransmissions] = useState<DailyTransmissionVideo[]>(INITIAL_TRANSMISSIONS);

  // Active video
  const activeTransmission = transmissions.find((t) => t.status === 'ACTIVE') || transmissions[0];

  // In-site Video Player States (la vidéo ne se lance que si l'utilisateur appuie sur play)
  const [isInlinePlaying, setIsInlinePlaying] = useState<boolean>(false);
  const [isMobilePlaying, setIsMobilePlaying] = useState<boolean>(false);
  const [fullscreenVideo, setFullscreenVideo] = useState<DailyTransmissionVideo | null>(null);

  // Direct In-Place Editor for global_config/daily_content
  const [editTitle, setEditTitle] = useState<string>(activeTransmission.title || 'force');
  const [editDescription, setEditDescription] = useState<string>(activeTransmission.description || 'soit fort ');
  const [editUrl, setEditUrl] = useState<string>(activeTransmission.videoUrl || 'https://youtu.be/RsBD1POgx-c?is=nVRUHsKb3NuWFMLK');
  const [activeEditMethod, setActiveEditMethod] = useState<'link' | 'upload'>('link');
  const [isSavingToFirestore, setIsSavingToFirestore] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Firestore Security & Permission Diagnostics
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'connected' | 'permission_denied'>('unknown');
  const [showRulesGuideModal, setShowRulesGuideModal] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Inspect past transmission from history
  const [inspectedTransmissionId, setInspectedTransmissionId] = useState<string>(activeTransmission.id);
  const currentViewedTransmission =
    transmissions.find((t) => t.id === inspectedTransmissionId) || activeTransmission;

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyArcFilter, setHistoryArcFilter] = useState<string>('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('ALL');

  // Comment filter (All vs Needs Admin Reply)
  const [commentFilter, setCommentFilter] = useState<'ALL' | 'UNREPLIED' | 'PINNED'>('ALL');

  // Reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronisation temps réel avec Firestore (valerion-55414)
  useEffect(() => {
    let unsubTransmissions: (() => void) | undefined;
    let unsubGlobalConfig: (() => void) | undefined;

    // Check localStorage fallback
    try {
      const cached = localStorage.getItem('osirion_daily_content');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.dailyVideoTitle) setEditTitle(parsed.dailyVideoTitle);
        if (parsed.dailyVideoDescription) setEditDescription(parsed.dailyVideoDescription);
        if (parsed.dailyVideoUrl) setEditUrl(parsed.dailyVideoUrl);
      }
    } catch {}

    try {
      // 1. Écouter la collection 'daily_transmissions'
      unsubTransmissions = onSnapshot(
        collection(db, 'daily_transmissions'),
        (snapshot) => {
          if (!snapshot.empty) {
            const loaded: DailyTransmissionVideo[] = [];
            snapshot.forEach((d) => {
              loaded.push(d.data() as DailyTransmissionVideo);
            });
            // Trier par date décroissante
            loaded.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            setTransmissions(loaded);
          }
        },
        (_err) => {
          // Mode hors-ligne pris en charge
        }
      );

      // 2. Écouter 'global_config/daily_content' pour l'état en direct
      unsubGlobalConfig = onSnapshot(
        doc(db, 'global_config', 'daily_content'),
        (docSnap) => {
          setFirestoreStatus('connected');
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && (data.dailyVideoTitle || data.dailyVideoUrl)) {
              const liveTitle = data.dailyVideoTitle || 'force';
              const liveDesc = data.dailyVideoDescription || 'soit fort ';
              const liveUrl = data.dailyVideoUrl || 'https://youtu.be/RsBD1POgx-c?is=nVRUHsKb3NuWFMLK';

              setEditTitle(liveTitle);
              setEditDescription(liveDesc);
              setEditUrl(liveUrl);

              setTransmissions((prev) =>
                prev.map((t) => {
                  if (t.status === 'ACTIVE') {
                    return {
                      ...t,
                      title: liveTitle,
                      description: liveDesc,
                      videoUrl: liveUrl,
                      thumbnailUrl: parseVideoUrl(liveUrl).thumbnailUrl || t.thumbnailUrl,
                      isSyncedToFirestore: true,
                    };
                  }
                  return t;
                })
              );
            }
          }
        },
        (err: any) => {
          if (err?.code === 'permission-denied' || err?.message?.toLowerCase().includes('permission')) {
            setFirestoreStatus('permission_denied');
          }
        }
      );
    } catch (e) {
      console.warn('Firebase initialization notice:', e);
    }

    return () => {
      unsubTransmissions?.();
      unsubGlobalConfig?.();
    };
  }, []);

  // =========================================================================
  // GESTIONNAIRE DE SAUVEGARDE DIRECTE SUR global_config/daily_content
  // =========================================================================
  const handleSaveDailyContent = async () => {
    if (!editTitle.trim() || !editUrl.trim()) {
      showToast('Veuillez renseigner au moins le titre et l’URL de la vidéo.');
      return;
    }

    setIsSavingToFirestore(true);

    const videoConfig = parseVideoUrl(editUrl.trim());
    const derivedThumbnail =
      videoConfig.thumbnailUrl ||
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80';

    // 1. Mettre à jour l'état local immédiatement pour un retour instantané
    const updatedActive: DailyTransmissionVideo = {
      ...activeTransmission,
      title: editTitle.trim(),
      description: editDescription.trim() || 'soit fort ',
      videoUrl: editUrl.trim(),
      thumbnailUrl: derivedThumbnail,
      videoSourceType: videoConfig.type === 'youtube' ? 'YOUTUBE' : 'FIREBASE_MP4',
      isSyncedToFirestore: true,
    };

    setTransmissions((prev) =>
      prev.map((t) => (t.id === activeTransmission.id ? updatedActive : t))
    );

    // 2. Sauvegarde dans localStorage pour persistance immédiate garantie
    try {
      localStorage.setItem(
        'osirion_daily_content',
        JSON.stringify({
          dailyVideoTitle: editTitle.trim(),
          dailyVideoDescription: editDescription.trim(),
          dailyVideoUrl: editUrl.trim(),
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}

    // 3. Écriture directe dans Cloud Firestore : global_config/daily_content
    try {
      await setDoc(
        doc(db, 'global_config', 'daily_content'),
        {
          dailyVideoTitle: editTitle.trim(),
          dailyVideoDescription: editDescription.trim(),
          dailyVideoUrl: editUrl.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setFirestoreStatus('connected');
      showToast('✅ Vidéo du jour synchronisée dans Firestore (global_config/daily_content) !');
    } catch (err: any) {
      console.warn('Firestore write notice:', err);
      if (err?.code === 'permission-denied' || err?.message?.toLowerCase().includes('permission')) {
        setFirestoreStatus('permission_denied');
        setShowRulesGuideModal(true);
        showToast('⚠️ Erreur Firebase : Écriture refusée par vos Règles Firestore (permission-denied).');
      } else {
        showToast(`⚠️ Erreur d'enregistrement Firebase : ${err?.message || 'Erreur inconnue'}`);
      }
    } finally {
      setIsSavingToFirestore(false);
      setIsInlinePlaying(false);
    }
  };

  const handleTestFirestoreConnection = async () => {
    setIsTestingConnection(true);
    try {
      await setDoc(
        doc(db, 'global_config', 'daily_content'),
        {
          dailyVideoTitle: editTitle.trim(),
          dailyVideoDescription: editDescription.trim(),
          dailyVideoUrl: editUrl.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setFirestoreStatus('connected');
      setShowRulesGuideModal(false);
      showToast('🎉 Succès ! Écriture réussie dans global_config/daily_content.');
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.toLowerCase().includes('permission')) {
        setFirestoreStatus('permission_denied');
        showToast('❌ Écriture toujours refusée : collez la règle et cliquez sur Publier dans Firebase.');
      } else {
        showToast(`❌ Erreur : ${err?.message || 'Erreur inconnue'}`);
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('Format non supporté. Veuillez sélectionner un fichier vidéo (MP4, WebM, MOV, etc.).');
      return;
    }

    setIsUploadingFile(true);
    try {
      const localBlobUrl = URL.createObjectURL(file);
      setEditUrl(localBlobUrl);
      setUploadedFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} Mo)`);

      if (!editTitle || editTitle === 'force') {
        setEditTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }

      showToast(`Fichier « ${file.name} » chargé ! Cliquez sur Enregistrer pour l’activer.`);
    } catch {
      showToast('Erreur lors du chargement du fichier vidéo local.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleReloadFromFirestore = async () => {
    try {
      const snap = await doc(db, 'global_config', 'daily_content');
      showToast('Actualisation du flux Firestore demandée...');
    } catch {
      showToast('Flux local actif.');
    }
  };

  // ==========================================
  // MODAL : NOUVELLE TRANSMISSION DU JOUR
  // ==========================================
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newSourceType, setNewSourceType] = useState<VideoSourceType>('YOUTUBE');
  const [newArc, setNewArc] = useState<TransmissionArc>('Winter Arc');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newDurationFormatted, setNewDurationFormatted] = useState('05m 30s');

  // INTERACTION CHOICE : SONDAGE vs COMMENTAIRES vs LES DEUX vs AUCUN
  const [newInteractionType, setNewInteractionType] = useState<TransmissionInteractionType>('POLL');

  // Poll Form Details
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>([
    'Oui, validé avec succès !',
    'Partiellement réussi',
    'Échoué pour aujourd’hui',
  ]);

  // Comment Session Details
  const [newCommentPrompt, setNewCommentPrompt] = useState(
    'Partagez vos sensations sur la séance du jour ! Vos retours et questions sont lus par l’équipe.'
  );

  // Push notification toggle
  const [notifyAthletes, setNotifyAthletes] = useState(true);

  // Handlers for Poll Options
  const handleAddPollOption = () => {
    if (newPollOptions.length < 5) {
      setNewPollOptions([...newPollOptions, `Option ${newPollOptions.length + 1}`]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    const updated = [...newPollOptions];
    updated[index] = val;
    setNewPollOptions(updated);
  };

  // Submit New Daily Video
  const handlePublishDailyTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVideoUrl.trim()) {
      showToast('Veuillez remplir le titre et l’URL de la vidéo.');
      return;
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const todayFormatted = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newTransId = `trans_${Date.now()}`;

    // 1. Archiver l'ancienne vidéo active
    const updatedTransmissions = transmissions.map((t) => {
      if (t.status === 'ACTIVE') {
        return {
          ...t,
          status: 'ARCHIVED' as const,
          poll: t.poll ? { ...t.poll, isClosed: true } : undefined,
          commentSession: t.commentSession ? { ...t.commentSession, isOpen: false } : undefined,
        };
      }
      return t;
    });

    // 2. Construire la nouvelle vidéo
    const newTrans: DailyTransmissionVideo = {
      id: newTransId,
      dateKey: todayIso,
      displayDate: `Aujourd’hui • ${todayFormatted}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Transmission officielle du jour pour tous les athlètes Osirion.',
      videoUrl: newVideoUrl.trim(),
      thumbnailUrl:
        newThumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      videoSourceType: newSourceType,
      arc: newArc,
      durationFormatted: newDurationFormatted.trim() || '05m 00s',
      status: 'ACTIVE',
      viewsCount: 0,
      likesCount: 0,
      interactionType: newInteractionType,
      poll:
        newInteractionType === 'POLL' || newInteractionType === 'BOTH'
          ? {
              id: `poll_${Date.now()}`,
              question: newPollQuestion.trim() || 'Quel est votre avis sur la transmission du jour ?',
              totalVotes: 0,
              allowMultipleChoices: false,
              isClosed: false,
              options: newPollOptions
                .filter((opt) => opt.trim().length > 0)
                .map((opt, idx) => ({
                  id: `opt_${idx + 1}`,
                  text: opt.trim(),
                  votesCount: 0,
                  voters: [],
                })),
            }
          : undefined,
      commentSession:
        newInteractionType === 'COMMENTS' || newInteractionType === 'BOTH'
          ? {
              id: `comments_${Date.now()}`,
              prompt: newCommentPrompt.trim() || 'Laissez votre avis ci-dessous.',
              isOpen: true,
              totalComments: 0,
              comments: [],
            }
          : undefined,
      publishedAt: new Date().toISOString(),
      publishedBy: 'Roland Kokou (Superadmin)',
      isSyncedToFirestore: true,
    };

    setTransmissions([newTrans, ...updatedTransmissions]);
    setInspectedTransmissionId(newTransId);
    setEditTitle(newTrans.title);
    setEditDescription(newTrans.description);
    setEditUrl(newTrans.videoUrl);
    setIsInlinePlaying(false);
    setShowPublishModal(false);
    resetPublishForm();

    // Synchronisation automatique dans Firestore (global_config/daily_content et collection daily_transmissions)
    try {
      setDoc(doc(db, 'global_config', 'daily_content'), {
        dailyVideoUrl: newTrans.videoUrl,
        dailyVideoTitle: newTrans.title,
        dailyVideoDescription: newTrans.description,
        arc: newTrans.arc,
        interactionType: newTrans.interactionType,
        pollQuestion: newTrans.poll?.question || null,
        pollOptions: newTrans.poll?.options || null,
        commentPrompt: newTrans.commentSession?.prompt || null,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});

      setDoc(doc(db, 'daily_transmissions', newTrans.id), newTrans).catch(() => {});
    } catch {
      // Mode hors-ligne pris en charge
    }

    showToast(`Transmission du jour « ${newTrans.title} » publiée ! L'ancienne vidéo a été archivée avec son historique.`);

    // Push notification trigger
    if (notifyAthletes && onSendPushNotification) {
      const interactionText =
        newInteractionType === 'POLL'
          ? 'Donnez votre voix au sondage du jour !'
          : newInteractionType === 'COMMENTS'
          ? 'Posez vos questions et commentez la séance !'
          : newInteractionType === 'BOTH'
          ? 'Participez au sondage et à la session de débat !'
          : 'Regardez dès maintenant la vidéo du jour.';

      onSendPushNotification(
        `⚡ Transmission du Jour : ${newTrans.title}`,
        `${interactionText} Disponible sur votre écran d’accueil Osirion.`
      );
    }
  };

  const resetPublishForm = () => {
    setModalStep(1);
    setNewTitle('');
    setNewDescription('');
    setNewVideoUrl('');
    setNewSourceType('YOUTUBE');
    setNewArc('Winter Arc');
    setNewThumbnailUrl('');
    setNewDurationFormatted('05m 30s');
    setNewInteractionType('POLL');
    setNewPollQuestion('');
    setNewPollOptions([
      'Oui, validé avec succès !',
      'Partiellement réussi',
      'Échoué pour aujourd’hui',
    ]);
    setNewCommentPrompt('Partagez vos sensations sur la séance du jour ! Vos retours sont lus par l’équipe.');
  };

  // ==========================================
  // COMMENT ACTIONS (REPLY, PIN, DELETE)
  // ==========================================
  const handleSendAdminReply = (commentId: string) => {
    if (!replyText.trim()) return;

    setTransmissions((prev) =>
      prev.map((t) => {
        if (t.id === currentViewedTransmission.id && t.commentSession) {
          const updatedComments = t.commentSession.comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                adminReply: {
                  id: `reply_${Date.now()}`,
                  authorName: 'Roland (Fondateur Osirion)',
                  authorRole: 'Fondateur Osirion',
                  content: replyText.trim(),
                  repliedAt: 'À l’instant',
                },
              };
            }
            return c;
          });
          return {
            ...t,
            commentSession: {
              ...t.commentSession,
              comments: updatedComments,
            },
          };
        }
        return t;
      })
    );

    // Synchronisation Firestore de la réponse
    try {
      setDoc(doc(db, 'daily_transmissions', currentViewedTransmission.id), {
        commentSession: {
          ...currentViewedTransmission.commentSession,
          comments: (currentViewedTransmission.commentSession?.comments || []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  adminReply: {
                    id: `reply_${Date.now()}`,
                    authorName: 'Roland (Fondateur Osirion)',
                    authorRole: 'Fondateur Osirion',
                    content: replyText.trim(),
                    repliedAt: 'À l’instant',
                  },
                }
              : c
          ),
        },
      }, { merge: true }).catch(() => {});
    } catch {
      // Mode hors-ligne pris en charge
    }

    setReplyingToCommentId(null);
    setReplyText('');
    showToast('Votre réponse officielle a été transmise à l’athlète !');
  };

  const handleTogglePinComment = (commentId: string) => {
    setTransmissions((prev) =>
      prev.map((t) => {
        if (t.id === currentViewedTransmission.id && t.commentSession) {
          const updatedComments = t.commentSession.comments.map((c) => {
            if (c.id === commentId) {
              return { ...c, isPinned: !c.isPinned };
            }
            return c;
          });
          return {
            ...t,
            commentSession: {
              ...t.commentSession,
              comments: updatedComments,
            },
          };
        }
        return t;
      })
    );
    showToast('Commentaire épinglé en haut du fil d’actualité mobile.');
  };

  const handleDeleteComment = (commentId: string) => {
    setTransmissions((prev) =>
      prev.map((t) => {
        if (t.id === currentViewedTransmission.id && t.commentSession) {
          const updatedComments = t.commentSession.comments.filter((c) => c.id !== commentId);
          return {
            ...t,
            commentSession: {
              ...t.commentSession,
              totalComments: Math.max(0, t.commentSession.totalComments - 1),
              comments: updatedComments,
            },
          };
        }
        return t;
      })
    );
    showToast('Commentaire retiré.');
  };

  // Simulate user voting in mobile view (for demo)
  const handleSimulateVote = (optionId: string) => {
    setTransmissions((prev) =>
      prev.map((t) => {
        if (t.id === currentViewedTransmission.id && t.poll) {
          const updatedOptions = t.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                votesCount: opt.votesCount + 1,
              };
            }
            return opt;
          });
          return {
            ...t,
            poll: {
              ...t.poll,
              totalVotes: t.poll.totalVotes + 1,
              userVotedOptionId: optionId,
              options: updatedOptions,
            },
          };
        }
        return t;
      })
    );
    showToast('Vote enregistré dans le simulateur !');
  };

  // Filtered comments for current viewed transmission
  const currentComments = currentViewedTransmission.commentSession?.comments || [];
  const filteredComments = currentComments.filter((c) => {
    if (commentFilter === 'UNREPLIED') return !c.adminReply;
    if (commentFilter === 'PINNED') return c.isPinned;
    return true;
  });

  // Filtered history list
  const filteredHistory = transmissions.filter((t) => {
    const q = (historySearch || '').toLowerCase();
    const matchesSearch =
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.displayDate || '').toLowerCase().includes(q);
    const matchesArc = historyArcFilter === 'ALL' || t.arc === historyArcFilter;
    const matchesType = historyTypeFilter === 'ALL' || t.interactionType === historyTypeFilter;
    return matchesSearch && matchesArc && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 1. GRAND BANDEAU DE PILOTAGE DE LA TRANSMISSION DU JOUR */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>TRANSMISSION DU JOUR & ENGAGEMENT ATHLÈTES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Gestion des Vidéos du Jour</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-600 text-white">
                Direct Synchro Firestore
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Publiez quotidiennement la vidéo motrice de l’application. Choisissez pour chaque parution d'activer un <strong>Sondage d’opinion</strong> ou une <strong>Session de Commentaires</strong> pour recueillir l'avis des athlètes. Chaque publication archive automatiquement la précédente tout en préservant l'historique complet pour y répondre.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Mode Actif</span>
              <span className="text-xs font-black text-amber-400 font-mono mt-1 block">
                {activeTransmission.interactionType === 'POLL' && '📊 SONDAGE'}
                {activeTransmission.interactionType === 'COMMENTS' && '💬 DÉBAT'}
                {activeTransmission.interactionType === 'BOTH' && '✨ SONDAGE + DÉBAT'}
                {activeTransmission.interactionType === 'NONE' && '🎥 VIDÉO SEULE'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Vues Actuelles</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                {activeTransmission.viewsCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Votes</span>
              <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">
                {activeTransmission.poll?.totalVotes || 0}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Avis Postés</span>
              <span className="text-xl font-black text-rose-400 font-mono mt-0.5 block">
                {activeTransmission.commentSession?.totalComments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ONGLETS DE NAVIGATION & BOUTON D'ACTION PRINCIPALE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setActiveTab('current');
              setInspectedTransmissionId(activeTransmission.id);
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'current'
                ? 'bg-amber-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>1. Transmission en Direct (Aujourd'hui)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'history'
                ? 'bg-amber-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>2. Historique & Archives ({transmissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'analytics'
                ? 'bg-amber-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Synthèse des Avis Communautaires</span>
          </button>
        </div>

        {/* Action Button: Mettre en ligne la vidéo du jour */}
        {userRole === 'superadmin' && (
          <button
            onClick={() => {
              resetPublishForm();
              setShowPublishModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Mettre en Ligne la Vidéo du Jour</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 : TRANSMISSION DU JOUR EN DIRECT */}
      {/* ========================================================================= */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Active Broadcast Details & Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Colonne Gauche (7 cols) : Lecteur Vidéo & Infos Métier */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                {/* Header Video */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      EN LIGNE SUR L'APP
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {currentViewedTransmission.displayDate}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    Arc : {currentViewedTransmission.arc}
                  </span>
                </div>

                {/* 1. LECTEUR VIDÉO INTÉGRÉ AU SITE */}
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-xl border border-slate-800">
                    {isInlinePlaying ? (
                      (() => {
                        const cfg = parseVideoUrl(currentViewedTransmission.videoUrl, true);
                        if (cfg.type === 'youtube' || cfg.type === 'vimeo') {
                          return (
                            <iframe
                              src={cfg.embedUrl}
                              title={currentViewedTransmission.title}
                              className="w-full h-full border-0 aspect-video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          );
                        }
                        return (
                          <video
                            src={cfg.embedUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                          >
                            Votre navigateur ne supporte pas la lecture directe de cette vidéo.
                          </video>
                        );
                      })()
                    ) : (
                      <div className="relative w-full h-full group">
                        <img
                          src={currentViewedTransmission.thumbnailUrl}
                          alt={currentViewedTransmission.title}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-4">
                          <div className="flex items-center justify-between text-xs text-white">
                            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs font-mono">
                              Source : {currentViewedTransmission.videoSourceType}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs font-mono">
                              {currentViewedTransmission.durationFormatted}
                            </span>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setIsInlinePlaying(true)}
                              className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl transition transform hover:scale-110 cursor-pointer ring-4 ring-amber-500/20 hover:ring-amber-500/40"
                              title="Appuyez sur Play pour lancer la vidéo"
                            >
                              <Play className="w-8 h-8 fill-slate-950 ml-1" />
                            </button>
                            <span className="text-xs font-bold text-white bg-black/75 px-3.5 py-1.5 rounded-full backdrop-blur-xs border border-white/10 shadow-lg">
                              Appuyez sur Play pour lancer la vidéo
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span>Publié par {currentViewedTransmission.publishedBy}</span>
                            <span className="font-mono">{currentViewedTransmission.viewsCount} vues réelles</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Quick Controls Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {isInlinePlaying ? (
                        <button
                          type="button"
                          onClick={() => setIsInlinePlaying(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          title="Arrêter la vidéo et revenir à la miniature"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Arrêter la Vidéo</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsInlinePlaying(true)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
                          title="Lancer la vidéo"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Lancer la Vidéo (Play)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setFullscreenVideo(currentViewedTransmission)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        title="Visionner en mode cinéma dans le site"
                      >
                        <Tv className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mode Cinéma / Grand Écran</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      {isInlinePlaying ? 'Lecture en cours' : 'En attente de clic sur Play'}
                    </span>
                  </div>
                </div>

                {/* Titre & Description */}
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-snug">
                    {currentViewedTransmission.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {currentViewedTransmission.description}
                  </p>
                </div>

                {/* Synchro Firestore Tag */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition ${
                  firestoreStatus === 'permission_denied'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {firestoreStatus === 'permission_denied' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-medium truncate">
                      {firestoreStatus === 'permission_denied'
                        ? 'Base de données : Écriture bloquée par les Règles Firestore (permission-denied)'
                        : 'Connecté à global_config/daily_content (valerion-55414)'}
                    </span>
                  </div>

                  {firestoreStatus === 'permission_denied' ? (
                    <button
                      type="button"
                      onClick={() => setShowRulesGuideModal(true)}
                      className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 transition cursor-pointer"
                    >
                      Débloquer Firebase (10s)
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold shrink-0">
                      Temps Réel Actif
                    </span>
                  )}
                </div>
              </div>

              {/* 2. PANNEAU DE MODIFICATION DIRECTE DE LA VIDÉO DU JOUR (global_config/daily_content) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-amber-500/30 p-6 text-white space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white">
                          Changer la Vidéo du Jour
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          global_config / daily_content
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mettez un lien ou téléversez une vidéo pour mettre à jour l'application mobile en direct.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRulesGuideModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 border border-amber-500/30 transition cursor-pointer"
                      title="Vérifier les règles Firestore"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Règles Firestore</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestFirestoreConnection}
                      disabled={isTestingConnection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 transition cursor-pointer disabled:opacity-50"
                      title="Tester la connexion Firestore maintenant"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                      <span>{isTestingConnection ? 'Test...' : 'Recharger'}</span>
                    </button>
                  </div>
                </div>

                {/* Mode Selector : Lien vs Téléversement */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveEditMethod('link')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      activeEditMethod === 'link'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>1. Par Lien Vidéo (YouTube / MP4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveEditMethod('upload')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                      activeEditMethod === 'upload'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>2. Téléverser un Fichier Vidéo</span>
                  </button>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  {/* Titre (dailyVideoTitle) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Titre de la Transmission (dailyVideoTitle)</span>
                      <span className="text-[10px] text-amber-400 font-mono">Requis</span>
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Ex: force"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-amber-400 transition"
                    />
                  </div>

                  {/* Description (dailyVideoDescription) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                      <span>Description (dailyVideoDescription)</span>
                      <span className="text-[10px] text-slate-400 font-mono">Affiché sous la vidéo</span>
                    </label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Ex: soit fort "
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400 transition resize-none"
                    />
                  </div>

                  {/* Method 1: Par Lien URL */}
                  {activeEditMethod === 'link' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                        <span>URL de la Vidéo (dailyVideoUrl)</span>
                        <span className="text-[10px] text-amber-400 font-mono">YouTube ou MP4</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="https://youtu.be/RsBD1POgx-c ou https://www.youtube.com/watch?v=..."
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-hidden focus:border-amber-400 transition"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              if (text) setEditUrl(text);
                            } catch {
                              showToast('Impossible de lire le presse-papier.');
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition"
                          title="Coller depuis le presse-papier"
                        >
                          Coller
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Formats supportés : <code>youtu.be/...</code>, <code>youtube.com/watch?v=...</code>, <code>youtube.com/shorts/...</code>, Vimeo ou liens directs <code>.mp4</code>.
                      </p>
                    </div>
                  ) : (
                    /* Method 2: Téléversement de fichier */
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Sélectionner ou Glisser votre Fichier Vidéo
                      </label>
                      <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-2xl p-6 text-center transition bg-slate-950/40">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2 pointer-events-none">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                            <FileVideo className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-bold text-slate-200">
                            Cliquez pour choisir une vidéo ou glissez-la ici
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Formats : MP4, WebM, MOV, MKV
                          </div>
                          {uploadedFileName && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                              <Check className="w-3.5 h-3.5" />
                              <span>Fichier prêt : {uploadedFileName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alert Firebase Rules if permission denied */}
                {firestoreStatus === 'permission_denied' && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-rose-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Firebase rejette l'écriture : Règles Firestore à ajouter (permission-denied)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRulesGuideModal(true)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition shrink-0 cursor-pointer"
                      >
                        Voir la règle à copier
                      </button>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Pour que Firestore enregistre vos modifications de titre, description et vidéo, la règle <code>match /global_config/{'{document=**}'} {'{ allow read, write: if true; }'}</code> doit être publiée dans Firebase Console.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedActive: DailyTransmissionVideo = {
                        ...activeTransmission,
                        title: editTitle.trim(),
                        description: editDescription.trim(),
                        videoUrl: editUrl.trim(),
                        thumbnailUrl: parseVideoUrl(editUrl.trim()).thumbnailUrl || activeTransmission.thumbnailUrl,
                      };
                      setTransmissions((prev) =>
                        prev.map((t) => (t.id === activeTransmission.id ? updatedActive : t))
                      );
                      setIsInlinePlaying(true);
                      showToast('Aperçu direct activé dans le lecteur ci-dessus !');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tester & Prévisualiser dans le Site</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDailyContent}
                    disabled={isSavingToFirestore}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Database className="w-4 h-4" />
                    <span>
                      {isSavingToFirestore
                        ? 'Enregistrement sur Firestore...'
                        : 'Enregistrer & Mettre en Ligne (global_config/daily_content)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Colonne Droite (5 cols) : Aperçu Mobile Smartphone Live */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 text-white space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      Aperçu Exact sur le Téléphone de l'Athlète
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300">
                    Écran d'Accueil
                  </span>
                </div>

                {/* Mobile Mock Container */}
                <div className="w-full max-w-sm mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl relative">
                  {/* Smartphone Top Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto -mt-4 mb-2 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                  </div>

                  {/* Daily Video Card Mini avec Lecteur Intégré Smartphone */}
                  <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 space-y-2 pb-3">
                    <div className="relative aspect-video bg-black">
                      {isMobilePlaying ? (
                        (() => {
                          const cfg = parseVideoUrl(currentViewedTransmission.videoUrl);
                          return (
                            <div className="relative w-full h-full">
                              {cfg.type === 'youtube' || cfg.type === 'vimeo' ? (
                                <iframe
                                  src={cfg.embedUrl}
                                  title="Aperçu mobile"
                                  className="w-full h-full border-0 aspect-video"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={cfg.embedUrl}
                                  controls
                                  autoPlay
                                  playsInline
                                  className="w-full h-full object-contain"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => setIsMobilePlaying(false)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/80 text-white text-[10px] hover:bg-black transition"
                                title="Fermer la vidéo sur le mobile"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        <div
                          onClick={() => setIsMobilePlaying(true)}
                          className="relative w-full h-full cursor-pointer group"
                        >
                          <img
                            src={currentViewedTransmission.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col items-center justify-center gap-1 transition">
                            <div className="w-10 h-10 rounded-full bg-amber-500 group-hover:bg-amber-400 group-hover:scale-110 flex items-center justify-center shadow-lg transition">
                              <Play className="w-5 h-5 fill-slate-950 text-slate-950 ml-0.5" />
                            </div>
                            <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                              Lancer sur mobile
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-3">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                        Transmission du jour
                      </span>
                      <h4 className="text-xs font-black text-white line-clamp-1">
                        {currentViewedTransmission.title}
                      </h4>
                    </div>
                  </div>

                  {/* SONDAGE INTERACTIF DANS LE MOBILE */}
                  {currentViewedTransmission.poll && (
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                          <Vote className="w-3 h-3" />
                          Sondage d'aujourd'hui
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {currentViewedTransmission.poll.totalVotes} votes
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {currentViewedTransmission.poll.question}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {currentViewedTransmission.poll.options.map((opt) => {
                          const total = currentViewedTransmission.poll!.totalVotes;
                          const pct = total > 0 ? Math.round((opt.votesCount / total) * 100) : 0;
                          const isVoted = currentViewedTransmission.poll?.userVotedOptionId === opt.id;

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSimulateVote(opt.id)}
                              className={`w-full text-left p-2 rounded-xl text-[11px] font-medium transition relative overflow-hidden border ${
                                isVoted
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                              }`}
                            >
                              <div
                                style={{ width: `${pct}%` }}
                                className="absolute inset-y-0 left-0 bg-amber-500/15 pointer-events-none transition-all duration-300"
                              />
                              <div className="relative z-10 flex items-center justify-between">
                                <span className="truncate pr-2">{opt.text}</span>
                                <span className="font-mono font-bold text-[10px] shrink-0">{pct}%</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-slate-500 text-center italic">
                        Cliquez sur une option pour simuler un vote en direct
                      </p>
                    </div>
                  )}

                  {/* COMMENTAIRES APERÇU DANS LE MOBILE */}
                  {currentViewedTransmission.commentSession && (
                    <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                          <MessageSquare className="w-3 h-3" />
                          Avis & Retours ({currentViewedTransmission.commentSession.totalComments})
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold">Ouvert</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        « {currentViewedTransmission.commentSession.prompt} »
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODULE D'INTERACTION DU JOUR : SONDAGE ET/OU COMMENTAIRES */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. SECTION DU SONDAGE DU JOUR */}
            {currentViewedTransmission.poll && (
              <div
                className={`space-y-4 ${
                  currentViewedTransmission.commentSession ? 'lg:col-span-5' : 'lg:col-span-12'
                }`}
              >
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                        Module Sondage
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">Résultats du Sondage</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-50 text-amber-800 border border-amber-200">
                      {currentViewedTransmission.poll.totalVotes} Votes Exprimés
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Question posée :</p>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      {currentViewedTransmission.poll.question}
                    </p>
                  </div>

                  {/* Options Progress Breakdown */}
                  <div className="space-y-3">
                    {currentViewedTransmission.poll.options.map((opt, i) => {
                      const total = currentViewedTransmission.poll!.totalVotes;
                      const pct = total > 0 ? Math.round((opt.votesCount / total) * 100) : 0;

                      return (
                        <div key={opt.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {i + 1}. {opt.text}
                            </span>
                            <span className="font-mono font-black text-slate-900">
                              {opt.votesCount} votes ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                i === 0
                                  ? 'bg-amber-500'
                                  : i === 1
                                  ? 'bg-indigo-500'
                                  : i === 2
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>

                          {/* Voters list sample */}
                          {opt.voters && opt.voters.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1 font-mono">
                              <span>Exemples de votants :</span>
                              {opt.voters.map((v) => (
                                <span key={v.userId} className="font-bold text-slate-700">
                                  @{v.pseudo}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECTION DES COMMENTAIRES DU JOUR (AVEC RÉPONSE ADMIN DIRECTE) */}
            {currentViewedTransmission.commentSession && (
              <div
                className={`space-y-4 ${
                  currentViewedTransmission.poll ? 'lg:col-span-7' : 'lg:col-span-12'
                }`}
              >
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        Module Commentaires & Avis
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        Fil de Discussion ({currentComments.length} avis)
                      </h3>
                    </div>

                    {/* Filter comments */}
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setCommentFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          commentFilter === 'ALL'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tous ({currentComments.length})
                      </button>
                      <button
                        onClick={() => setCommentFilter('UNREPLIED')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          commentFilter === 'UNREPLIED'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        En attente de réponse ({currentComments.filter((c) => !c.adminReply).length})
                      </button>
                      <button
                        onClick={() => setCommentFilter('PINNED')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                          commentFilter === 'PINNED'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Épinglés
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
                    <span className="font-bold text-indigo-900">Consigne posée aux athlètes :</span>
                    <p className="text-indigo-800 italic mt-0.5">
                      « {currentViewedTransmission.commentSession.prompt} »
                    </p>
                  </div>

                  {/* Comments Feed */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {filteredComments.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        Aucun commentaire correspondant au filtre.
                      </div>
                    ) : (
                      filteredComments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-2xl border transition space-y-3 ${
                            comment.isPinned
                              ? 'bg-amber-50/30 border-amber-200'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                          }`}
                        >
                          {/* Comment Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                                {comment.athleteAvatar ? (
                                  <img src={comment.athleteAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-xs">
                                    {comment.athletePseudo[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs">
                                    @{comment.athletePseudo}
                                  </span>
                                  {comment.athleteClan && (
                                    <span className="text-[10px] text-slate-500">• {comment.athleteClan}</span>
                                  )}
                                  {comment.isPinned && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                      <Pin className="w-2.5 h-2.5 fill-amber-700" />
                                      ÉPINGLÉ
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">{comment.createdAt}</span>
                              </div>
                            </div>

                            {/* Comment Actions (Pin, Delete) */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleTogglePinComment(comment.id)}
                                title={comment.isPinned ? 'Désépingler' : 'Épingler ce retour en tête'}
                                className={`p-1.5 rounded-lg transition ${
                                  comment.isPinned
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>

                              {userRole === 'superadmin' && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  title="Retirer ce commentaire"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Comment Body */}
                          <p className="text-xs text-slate-800 leading-relaxed pl-10">
                            {comment.content}
                          </p>

                          {/* Existing Admin Reply */}
                          {comment.adminReply ? (
                            <div className="ml-10 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                                  {comment.adminReply.authorName}
                                  <span className="text-[9px] bg-amber-600 text-white font-mono px-1.5 py-0.2 rounded font-bold">
                                    ADMIN OSIRION
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {comment.adminReply.repliedAt}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 leading-relaxed">
                                {comment.adminReply.content}
                              </p>
                            </div>
                          ) : (
                            /* Reply Button / Box */
                            <div className="ml-10 pt-1">
                              {replyingToCommentId === comment.id ? (
                                <div className="space-y-2 p-3 rounded-xl bg-white border border-slate-300 shadow-sm">
                                  <label className="text-[11px] font-bold text-slate-700 block">
                                    Répondre officiellement à @{comment.athletePseudo} :
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Écrivez votre réponse (conseil biomécanique, félicitations, directive)..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-amber-500"
                                  />
                                  <div className="flex items-center justify-end gap-2 text-xs">
                                    <button
                                      onClick={() => {
                                        setReplyingToCommentId(null);
                                        setReplyText('');
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-slate-500 hover:bg-slate-100"
                                    >
                                      Annuler
                                    </button>
                                    <button
                                      onClick={() => handleSendAdminReply(comment.id)}
                                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>Publier la réponse</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingToCommentId(comment.id);
                                    setReplyText('');
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition"
                                >
                                  <CornerDownRight className="w-3 h-3" />
                                  <span>Répondre à cet athlète</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 : HISTORIQUE COMPLET DES TRANSMISSIONS PASSÉES */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher dans l'historique par titre, date, thème..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
              />
              {historySearch && (
                <button onClick={() => setHistorySearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by interaction type */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Type :</span>
              {['ALL', 'POLL', 'COMMENTS', 'BOTH', 'NONE'].map((type) => (
                <button
                  key={type}
                  onClick={() => setHistoryTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    historyTypeFilter === type
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'ALL' && 'Toutes les Archives'}
                  {type === 'POLL' && '📊 Sondages'}
                  {type === 'COMMENTS' && '💬 Débats & Avis'}
                  {type === 'BOTH' && '✨ Sondage + Débat'}
                  {type === 'NONE' && '🎥 Vidéo seule'}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((trans) => (
              <div
                key={trans.id}
                className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  trans.id === currentViewedTransmission.id
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        trans.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {trans.status === 'ACTIVE' ? '🟢 En Ligne (Actuel)' : 'Archivé'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{trans.displayDate}</span>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 items-start mt-2">
                    <div className="w-20 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                      <img src={trans.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {trans.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-1">Arc : {trans.arc}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-3 leading-relaxed">
                    {trans.description}
                  </p>

                  {/* Interaction summary badge */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <span className="font-semibold text-slate-700">
                      {trans.interactionType === 'POLL' && '📊 Sondage attaché'}
                      {trans.interactionType === 'COMMENTS' && '💬 Session Avis & Débat'}
                      {trans.interactionType === 'BOTH' && '✨ Sondage & Débat'}
                      {trans.interactionType === 'NONE' && '🎥 Vidéo seule'}
                    </span>
                    <span className="text-amber-700 font-bold">
                      {trans.poll ? `${trans.poll.totalVotes} votes` : ''}
                      {trans.commentSession ? `${trans.commentSession.totalComments} avis` : ''}
                    </span>
                  </div>
                </div>

                {/* Inspect Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setInspectedTransmissionId(trans.id);
                      setActiveTab('current');
                      showToast(`Consultation de la transmission du ${trans.displayDate}.`);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter les votes & Répondre aux avis</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3 : SYNTHÈSE ANALYTIQUE DES RETOURS COMMUNAUTAIRES */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>INTELLIGENCE DU CONTENU OSIRION</span>
              </div>
              <h2 className="text-xl font-black text-white">Baromètre de Satisfaction des Athlètes</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suivez en temps réel l'impact de vos vidéos, le taux de complétion des séances suggérées dans les sondages, et les requêtes récurrentes formulées dans les commentaires.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vidéos Publiées</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{transmissions.length}</span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Votes</span>
                <span className="text-2xl font-black text-indigo-400 font-mono">
                  {transmissions.reduce((acc, curr) => acc + (curr.poll?.totalVotes || 0), 0)}
                </span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Commentaires</span>
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {transmissions.reduce((acc, curr) => acc + (curr.commentSession?.totalComments || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-500" />
                <span>Top Sujets Plébiscités par les Sondages</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Biomécanique & Rétraction Scapulaire</span>
                  <span className="font-mono font-bold text-amber-600">88% d'intérêt</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Régularité des 100 Pompes Matinales</span>
                  <span className="font-mono font-bold text-indigo-600">81% de succès</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Gestion de l'acide lactique en Tug-of-War</span>
                  <span className="font-mono font-bold text-rose-600">92% d'intérêt</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Directives d'Engagement de l'Équipe</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                • <strong>Réactivité :</strong> Répondre aux questions techniques d’entraînement sous 2 heures garantit un taux de rétention de 84% chez les athlètes de l’application.
                <br /><br />
                • <strong>Épinglage stratégique :</strong> Mettre en avant le meilleur retour d’un athlète donne un modèle concret à suivre pour toute la communauté.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL WIZARD : METTRE EN LIGNE LA VIDÉO DU JOUR */}
      {/* ========================================================================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Renouvellement Quotidien de l'App
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  Mettre en Ligne la Vidéo du Jour
                </h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {[
                { step: 1, label: '1. Vidéo & Informations' },
                { step: 2, label: '2. Choix de l’Interaction' },
                { step: 3, label: '3. Configuration & Diffusion' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 ${
                    modalStep === s.step
                      ? 'text-amber-600 font-bold'
                      : modalStep > s.step
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      modalStep === s.step
                        ? 'bg-amber-600 text-white'
                        : modalStep > s.step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.step}
                  </span>
                  <span className="hidden sm:inline text-[11px]">{s.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePublishDailyTransmission} className="space-y-4">
              {/* ÉTAPE 1 : VIDÉO & MÉTHODE */}
              {modalStep === 1 && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Titre de la Transmission :</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Masterclass Traction Pure & Verrouillage Abdominal"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Description / Consigne d'entraînement :</label>
                    <textarea
                      rows={3}
                      placeholder="Explications techniques, points d'attention biomécaniques..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">URL de la Vidéo (YouTube / MP4 / Cloud) :</label>
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?v=... ou https://firebasestorage..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Source Vidéo :</label>
                      <select
                        value={newSourceType}
                        onChange={(e) => setNewSourceType(e.target.value as VideoSourceType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                      >
                        <option value="YOUTUBE">YouTube (Lecteur Fluide)</option>
                        <option value="FIREBASE_MP4">Firebase Storage MP4</option>
                        <option value="EXTERNAL">Lien Externe</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Arc Narratif :</label>
                      <select
                        value={newArc}
                        onChange={(e) => setNewArc(e.target.value as TransmissionArc)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                      >
                        <option value="Winter Arc">Winter Arc (Discipline & Stoïcisme)</option>
                        <option value="Summer Body">Summer Body (Explosivité & Volume)</option>
                        <option value="Royal Arc">Royal Arc (Puissance & Conquête)</option>
                        <option value="Général">Général (Tous les athlètes)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Image Miniature (URL) :</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newThumbnailUrl}
                        onChange={(e) => setNewThumbnailUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Durée :</label>
                      <input
                        type="text"
                        placeholder="05m 30s"
                        value={newDurationFormatted}
                        onChange={(e) => setNewDurationFormatted(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
                    >
                      <span>Continuer : Choix de l'Interaction</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : DÉCIDER ENTRE SONDAGE OU COMMENTAIRES */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-700 leading-relaxed">
                    <p className="font-bold text-amber-950">
                      🎯 Décision Clé : Quelle interaction associer à cette vidéo ?
                    </p>
                    <p className="text-xs text-amber-900/80 mt-1">
                      Choisissez la manière dont vos athlètes donneront leur avis sous la vidéo aujourd'hui. L'historique complet de la vidéo précédente sera archivé avec toutes ses données.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* OPTION 1 : SONDAGE */}
                    <div
                      onClick={() => setNewInteractionType('POLL')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        newInteractionType === 'POLL'
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                            <Vote className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">Faire un Sondage</h4>
                            <span className="text-[10px] text-slate-500">Votes quantitatifs instantanés</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newInteractionType === 'POLL' ? 'border-amber-600' : 'border-slate-300'
                          }`}
                        >
                          {newInteractionType === 'POLL' && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">
                        Idéal pour tester la validation d’un protocole (Ex : « Avez-vous réussi les 50 reps ? ») avec calcul immédiat des pourcentages.
                      </p>
                    </div>

                    {/* OPTION 2 : SESSION DE COMMENTAIRES */}
                    <div
                      onClick={() => setNewInteractionType('COMMENTS')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        newInteractionType === 'COMMENTS'
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">Session Commentaires</h4>
                            <span className="text-[10px] text-slate-500">Débat & Retours Qualitatifs</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newInteractionType === 'COMMENTS' ? 'border-indigo-600' : 'border-slate-300'
                          }`}
                        >
                          {newInteractionType === 'COMMENTS' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">
                        Idéal pour engager la conversation, répondre individuellement aux athlètes et épingler les meilleures questions.
                      </p>
                    </div>

                    {/* OPTION 3 : LES DEUX (SONDAGE + COMMENTAIRES) */}
                    <div
                      onClick={() => setNewInteractionType('BOTH')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        newInteractionType === 'BOTH'
                          ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">Les Deux Ensemble</h4>
                            <span className="text-[10px] text-slate-500">Sondage + Fil de discussion</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newInteractionType === 'BOTH' ? 'border-purple-600' : 'border-slate-300'
                          }`}
                        >
                          {newInteractionType === 'BOTH' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">
                        L'athlète vote au sondage puis développe son point de vue dans l'espace commentaires modéré.
                      </p>
                    </div>

                    {/* OPTION 4 : VIDÉO SEULE */}
                    <div
                      onClick={() => setNewInteractionType('NONE')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                        newInteractionType === 'NONE'
                          ? 'border-slate-500 bg-slate-100 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-slate-200 text-slate-800">
                            <Tv className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">Vidéo Seule</h4>
                            <span className="text-[10px] text-slate-500">Diffusion passive sans avis</span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newInteractionType === 'NONE' ? 'border-slate-600' : 'border-slate-300'
                          }`}
                        >
                          {newInteractionType === 'NONE' && <div className="w-2 h-2 rounded-full bg-slate-600" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">
                        Aucun module d’interaction affiché sous le lecteur vidéo pour cette séance.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
                    >
                      <span>Configurer : {newInteractionType}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : CONFIGURATION DÉTAILLÉE DE L'INTERACTION CHOISIE */}
              {modalStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  {/* SI SONDAGE */}
                  {(newInteractionType === 'POLL' || newInteractionType === 'BOTH') && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-amber-700" />
                        <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wide">
                          Configuration du Sondage :
                        </h4>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Question du jour :</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex : Avez-vous complété le protocole de 50 tractions ?"
                          value={newPollQuestion}
                          onChange={(e) => setNewPollQuestion(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-slate-900 font-bold text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-slate-700 text-xs">Choix de réponses (2 à 5) :</label>
                          {newPollOptions.length < 5 && (
                            <button
                              type="button"
                              onClick={handleAddPollOption}
                              className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                            >
                              + Ajouter une option
                            </button>
                          )}
                        </div>

                        {newPollOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-slate-800 text-xs"
                              placeholder={`Option ${idx + 1}`}
                            />
                            {newPollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePollOption(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SI COMMENTAIRES */}
                  {(newInteractionType === 'COMMENTS' || newInteractionType === 'BOTH') && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-700" />
                        <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wide">
                          Configuration de la Session de Commentaires :
                        </h4>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Consigne ou sujet de discussion affiché en tête :
                        </label>
                        <input
                          type="text"
                          required
                          value={newCommentPrompt}
                          onChange={(e) => setNewCommentPrompt(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-slate-900 font-semibold text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* NOTIFICATION PUSH TOGGLE */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Envoyer une notification Push FCM à tous les athlètes
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Alerte instantanée sur smartphone pour annoncer la nouvelle vidéo et le vote.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifyAthletes}
                        onChange={(e) => setNotifyAthletes(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                    </label>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Publier & Synchroniser Immédiatement</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Integrated In-Site Video Modal */}
      {fullscreenVideo && (
        <IntegratedVideoModal
          title={fullscreenVideo.title}
          description={fullscreenVideo.description}
          videoUrl={fullscreenVideo.videoUrl}
          displayDate={fullscreenVideo.displayDate}
          arc={fullscreenVideo.arc}
          onClose={() => setFullscreenVideo(null)}
        />
      )}

      {/* Firestore Rules Help & Resolution Modal */}
      {showRulesGuideModal && (
        <FirestoreRulesGuideModal
          onClose={() => setShowRulesGuideModal(false)}
          onRetryTest={handleTestFirestoreConnection}
          isTesting={isTestingConnection}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
