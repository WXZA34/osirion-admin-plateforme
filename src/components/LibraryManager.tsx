import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { AthleteUser } from '../types/admin';
import {
  LibraryBook,
  LibraryAudio,
  LibraryArc,
  BookStatus,
  AudioCategory,
  AudioStatus,
  ReadingFocusSession,
  SealedHonorContract,
} from '../types/library';
import {
  INITIAL_LIBRARY_BOOKS,
  INITIAL_LIBRARY_AUDIOS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_HONOR_CONTRACTS,
} from '../data/libraryData';
import {
  BookOpen,
  Headphones,
  Plus,
  Trash2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Play,
  Pause,
  Volume2,
  FileText,
  Bookmark,
  Share2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Archive,
  RefreshCw,
  ExternalLink,
  Flame,
  Shield,
  Zap,
  Award,
  Layers,
  ScrollText,
  AlertCircle,
  AlertTriangle,
  Library,
  Feather,
} from 'lucide-react';

interface LibraryManagerProps {
  athletes: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateAthlete?: (updated: AthleteUser) => void;
  onSendPushNotification?: (title: string, body: string) => void;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  athletes,
  userRole = 'superadmin',
  onUpdateAthlete,
  onSendPushNotification,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'books' | 'audios' | 'focus' | 'journal'>('books');

