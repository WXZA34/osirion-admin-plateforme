import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  Receipt,
  Gift
} from 'lucide-react';
import { RevenueMetric } from '../types/admin';

interface SubscriptionsBillingManagerProps {
  metrics: RevenueMetric;
  userRole: 'superadmin' | 'auditor';
}

export const SubscriptionsBillingManager: React.FC<SubscriptionsBillingManagerProps> = ({
  metrics,
  userRole,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Abonnements & Revenus Récurrents (MRR)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des souscriptions Google Play Billing & Stripe pour l'application mobile Osirion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
            Passerelle Google Play Active
          </span>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 block">MRR (Revenu Mensuel Récurrent)</span>
          <div className="text-3xl font-bold text-slate-900">{metrics.mrr.toLocaleString()} €</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8%</span>
            <span className="text-slate-400 font-normal">vs mois précédent</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 block">ARR (Run-Rate Annuel)</span>
          <div className="text-3xl font-bold text-slate-900">{metrics.arr.toLocaleString()} €</div>
          <div className="text-xs text-slate-400">Projection sur 12 mois</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 block">Abonnés Pro Actifs</span>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalActiveSubscribers}</div>
          <div className="text-xs text-slate-500 font-medium">
            {metrics.proMonthlyCount} mensuels • {metrics.athleteAnnualCount} annuels
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 block">Taux de Conversion Free ➔ Pro</span>
          <div className="text-3xl font-bold text-emerald-700">{metrics.conversionRatePercent}%</div>
          <div className="text-xs text-slate-400">
            Churn mensuel faible : <span className="font-semibold text-slate-700">{metrics.churnRatePercent}%</span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers in Mobile App */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">
          Grille Tarifaire Active dans l'Application Android
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Free Tier */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-sm">Gratuit (Freemium)</span>
              <span className="font-bold text-slate-700">0,00 €</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Accès aux entraînements basiques, décompte de base des pompes et cartographie des spots publics.
            </p>
            <div className="pt-2 border-t border-slate-200/60 font-medium text-slate-600">
              {metrics.freeUsersCount} athlètes actifs
            </div>
          </div>

          {/* Pro Monthly */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 text-sm">Osirion Pro (Mensuel)</span>
              <span className="font-bold text-blue-700 text-base">9,99 € / mois</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Programmes avancés, arbitrage IA illimité, statistiques biomécaniques détaillées et mode hors ligne.
            </p>
            <div className="pt-2 border-t border-blue-200/60 font-semibold text-blue-800">
              {metrics.proMonthlyCount} abonnés actifs (~3 146 €/mois)
            </div>
          </div>

          {/* Athlete Annual */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 text-sm">Pass Annuel Athlète</span>
              <span className="font-bold text-emerald-700 text-base">79,99 € / an</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              2 mois offerts, accès prioritaire aux nouveaux modules de freestyle et badges d'élite.
            </p>
            <div className="pt-2 border-t border-emerald-200/60 font-semibold text-emerald-800">
              {metrics.athleteAnnualCount} abonnés annuels
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
