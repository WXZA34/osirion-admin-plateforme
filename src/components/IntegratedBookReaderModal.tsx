import React, { useState, useEffect, useRef } from 'react';
import { LibraryBook } from '../types/library';
import { BOOK_CONTENTS_DATABASE, BookChapter } from '../data/bookContentData';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Type,
  Sun,
  Moon,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  FileText,
  Check,
} from 'lucide-react';

interface IntegratedBookReaderModalProps {
  book: LibraryBook;
  onClose: () => void;
}

export const IntegratedBookReaderModal: React.FC<IntegratedBookReaderModalProps> = ({
  book,
  onClose,
}) => {
  const content = BOOK_CONTENTS_DATABASE[book.id] || {
    bookId: book.id,
    title: book.title,
    author: book.author,
    summary: book.whyRead || 'Ouvrage classique de la Bibliothèque Osirion.',
    chapters: [
      {
        id: 'chap_intro',
        title: 'Chapitre I : Les Principes Cardinaux',
        subtitle: book.theme || 'Enseignement fondamental',
        content: [
          `« ${book.keyPhrase || 'La discipline est le seul pont entre les objectifs et les accomplissements.'} »`,
          book.whyRead || 'Cet ouvrage s’inscrit au cœur de la doctrine stoïcienne et de la préparation mentale de l’athlète.',
          'Consacrez chaque jour un temps de silence et de lecture active. L’entraînement de l’esprit renforce la fermeté du geste athlétique.',
          'Chaque répétition physique puise sa force dans la clarté de la pensée. Méditez ces maximes avant vos séances d’échauffement.',
        ],
      },
      {
        id: 'chap_action',
        title: 'Chapitre II : L’Épreuve et la Transmutation',
        subtitle: 'Forger la volonté',
        content: [
          'Face à l’épuisement physique, l’esprit hésite. C’est à cet instant précis que la philosophie devient une arme vivante.',
          'Ne fuyez pas l’effort ardu ; allez à sa rencontre comme l’acier vers le feu.',
          'Le sage ne mesure pas sa vie au confort qu’il a reçu, mais aux tempêtes qu’il a su traverser avec dignité.',
        ],
      },
    ],
  };

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [themeMode, setThemeMode] = useState<'parchment' | 'dark' | 'clean'>('parchment');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [viewPdfMode, setViewPdfMode] = useState(!!book.pdfPath);
  const [showToc, setShowToc] = useState(false);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentChapter = content.chapters[currentChapterIndex] || content.chapters[0];

  // Speech synthesis narrator for reading aloud inside the app
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleNarrator = () => {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n’est pas supportée sur ce navigateur.');
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = [
        currentChapter.title,
        currentChapter.subtitle || '',
        ...currentChapter.content,
      ].join('. ');

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.pitch = 0.95;

      utterance.onend = () => {
        setIsNarrating(false);
      };
      utterance.onerror = () => {
        setIsNarrating(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  const handleSaveBookmark = () => {
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2500);
  };

  const getThemeClasses = () => {
    switch (themeMode) {
      case 'dark':
        return 'bg-slate-950 text-slate-200 border-slate-800';
      case 'clean':
        return 'bg-white text-slate-900 border-slate-200';
      case 'parchment':
      default:
        return 'bg-[#fbf7ee] text-[#2c2214] border-amber-200/80';
    }
  };

  const getReaderSurfaceClasses = () => {
    switch (themeMode) {
      case 'dark':
        return 'bg-slate-900/90 text-slate-100 border-slate-800 shadow-2xl';
      case 'clean':
        return 'bg-slate-50 text-slate-900 border-slate-200 shadow-md';
      case 'parchment':
      default:
        return 'bg-[#f6eee0] text-[#251d10] border-amber-200/70 shadow-lg';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      } bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200`}
    >
      <div
        className={`w-[98vw] ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl'
        } ${getThemeClasses()} border shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* TOP TOOLBAR */}
        <header className="px-4 py-3 border-b border-inherit flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm truncate flex items-center gap-2">
                <span>{book.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  {book.arc}
                </span>
              </h3>
              <p className="text-[11px] opacity-70 truncate">{book.author} • Lecteur Intégré Osirion</p>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Table of Contents Button */}
            <button
              onClick={() => setShowToc(!showToc)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                showToc
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'
              }`}
              title="Table des matières"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sommaire</span>
            </button>

            {/* PDF Viewer Toggle */}
            {book.pdfPath && (
              <button
                onClick={() => setViewPdfMode(!viewPdfMode)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewPdfMode
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'
                }`}
                title={viewPdfMode ? 'Revenir au texte' : 'Voir le PDF original'}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{viewPdfMode ? 'Fermer le PDF' : 'Lire le PDF original'}</span>
              </button>
            )}

            {/* Read Aloud TTS Narrator */}
            <button
              onClick={toggleNarrator}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isNarrating
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 dark:text-amber-300'
              }`}
              title={isNarrating ? 'Mettre en pause la lecture vocale' : 'Écouter la lecture vocale dans le site'}
            >
              {isNarrating ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isNarrating ? 'Lecture en cours' : 'Écouter'}</span>
            </button>

            {/* Theme Swapper */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-xl">
              <button
                onClick={() => setThemeMode('parchment')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  themeMode === 'parchment' ? 'bg-amber-200 text-amber-900 shadow-xs' : 'opacity-60'
                }`}
                title="Thème Parchemin Ancien"
              >
                📜
              </button>
              <button
                onClick={() => setThemeMode('clean')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  themeMode === 'clean' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-60'
                }`}
                title="Thème Clair Moderne"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  themeMode === 'dark' ? 'bg-slate-800 text-amber-300 shadow-xs' : 'opacity-60'
                }`}
                title="Thème Nuit Sombre"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Size Adjuster */}
            <button
              onClick={() => {
                if (fontSize === 'sm') setFontSize('base');
                else if (fontSize === 'base') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('xl');
                else setFontSize('sm');
              }}
              className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 text-xs font-bold font-mono"
              title="Ajuster la taille de police"
            >
              A{fontSize === 'xl' ? '++' : fontSize === 'lg' ? '+' : ''}
            </button>

            {/* Font Family Switcher */}
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10 text-xs font-bold font-mono"
              title="Changer de police"
            >
              {fontFamily === 'serif' ? 'Serif' : 'Sans'}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/10"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition"
              title="Fermer le lecteur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* TABLE OF CONTENTS DRAWER */}
          {showToc && (
            <div className="w-72 border-r border-inherit bg-black/5 dark:bg-white/5 p-4 overflow-y-auto space-y-3 shrink-0 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <span className="font-bold text-xs uppercase tracking-wider">Table des Matières</span>
                <button onClick={() => setShowToc(false)} className="opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {content.chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setShowToc(false);
                      if (isNarrating && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setIsNarrating(false);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition text-xs font-medium ${
                      idx === currentChapterIndex
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold truncate">{chap.title}</div>
                    {chap.subtitle && (
                      <div className="text-[10px] opacity-75 truncate">{chap.subtitle}</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Book Info in Drawer */}
              <div className="mt-6 pt-4 border-t border-inherit space-y-2 text-[11px] opacity-80">
                <div>Pages : <strong>{book.pageCount}</strong></div>
                <div>XP Sagesse : <strong className="text-emerald-600">+{book.wisdomXpReward}</strong></div>
                <div>Fichier source : <span className="font-mono text-[10px] break-all">{book.pdfPath}</span></div>
              </div>
            </div>
          )}

          {/* READING CANVAS */}
          <div className={`flex-1 overflow-y-auto ${viewPdfMode ? 'p-2 sm:p-4' : 'p-4 sm:p-8'} flex justify-center bg-black/5 dark:bg-white/5`}>
            {viewPdfMode && book.pdfPath ? (
              <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/50 shadow-xl flex flex-col items-center justify-center">
                <iframe src={`${book.pdfPath.startsWith('http') ? book.pdfPath : `/${book.pdfPath.replace(/^\/?/, '')}`}#view=Fit&navpanes=0`} className="w-full h-full border-0" title={book.title} />
              </div>
            ) : (
            <div
              className={`w-full max-w-3xl ${getReaderSurfaceClasses()} rounded-3xl p-6 sm:p-10 border my-auto transition-all`}
            >
              {/* Chapter Header */}
              <div className="border-b border-inherit/40 pb-5 mb-6 text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {book.title} • {book.author}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentChapter.title}</h1>
                {currentChapter.subtitle && (
                  <p className="text-xs sm:text-sm italic opacity-75 font-serif">
                    « {currentChapter.subtitle} »
                  </p>
                )}
              </div>

              {/* Chapter Paragraphs */}
              <div
                className={`space-y-5 leading-relaxed ${
                  fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                } ${
                  fontSize === 'sm'
                    ? 'text-xs'
                    : fontSize === 'base'
                    ? 'text-sm sm:text-base'
                    : fontSize === 'lg'
                    ? 'text-base sm:text-lg'
                    : 'text-lg sm:text-xl'
                }`}
              >
                {currentChapter.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-justify indent-4 leading-loose tracking-wide first-letter:text-2xl first-letter:font-black first-letter:float-left first-letter:mr-2"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Bottom Quote & Bookmark */}
              <div className="mt-10 pt-6 border-t border-inherit/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75">
                <button
                  onClick={handleSaveBookmark}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {bookmarkSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Marque-page enregistré !</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Poser un Marque-Page</span>
                    </>
                  )}
                </button>

                <div className="font-mono text-[11px]">
                  Chapitre {currentChapterIndex + 1} sur {content.chapters.length} • {book.arc}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* BOTTOM PAGINATION FOOTER */}
        <footer className="px-4 py-3 border-t border-inherit flex items-center justify-between gap-3 shrink-0 bg-black/5 dark:bg-black/30">
          <button
            onClick={() => {
              if (currentChapterIndex > 0) {
                setCurrentChapterIndex(currentChapterIndex - 1);
                if (isNarrating && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsNarrating(false);
                }
              }
            }}
            disabled={currentChapterIndex === 0}
            className="px-3 sm:px-4 py-2 rounded-xl border border-inherit font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Chapitre Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </button>

          {/* Slider or Stepper */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold">{currentChapterIndex + 1}</span>
            <span className="opacity-50">/</span>
            <span>{content.chapters.length}</span>
          </div>

          <button
            onClick={() => {
              if (currentChapterIndex < content.chapters.length - 1) {
                setCurrentChapterIndex(currentChapterIndex + 1);
                if (isNarrating && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsNarrating(false);
                }
              }
            }}
            disabled={currentChapterIndex === content.chapters.length - 1}
            className="px-3 sm:px-4 py-2 rounded-xl border border-inherit font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          >
            <span className="hidden sm:inline">Chapitre Suivant</span>
            <span className="sm:hidden">Suiv.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};