  // Datasets
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_LIBRARY_BOOKS);
  const [audios, setAudios] = useState<LibraryAudio[]>(INITIAL_LIBRARY_AUDIOS);
  const [focusSessions, setFocusSessions] = useState<ReadingFocusSession[]>(INITIAL_FOCUS_SESSIONS);
  const [honorContracts, setHonorContracts] = useState<SealedHonorContract[]>(INITIAL_HONOR_CONTRACTS);

  // Sync Status
  const [isBooksSynced, setIsBooksSynced] = useState<boolean>(false);
  const [isAudiosSynced, setIsAudiosSynced] = useState<boolean>(false);

  useEffect(() => {
    const unsubBooks = onSnapshot(collection(db, 'library_books'), (snapshot) => {
      if (!snapshot.empty) {
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryBook)));
        setIsBooksSynced(true);
      } else {
        setIsBooksSynced(false);
      }
    });

    const unsubAudios = onSnapshot(collection(db, 'library_audios'), (snapshot) => {
      if (!snapshot.empty) {
        setAudios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryAudio)));
        setIsAudiosSynced(true);
      } else {
        setIsAudiosSynced(false);
      }
    });

    return () => {
      unsubBooks();
      unsubAudios();
    };
  }, []);

  const handleDeployBooks = async () => {
    try {
      const batch = writeBatch(db);
      books.forEach(b => {
        batch.set(doc(db, 'library_books', b.id), b);
      });
      await batch.commit();
      showToast('Livres déployés avec succès vers le Cloud !');
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du déploiement des livres.');
    }
  };

  const handleDeployAudios = async () => {
    try {
      const batch = writeBatch(db);
      audios.forEach(a => {
        batch.set(doc(db, 'library_audios', a.id), a);
      });
      await batch.commit();
      showToast('Audios déployés avec succès vers le Cloud !');
    } catch (e) {
      console.error(e);
      showToast('Erreur lors du déploiement des audios.');
    }
  };

  // Filters & State
  const [bookArcFilter, setBookArcFilter] = useState<string>('ALL');
  const [bookSearch, setBookSearch] = useState<string>('');
  const [audioCategoryFilter, setAudioCategoryFilter] = useState<string>('ALL');
  const [audioSearch, setAudioSearch] = useState<string>('');

  // Modals & Inspection
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<LibraryAudio | null>(null);
  const [bookToDelete, setBookToDelete] = useState<LibraryBook | null>(null);
  const [audioToDelete, setAudioToDelete] = useState<LibraryAudio | null>(null);

  // Multi-Step Add Book Wizard
  const [showAddBookWizard, setShowAddBookWizard] = useState(false);
  const [bookWizardStep, setBookWizardStep] = useState<number>(1);
  const [newBookId, setNewBookId] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookTag, setNewBookTag] = useState('Obstacle & Résilience');
  const [newBookTheme, setNewBookTheme] = useState('');
  const [newBookWhyRead, setNewBookWhyRead] = useState('');
  const [newBookKeyPhrase, setNewBookKeyPhrase] = useState('');
  const [newBookArc, setNewBookArc] = useState<LibraryArc>('Winter Arc');
  const [newBookPdfPath, setNewBookPdfPath] = useState('');
  const [newBookThumbnail, setNewBookThumbnail] = useState('');
  const [newBookPages, setNewBookPages] = useState<number>(150);
  const [newBookMinutes, setNewBookMinutes] = useState<number>(40);
  const [newBookWisdomXp, setNewBookWisdomXp] = useState<number>(150);

  // Multi-Step Add Audio Wizard
  const [showAddAudioWizard, setShowAddAudioWizard] = useState(false);
  const [audioWizardStep, setAudioWizardStep] = useState<number>(1);
  const [newAudioId, setNewAudioId] = useState('');
  const [newAudioTitle, setNewAudioTitle] = useState('');
  const [newAudioSubtitle, setNewAudioSubtitle] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newAudioCategory, setNewAudioCategory] = useState<AudioCategory>('forge');
  const [newAudioDurationFormatted, setNewAudioDurationFormatted] = useState('10m 00s');
  const [newAudioSpeaker, setNewAudioSpeaker] = useState('Osirion Masterclass');
  const [newAudioIsAsset, setNewAudioIsAsset] = useState<boolean>(false);

  // Audio Preview Player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics
  const publishedBooksCount = books.filter((b) => b.status === 'PUBLISHED').length;
  const publishedAudiosCount = audios.filter((a) => a.status === 'PUBLISHED').length;
  const totalListens = audios.reduce((acc, curr) => acc + curr.listenCount, 0);
  const totalWisdomAwarded = focusSessions.reduce((acc, curr) => acc + curr.wisdomXpEarned, 0);

  // Filtered Books
  const filteredBooks = books.filter((b) => {
    const matchesArc = bookArcFilter === 'ALL' || b.arc === bookArcFilter;
    const matchesSearch =
      b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.tag?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.theme?.toLowerCase().includes(bookSearch.toLowerCase());
    return matchesArc && matchesSearch;
  });

  // Filtered Audios
  const filteredAudios = audios.filter((a) => {
    const matchesCat = audioCategoryFilter === 'ALL' || a.category === audioCategoryFilter;
    const matchesSearch =
      a.title?.toLowerCase().includes(audioSearch.toLowerCase()) ||
      a.subtitle?.toLowerCase().includes(audioSearch.toLowerCase()) ||
      (a.speakerName?.toLowerCase().includes(audioSearch.toLowerCase()) ?? false);
    return matchesCat && matchesSearch;
  });

  const handleToggleBookStatus = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const nextStatus: BookStatus = book.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    
    if (isBooksSynced) {
      setDoc(doc(db, 'library_books', bookId), { ...book, status: nextStatus });
    } else {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookId) {
            return { ...b, status: nextStatus };
          }
          return b;
        })
      );
    }
    showToast('Statut du livre mis à jour (synchronisé avec l’application mobile).');
  };

  const handleConfirmDeleteBook = () => {
    if (!bookToDelete) return;
    
    if (isBooksSynced) {
      deleteDoc(doc(db, 'library_books', bookToDelete.id));
    } else {
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
    }
    
    if (selectedBook && selectedBook.id === bookToDelete.id) {
      setSelectedBook(null);
    }
    showToast(`Le livre « ${bookToDelete.title} » a été retiré de la Bibliothèque.`);
    setBookToDelete(null);
  };

  const handleFinishAddBookWizard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    const bookId = newBookId.trim() || `b_${Date.now().toString(36)}`;
    const newBook: LibraryBook = {
      id: bookId,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim(),
      tag: newBookTag.trim() || 'Sagesse & Discipline',
      theme: newBookTheme.trim() || 'Philosophie & Force Mentale',
      whyRead: newBookWhyRead.trim() || 'Une œuvre fondamentale pour affûter l’esprit des athlètes.',
      keyPhrase: newBookKeyPhrase.trim() || 'La discipline commence là où s’arrêtent les excuses.',
      arc: newBookArc,
      pdfPath: newBookPdfPath.trim() || undefined,
      thumbnailUrl:
        newBookThumbnail.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      pageCount: Number(newBookPages) || 120,
      estimatedReadTimeMin: Number(newBookMinutes) || 35,
      status: 'PUBLISHED',
      readCount: 0,
      favoriteCount: 0,
      addedAt: new Date().toISOString().split('T')[0],
      wisdomXpReward: Number(newBookWisdomXp) || 150,
      chaptersCount: 10,
    };

    if (isBooksSynced) {
      setDoc(doc(db, 'library_books', newBook.id), newBook);
    } else {
      setBooks([newBook, ...books]);
    }
    setShowAddBookWizard(false);
    resetBookWizard();
    showToast(`Le traité « ${newBook.title} » a été validé et intégré à la Bibliothèque !`);

    if (onSendPushNotification) {
      onSendPushNotification(
        `📚 Nouveau Chef-d’œuvre dans la Bibliothèque : ${newBook.title}`,
        `Écrit par ${newBook.author}. Disponible pour votre prochaine session de lecture stoïcienne (+${newBook.wisdomXpReward} XP Sagesse).`
      );
    }
  };

  const resetBookWizard = () => {
    setBookWizardStep(1);
    setNewBookId('');
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookTag('Obstacle & Résilience');
    setNewBookTheme('');
    setNewBookWhyRead('');
    setNewBookKeyPhrase('');
    setNewBookPdfPath('');
    setNewBookThumbnail('');
    setNewBookPages(150);
    setNewBookMinutes(40);
    setNewBookWisdomXp(150);
  };

  // Handlers for Audios
  const handleToggleAudioStatus = (audioId: string) => {
    const audio = audios.find(a => a.id === audioId);
    if (!audio) return;
    const nextStatus: AudioStatus = audio.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';

    if (isAudiosSynced) {
      setDoc(doc(db, 'library_audios', audioId), { ...audio, status: nextStatus });
    } else {
      setAudios((prev) =>
        prev.map((a) => {
          if (a.id === audioId) {
            return { ...a, status: nextStatus };
          }
          return a;
        })
      );
    }
    showToast('Statut de la capsule audio mis à jour.');
  };

  const handleConfirmDeleteAudio = () => {
    if (!audioToDelete) return;
    
    if (isAudiosSynced) {
      deleteDoc(doc(db, 'library_audios', audioToDelete.id));
    } else {
      setAudios((prev) => prev.filter((a) => a.id !== audioToDelete.id));
    }

    if (selectedAudio && selectedAudio.id === audioToDelete.id) {
      setSelectedAudio(null);
    }
    showToast(`La capsule audio « ${audioToDelete.title} » a été retirée du catalogue.`);
    setAudioToDelete(null);
  };

  const handleFinishAddAudioWizard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudioTitle.trim() || !newAudioUrl.trim()) return;

    const audioId = newAudioId.trim() || `audio_${Date.now().toString(36)}`;
    const newAudio: LibraryAudio = {
      id: audioId,
      title: newAudioTitle.trim(),
      subtitle: newAudioSubtitle.trim() || 'Capsule de sagesse et de préparation mentale',
      audioUrl: newAudioUrl.trim(),
      iconName: 'Zap',
      category: newAudioCategory,
      order: audios.length + 1,
      isAsset: newAudioIsAsset,
      durationFormatted: newAudioDurationFormatted.trim() || '10m 00s',
      durationSeconds: 600,
      status: 'PUBLISHED',
      listenCount: 0,
      speakerName: newAudioSpeaker.trim() || 'Mentor Osirion',
      addedAt: new Date().toISOString().split('T')[0],
      fileSizeBytes: 12000000,
    };

    if (isAudiosSynced) {
      setDoc(doc(db, 'library_audios', newAudio.id), newAudio);
    } else {
      setAudios([newAudio, ...audios]);
    }

    setShowAddAudioWizard(false);
    resetAudioWizard();
    showToast(`La capsule audio « ${newAudio.title} » a été publiée avec succès !`);

    if (onSendPushNotification) {
      onSendPushNotification(
        `🎙️ Nouvelle Capsule Audio : ${newAudio.title}`,
        `${newAudio.subtitle}. Écoutez-la pendant vos temps de repos ou votre échauffement !`
      );
    }
  };

  const resetAudioWizard = () => {
    setAudioWizardStep(1);
    setNewAudioId('');
    setNewAudioTitle('');
    setNewAudioSubtitle('');
    setNewAudioUrl('');
    setNewAudioCategory('forge');
    setNewAudioDurationFormatted('10m 00s');
    setNewAudioSpeaker('Osirion Masterclass');
    setNewAudioIsAsset(false);
  };

  const togglePlayAudio = (audioId: string) => {
    if (playingAudioId === audioId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(audioId);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. GRAND BANDEAU DE SUPERVISION DE LA BIBLIOTHÈQUE */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Library className="w-3.5 h-3.5 text-indigo-400" />
              <span>SANCTUAIRE DE SAGESSE & CULTURE DE L'ATHLÈTE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>La Grande Bibliothèque & Podcasts</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-indigo-600 text-white">
                {publishedBooksCount} Livres • {publishedAudiosCount} Audios
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Supervision complète du temple intellectuel d'Osirion : ajout et retrait structurés d'œuvres littéraires stoïciennes (PDF, chapitres, mantras), capsules audio & podcasts de motivation, sessions de lecture Focus (15/30/60m) et contrats d'honneur scellés.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Livres Actifs</span>
              <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">
                {publishedBooksCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Écoutes Audios</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                {(totalListens || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">XP Sagesse Donnée</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                +{totalWisdomAwarded}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Contrats Scellés</span>
              <span className="text-xl font-black text-purple-400 font-mono mt-0.5 block">
                {honorContracts.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRE D'ONGLETS & ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'books'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Livres & Traités ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audios')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'audios'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>2. Capsules Audio & Podcasts ({audios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'focus'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. Sessions Focus & Timers ({focusSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'journal'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>4. Journal Stoïcien & Contrats ({honorContracts.length})</span>
          </button>
        </div>

        {/* Action Button depending on current tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'books' && userRole === 'superadmin' && (
            <>
              <button
                onClick={handleDeployBooks}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Déployer Firestore</span>
              </button>
              <button
                onClick={() => {
                  resetBookWizard();
                  setShowAddBookWizard(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Intégrer un Livre</span>
              </button>
            </>
          )}

          {activeTab === 'audios' && userRole === 'superadmin' && (
            <>
              <button
                onClick={handleDeployAudios}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Déployer Firestore</span>
              </button>
              <button
                onClick={() => {
                  resetAudioWizard();
                  setShowAddAudioWizard(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Publier Capsule</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 : CATALOGUE DES LIVRES & TRAITÉS LITTÉRAIRES */}
      {/* ========================================================================= */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par titre, auteur (Marc Aurèle, Sénèque, Sun Tzu...), thème..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
              />
              {bookSearch && (
                <button onClick={() => setBookSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter by Arc */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Arc Narratif :</span>
              {['ALL', 'Winter Arc', 'Summer Body', 'Royal Arc'].map((arc) => (
                <button
                  key={arc}
                  onClick={() => setBookArcFilter(arc)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    bookArcFilter === arc
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {arc === 'ALL' && 'Tous les Arcs'}
                  {arc === 'Winter Arc' && '❄️ Winter Arc (Stoïcisme)'}
                  {arc === 'Summer Body' && '☀️ Summer Body (Habitudes)'}
                  {arc === 'Royal Arc' && '👑 Royal Arc (Stratégie)'}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Badge & Arc */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        book.arc === 'Winter Arc'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : book.arc === 'Summer Body'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {book.arc}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        book.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {book.status === 'PUBLISHED' ? 'En Ligne' : 'Archivé'}
                    </span>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 items-start mt-2">
                    <div className="w-16 h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs relative">
                      {book.thumbnailUrl ? (
                        <img
                          src={book.thumbnailUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-amber-400 font-bold text-xs p-1 text-center">
                          {book.title.slice(0, 8)}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-[9px] text-white text-center py-0.5 font-mono">
                        {book.pageCount} p.
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{book.author}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-mono">
                        {book.tag}
                      </p>
                    </div>
                  </div>

                  {/* Key Mantra Banner */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                    « {book.keyPhrase} »
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{book.readCount} lectures</span>
                    <span className="text-indigo-600 font-bold">+{book.wisdomXpReward} XP Sagesse</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Détails & Fichier</span>
                  </button>

                  {userRole === 'superadmin' && (
                    <>
                      <button
                        onClick={() => handleToggleBookStatus(book.id)}
                        title={book.status === 'PUBLISHED' ? 'Archiver (Masquer de l’app)' : 'Publier dans l’app'}
                        className={`p-1.5 rounded-xl border transition ${
                          book.status === 'PUBLISHED'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setBookToDelete(book)}
                        title="Retirer définitivement le livre"
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 : CAPSULES AUDIO & PODCASTS OFFICIELS */}
      {/* ========================================================================= */}
      {activeTab === 'audios' && (
        <div className="space-y-4">
          {/* Audio Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher une capsule audio, David Goggins, Saitama..."
                value={audioSearch}
                onChange={(e) => setAudioSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
              />
              {audioSearch && (
                <button onClick={() => setAudioSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Thématique :</span>
              {['ALL', 'forge', 'mindset', 'motivation', 'warrior', 'recovery'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAudioCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    audioCategoryFilter === cat
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' && 'Tous les Audios'}
                  {cat === 'forge' && '🔥 Forge (Motivation)'}
                  {cat === 'mindset' && '🧠 Mindset (Stoïcisme)'}
                  {cat === 'motivation' && '⚡ Rigueur & Focus'}
                  {cat === 'warrior' && '⚔️ Voie du Guerrier'}
                  {cat === 'recovery' && '🌿 Récupération'}
                </button>
              ))}
            </div>
          </div>

          {/* Audio List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {filteredAudios.map((audio) => {
                const isPlaying = playingAudioId === audio.id;

                return (
                  <div
                    key={audio.id}
                    className={`p-4 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPlaying ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Play Button preview */}
                      <button
                        onClick={() => togglePlayAudio(audio.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition ${
                          isPlaying
                            ? 'bg-amber-500 text-white scale-105 animate-pulse'
                            : 'bg-slate-900 hover:bg-amber-500 text-white'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{audio.title}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              audio.category === 'warrior'
                                ? 'bg-rose-100 text-rose-700'
                                : audio.category === 'forge'
                                ? 'bg-amber-100 text-amber-700'
                                : audio.category === 'mindset'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {audio.category.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{audio.subtitle}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                          <span>Intervenant : <strong className="text-slate-600">{audio.speakerName}</strong></span>
                          <span>•</span>
                          <span>Durée : <strong className="text-slate-800">{audio.durationFormatted}</strong></span>
                          <span>•</span>
                          <span>{audio.isAsset ? 'Fichier embarqué (Asset)' : 'Flux Cloud Firebase'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Info & Actions */}
                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right font-mono text-xs hidden sm:block">
                        <span className="font-bold text-slate-800 block">
                          {(audio.listenCount || 0).toLocaleString()} écoutes
                        </span>
                        <span className="text-[10px] text-slate-400">Ordre #{audio.order}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedAudio(audio)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        >
                          Détails Flux
                        </button>

                        {userRole === 'superadmin' && (
                          <>
                            <button
                              onClick={() => handleToggleAudioStatus(audio.id)}
                              title={audio.status === 'PUBLISHED' ? 'Archiver' : 'Publier'}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAudioToDelete(audio)}
                              title="Retirer la capsule audio"
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3 : SESSIONS FOCUS & TIMERS DE LECTURE */}
      {/* ========================================================================= */}
      {activeTab === 'focus' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>CHRONOMÈTRE DE LECTURE STOÏCIENNE & FOCUS</span>
              </div>
              <h2 className="text-xl font-black text-white">Sessions de Lecture Active (15 / 30 / 60 min)</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Les athlètes verrouillent leur écran avec un son d'ambiance stoïcien (Silence, Pluie stoïcienne, Feu de camp) pour lire une masterclass littéraire. Chaque session complétée octroie de l'XP de Sagesse au classement du Panthéon.
              </p>
            </div>

            <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Sagesse Distribuée</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">
                +{totalWisdomAwarded} XP
              </span>
            </div>
          </div>

          {/* Focus Sessions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Dernières Sessions Enregistrées</h3>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Athlète</th>
                  <th className="py-3 px-4">Livre Lu</th>
                  <th className="py-3 px-4">Durée Focus</th>
                  <th className="py-3 px-4">Son d'Ambiance</th>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4 text-right">Récompense Sagesse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {focusSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 overflow-hidden shrink-0">
                        {sess.athleteAvatar ? (
                          <img src={sess.athleteAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-700 font-bold">
                            {sess.athletePseudo[0]}
                          </div>
                        )}
                      </div>
                      <span>@{sess.athletePseudo}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{sess.bookTitle}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {sess.durationMinutes} minutes
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{sess.ambientSound}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{sess.completedAt}</td>
                    <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-600">
                      +{sess.wisdomXpEarned} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4 : JOURNAL STOÏCIEN & CONTRATS D'HONNEUR SCELLÉS */}
      {/* ========================================================================= */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="bg-amber-950 text-white rounded-3xl border border-amber-800/60 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <ScrollText className="w-3.5 h-3.5 text-amber-400" />
                <span>CONTRATS D'HONNEUR IMMUABLES (SEALED LESSONS)</span>
              </div>
              <h2 className="text-xl font-black text-white">Journal Philosophique & Engagements</h2>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Après chaque lecture, les athlètes scellent une leçon stoïcienne concrète dans leur journal. Une fois le sceau appliqué, le contrat d'honneur devient ineffaçable pour renforcer l'intégrité de la parole donnée.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {honorContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-900 text-xs">
                      @{contract.athletePseudo}
                    </span>
                    <span className="text-[10px] text-slate-400">• Livre : {contract.bookTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                    Sceau Apposé
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed bg-amber-50/50 p-3 rounded-2xl border border-amber-100/60">
                  {contract.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Enregistré le {contract.date}</span>
                  <span className="text-emerald-600 font-bold">Récompense de Sagesse accordée</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : PROCESSUS MULTI-ÉTAPES D'AJOUT D'UN LIVRE (WIZARD 4 ÉTAPES) */}
      {/* ========================================================================= */}
      {showAddBookWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Processus d'Intégration Littéraire
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  Nouveau Traité de Sagesse pour la Bibliothèque
                </h3>
              </div>
              <button onClick={() => setShowAddBookWizard(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {[
                { step: 1, label: '1. Auteur & Métadonnées' },
                { step: 2, label: '2. Manuscrit PDF & Visuel' },
                { step: 3, label: '3. Mantra & Raison de Lire' },
                { step: 4, label: '4. Arc & Publication' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 ${
                    bookWizardStep === s.step
                      ? 'text-indigo-600 font-bold'
                      : bookWizardStep > s.step
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      bookWizardStep === s.step
                        ? 'bg-indigo-600 text-white'
                        : bookWizardStep > s.step
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

            <form onSubmit={handleFinishAddBookWizard} className="space-y-4">
              {/* ÉTAPE 1 : AUTEUR & TITRE */}
              {bookWizardStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Titre de l'Œuvre :</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Manuel d'Épictète"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Auteur / Philosophe :</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Épictète"
                        value={newBookAuthor}
                        onChange={(e) => setNewBookAuthor(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Thème Central :</label>
                      <input
                        type="text"
                        placeholder="Ex : Dichotomie du Contrôle & Liberté"
                        value={newBookTheme}
                        onChange={(e) => setNewBookTheme(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tag d'Ancrage :</label>
                      <input
                        type="text"
                        placeholder="Ex : Maîtrise de Soi & Calme"
                        value={newBookTag}
                        onChange={(e) => setNewBookTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Identifiant Technique (optionnel) :</label>
                    <input
                      type="text"
                      placeholder="Ex : b_epictete"
                      value={newBookId}
                      onChange={(e) => setNewBookId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : FICHIER PDF & COUVERTURE */}
              {bookWizardStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Chemin du PDF ou URL de Lecture :</label>
                    <input
                      type="text"
                      placeholder="Ex : assets/books/epictete_manuel.pdf ou https://..."
                      value={newBookPdfPath}
                      onChange={(e) => setNewBookPdfPath(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Le fichier PDF sera affiché dans le lecteur intégré de l'application mobile Flutter.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">URL de la Couverture (Image WebP ou JPG) :</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newBookThumbnail}
                      onChange={(e) => setNewBookThumbnail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nombre de Pages :</label>
                      <input
                        type="number"
                        min="10"
                        max="1500"
                        value={newBookPages}
                        onChange={(e) => setNewBookPages(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Temps de Lecture Estimé (min) :</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={newBookMinutes}
                        onChange={(e) => setNewBookMinutes(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : MANTRAS & RAISON DE LIRE */}
              {bookWizardStep === 3 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pourquoi l'athlète doit-il lire ce livre ?</label>
                    <textarea
                      rows={3}
                      placeholder="Expliquez la transmutation mentale : en quoi cette lecture décuple la rigueur physique..."
                      value={newBookWhyRead}
                      onChange={(e) => setNewBookWhyRead(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phrase Clé / Mantra Suprême :</label>
                    <input
                      type="text"
                      placeholder="Ex : Ce qui dépend de nous, ce qui ne dépend pas de nous."
                      value={newBookKeyPhrase}
                      onChange={(e) => setNewBookKeyPhrase(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold italic"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Récompense de Sagesse (XP Panthéon) :</label>
                    <input
                      type="number"
                      min="50"
                      max="500"
                      value={newBookWisdomXp}
                      onChange={(e) => setNewBookWisdomXp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-indigo-600"
                    />
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : ARC & PUBLICATION */}
              {bookWizardStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Arc Narratif d'Attribution :</label>
                    <select
                      value={newBookArc}
                      onChange={(e) => setNewBookArc(e.target.value as LibraryArc)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                    >
                      <option value="Winter Arc">❄️ Winter Arc (Résilience & Solitude Stoïcienne)</option>
                      <option value="Summer Body">☀️ Summer Body (Habitudes & Énergie Solaire)</option>
                      <option value="Royal Arc">👑 Royal Arc (Stratégie & Victoire Suprême)</option>
                    </select>
                  </div>

                  {/* Summary Card before validation */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Récapitulatif de Publication
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{newBookTitle}</h4>
                    <p className="text-xs text-slate-600">Auteur : <strong>{newBookAuthor}</strong></p>
                    <p className="text-xs text-slate-600">Mantra : <em>« {newBookKeyPhrase} »</em></p>
                    <p className="text-xs text-indigo-700 font-bold">Arc : {newBookArc} • +{newBookWisdomXp} XP Sagesse</p>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    En validant, le livre sera immédiatement déployé dans le catalogue mobile et une notification push sera expédiée aux athlètes suivant l'arc sélectionné.
                  </p>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {bookWizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setBookWizardStep(bookWizardStep - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>
                ) : (
                  <div />
                )}

                {bookWizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (bookWizardStep === 1 && (!newBookTitle.trim() || !newBookAuthor.trim())) {
                        alert('Veuillez renseigner au moins le titre et l’auteur.');
                        return;
                      }
                      setBookWizardStep(bookWizardStep + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <span>Étape Suivante</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider & Publier dans l'App</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : PROCESSUS D'AJOUT D'UNE CAPSULE AUDIO (WIZARD AUDIO) */}
      {/* ========================================================================= */}
      {showAddAudioWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Processus Audio & Podcast
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  Nouvelle Capsule Audio Osirion
                </h3>
              </div>
              <button onClick={() => setShowAddAudioWizard(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishAddAudioWizard} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre de la Capsule Audio :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Dompter la Voix de la Faiblesse"
                  value={newAudioTitle}
                  onChange={(e) => setNewAudioTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sous-Titre / Contexte :</label>
                <input
                  type="text"
                  placeholder="Ex : Discours puissant sur la discipline et le silence mental"
                  value={newAudioSubtitle}
                  onChange={(e) => setNewAudioSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thématique :</label>
                  <select
                    value={newAudioCategory}
                    onChange={(e) => setNewAudioCategory(e.target.value as AudioCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  >
                    <option value="forge">🔥 Forge (Motivation brute)</option>
                    <option value="mindset">🧠 Mindset (Stoïcisme)</option>
                    <option value="motivation">⚡ Rigueur & Focus</option>
                    <option value="warrior">⚔️ Voie du Guerrier (Goggins)</option>
                    <option value="recovery">🌿 Récupération & Respiration</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Durée Affichée :</label>
                  <input
                    type="text"
                    placeholder="Ex : 14m 20s"
                    value={newAudioDurationFormatted}
                    onChange={(e) => setNewAudioDurationFormatted(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL Audio ou Fichier M4A/MP3 :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : https://firebasestorage.googleapis.com/... ou audio/mon_fichier.m4a"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Intervenant / Voix :</label>
                  <input
                    type="text"
                    placeholder="Ex : David Goggins (VF)"
                    value={newAudioSpeaker}
                    onChange={(e) => setNewAudioSpeaker(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type de Ressource :</label>
                  <select
                    value={newAudioIsAsset ? 'true' : 'false'}
                    onChange={(e) => setNewAudioIsAsset(e.target.value === 'true')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="false">Flux Distant Cloud (Firebase / CDN)</option>
                    <option value="true">Fichier Embarqué Local (Asset Flutter)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAudioWizard(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Publier la Capsule Audio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : INSPECTION DÉTAILLÉE D'UN LIVRE */}
      {/* ========================================================================= */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex gap-3">
                <div className="w-14 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                  {selectedBook.thumbnailUrl && (
                    <img src={selectedBook.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedBook.arc}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-1">{selectedBook.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{selectedBook.author}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block">Mantra Clé Gravé :</span>
                <p className="italic text-slate-700 leading-relaxed">« {selectedBook.keyPhrase} »</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 text-[11px] block mb-0.5">Pourquoi le lire :</span>
                <p className="text-slate-600 leading-relaxed">{selectedBook.whyRead}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Fichier PDF :</span>
                  <span className="font-mono text-slate-800 font-bold break-all">
                    {selectedBook.pdfPath || 'Non spécifié'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Récompense Sagesse :</span>
                  <span className="font-mono text-emerald-600 font-black">
                    +{selectedBook.wisdomXpReward} XP Sagesse
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : CONFIRMATION DE RETRAIT / SUPPRESSION D'UN LIVRE */}
      {/* ========================================================================= */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-base text-slate-900">Retirer ce Livre de la Bibliothèque ?</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir retirer définitivement <strong>« {bookToDelete.title} »</strong> de la bibliothèque Osirion ? Les athlètes ne pourront plus ouvrir ce PDF ni débuter de session Focus dessus.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBook}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirmer le Retrait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5 : CONFIRMATION DE RETRAIT / SUPPRESSION D'UN AUDIO */}
      {/* ========================================================================= */}
      {audioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-base text-slate-900">Retirer cette Capsule Audio ?</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir retirer la capsule audio <strong>« {audioToDelete.title} »</strong> ({audioToDelete.durationFormatted}) ?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAudioToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAudio}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs"
              >
                Confirmer la Suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
