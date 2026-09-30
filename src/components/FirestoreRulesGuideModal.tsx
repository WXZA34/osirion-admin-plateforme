import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Database,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface FirestoreRulesGuideModalProps {
  onClose: () => void;
  onRetryTest: () => Promise<void>;
  isTesting: boolean;
}

export const FirestoreRulesGuideModal: React.FC<FirestoreRulesGuideModalProps> = ({
  onClose,
  onRetryTest,
  isTesting,
}) => {
  const [copiedRule, setCopiedRule] = useState(false);

  const exactRuleSnippet = `// Règles Firestore pour autoriser la transmission du jour et la configuration
match /global_config/{document=**} {
  allow read, write: if true;
}

match /daily_transmissions/{document=**} {
  allow read, write: if true;
}`;

  const fullRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collections existantes
    match /users/{document=**} { allow read, write: if true; }
    match /exercises/{document=**} { allow read, write: if true; }
    match /bastions/{document=**} { allow read, write: if true; }
    match /library_books/{document=**} { allow read, write: if true; }
    match /library_audios/{document=**} { allow read, write: if true; }

    // Indispensable pour la Transmission du Jour :
    match /global_config/{document=**} {
      allow read, write: if true;
    }
    match /daily_transmissions/{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Débloquer l’Écriture Firebase Firestore</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  permission-denied
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Projet Firebase : valerion-55414</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Diagnostic Box */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-2">
            <div className="font-bold flex items-center gap-2 text-rose-300">
              <span>Pourquoi la base de données n'a pas reçu le changement ?</span>
            </div>
            <p className="text-slate-300">
              Firebase a retourné le code <code>permission-denied</code>. Par défaut, Firestore bloque toute écriture sur la collection <code>global_config</code> tant qu’une règle de sécurité ne l’autorise pas expressément.
            </p>
          </div>

          {/* Quick Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Procédure en 3 étapes simples (30 secondes) :
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="font-bold text-xs text-white block">
                  Ouvrir l’onglet « Règles » de votre Firestore
                </span>
                <p className="text-[11px] text-slate-300">
                  Rendez-vous dans la console Firebase sur votre projet <strong>valerion-55414</strong> :
                </p>
                <a
                  href="https://console.firebase.google.com/project/valerion-55414/firestore/rules"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline mt-1"
                >
                  <span>Accéder directement aux Règles Firestore</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">
                    Ajouter la règle pour <code>global_config</code>
                  </span>
                  <button
                    onClick={() => handleCopy(exactRuleSnippet)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                  >
                    {copiedRule ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRule ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {exactRuleSnippet}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs text-white block">
                  Cliquer sur « Publier » (Publish)
                </span>
                <p className="text-[11px] text-slate-300">
                  Une fois la règle collée, cliquez sur le bouton bleu <strong>Publier</strong> en haut à droite dans Firebase Console. Le changement s'applique immédiatement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => handleCopy(fullRulesTemplate)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-semibold"
          >
            Copier les règles complètes
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex-1 sm:flex-none"
            >
              Fermer
            </button>

            <button
              onClick={onRetryTest}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 flex-1 sm:flex-none disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Test en cours...' : 'Tester la Synchronisation Maintenant'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
