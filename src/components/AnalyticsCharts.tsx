import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Award,
  Zap,
  Calendar,
  Layers,
  MapPin,
  Flame,
  CheckCircle2,
  Clock,
  UserCheck,
  Info,
  Filter
} from 'lucide-react';
import { CurrentArcBanner } from './CurrentArcBanner';

interface RetentionPoint {
  dayLabel: string;
  dayNumber: number;
  retentionRate: number; // percentage (0-100)
  benchmarkRate: number; // industry fitness avg
  activeCount: number;
  annotation?: string;
}

interface CohortRow {
  cohortName: string;
  totalUsers: number;
  d1: number;
  d7: number;
  d14: number;
  d30: number | null; // null if ongoing
}

export const AnalyticsCharts: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'year'>('7d');
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'recent' | 'veterans'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<RetentionPoint | null>(null);

  const activeAthletesNow = 142;
  const totalRepsToday = 38450;
  const activeDuelsCount = 18;
  const contestedHexagons = 34;

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const pushupsData = [3400, 4200, 3900, 5100, 5800, 7200, 6800];
  const squatsData = [2800, 3100, 3400, 4100, 4600, 5900, 5300];
  const maxRepValue = 8000;

  // Retention Data Points (J0 à J30)
  const retentionCurveData: RetentionPoint[] = [
    { dayLabel: 'J0 (Inscription)', dayNumber: 0, retentionRate: 100, benchmarkRate: 100, activeCount: 1250 },
    { dayLabel: 'J1 (+24h)', dayNumber: 1, retentionRate: 68.4, benchmarkRate: 46.0, activeCount: 855, annotation: 'Premier entraînement guidé' },
    { dayLabel: 'J3 (+72h)', dayNumber: 3, retentionRate: 54.2, benchmarkRate: 35.5, activeCount: 677 },
    { dayLabel: 'J7 (+1 semaine)', dayNumber: 7, retentionRate: 42.8, benchmarkRate: 26.0, activeCount: 535, annotation: 'Palier 1ère série de 7 jours (Streak)' },
    { dayLabel: 'J14 (+2 semaines)', dayNumber: 14, retentionRate: 33.6, benchmarkRate: 19.5, activeCount: 420 },
    { dayLabel: 'J21 (+3 semaines)', dayNumber: 21, retentionRate: 28.5, benchmarkRate: 16.0, activeCount: 356 },
    { dayLabel: 'J30 (+1 mois)', dayNumber: 30, retentionRate: 24.8, benchmarkRate: 13.5, activeCount: 310, annotation: 'Athlètes fidélisés dans un Clan' },
  ];

  // Cohort Heatmap Data
  const cohortTableData: CohortRow[] = [
    { cohortName: 'Semaine 38 (Actuelle)', totalUsers: 340, d1: 72.1, d7: 46.5, d14: 35.0, d30: null },
    { cohortName: 'Semaine 37 (15-21 Sept)', totalUsers: 315, d1: 70.4, d7: 44.8, d14: 34.2, d30: null },
    { cohortName: 'Semaine 36 (08-14 Sept)', totalUsers: 290, d1: 67.8, d7: 42.1, d14: 33.0, d30: 25.4 },
    { cohortName: 'Semaine 35 (01-07 Sept)', totalUsers: 305, d1: 66.5, d7: 41.2, d14: 31.8, d30: 24.2 },
    { cohortName: 'Moyenne Globale Osirion', totalUsers: 1250, d1: 68.4, d7: 42.8, d14: 33.6, d30: 24.8 },
  ];

  // Helper for SVG curve coordinates (Width: 800, Height: 220, Padding: 40)
  const svgWidth = 800;
  const svgHeight = 220;
  const padLeft = 50;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (index: number) => padLeft + (index / (retentionCurveData.length - 1)) * chartW;
  const getY = (rate: number) => padTop + (1 - rate / 100) * chartH;

  // Build SVG path strings
  const osirionPath = retentionCurveData.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.retentionRate);
    if (i === 0) return `M ${x},${y}`;
    // Bezier control points for smooth line
    const prevX = getX(i - 1);
    const prevY = getY(retentionCurveData[i - 1].retentionRate);
    const cpX1 = prevX + (x - prevX) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
  }, '');

  const areaPath = `${osirionPath} L ${getX(retentionCurveData.length - 1)},${getY(0)} L ${getX(0)},${getY(0)} Z`;

  const benchmarkPath = retentionCurveData.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.benchmarkRate);
    if (i === 0) return `M ${x},${y}`;
    const prevX = getX(i - 1);
    const prevY = getY(retentionCurveData[i - 1].benchmarkRate);
    const cpX1 = prevX + (x - prevX) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1},${prevY} ${cpX2},${y} ${x},${y}`;
  }, '');

  return (
    <div className="space-y-6">
      {/* Bannière Officielle : L'Arc en cours, Chrono temps réel & Objectifs */}
      <CurrentArcBanner />

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Athlètes actifs</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              En direct
            </span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
            {activeAthletesNow}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.2%</span>
            <span className="text-slate-400 font-normal">vs semaine dernière</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Répétitions validées IA (Dojo)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
            {totalRepsToday.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4%</span>
            <span className="text-slate-400 font-normal">score ROM moyen 92/100</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Duels 1v1 synchronisés</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
            {activeDuelsCount}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Durée moyenne 2m 14s</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Secteurs H3 sous contrôle</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900 mt-2">
            {contestedHexagons}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
            <span>4 clans en compétition active</span>
          </div>
        </div>
      </div>

      {/* --- NOUVEAU WIDGET : COURBE D'ANALYSE DE RÉTENTION (J1, J7, J30) --- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Header & Cohort Selection */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                Courbe d'Analyse de Rétention (J1, J7, J30)
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                Cohortes Athlètes
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pourcentage d'athlètes revenant s'entraîner après leur date de première ouverture de l'application
            </p>
          </div>

          {/* Quick Metrics Badges (J1, J7, J30) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rétention J1
              </span>
              <span className="text-base font-bold text-slate-900 block mt-0.5">
                68.4%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                +22.4% vs marché
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                Rétention J7
              </span>
              <span className="text-base font-bold text-blue-700 block mt-0.5">
                42.8%
              </span>
              <span className="text-[10px] text-blue-600 font-medium">
                Palier 1ère série
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Rétention J30
              </span>
              <span className="text-base font-bold text-emerald-700 block mt-0.5">
                24.8%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Athlètes fidèles
              </span>
            </div>
          </div>
        </div>

        {/* Legend & Benchmarks */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 gap-2">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded bg-blue-600 inline-block"></span>
              <span className="font-semibold text-slate-800">Osirion (Clan & Streak Engine)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-slate-400 inline-block"></span>
              <span>Benchmark moyen des apps Fitness (13.5% à J30)</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Survolez un point de la courbe pour inspecter les métriques</span>
          </div>
        </div>

        {/* SVG Retention Curve Chart */}
        <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-64 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (100%, 75%, 50%, 25%, 0%) */}
            {[100, 75, 50, 25, 0].map((rate) => {
              const y = getY(rate);
              return (
                <g key={rate}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={rate === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono font-medium"
                  >
                    {rate}%
                  </text>
                </g>
              );
            })}

            {/* Shaded Area under Osirion Curve */}
            <path d={areaPath} fill="url(#retentionGradient)" />

            {/* Industry Benchmark Line (Dashed) */}
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Osirion Retention Curve Line */}
            <path
              d={osirionPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points on Osirion Curve */}
            {retentionCurveData.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.retentionRate);
              const isKey = pt.dayNumber === 1 || pt.dayNumber === 7 || pt.dayNumber === 30;
              const isHovered = hoveredPoint?.dayNumber === pt.dayNumber;

              return (
                <g
                  key={pt.dayNumber}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Subtle target circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 8 : isKey ? 6 : 4.5}
                    className={`transition-all duration-150 ${
                      isKey ? 'fill-blue-600 stroke-white' : 'fill-white stroke-blue-600'
                    }`}
                    strokeWidth={isHovered ? 3.5 : 2.5}
                  />

                  {/* Percentage label above key points */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isKey ? 'fill-blue-700' : 'fill-slate-600'
                    }`}
                  >
                    {pt.retentionRate}%
                  </text>

                  {/* Day Label on X Axis */}
                  <text
                    x={cx}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-semibold ${
                      isKey ? 'fill-slate-900 font-bold' : 'fill-slate-400'
                    }`}
                  >
                    {pt.dayNumber === 0 ? 'J0' : `J${pt.dayNumber}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip details if hovered */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1 pointer-events-none animate-in fade-in zoom-in-95 duration-100 max-w-xs">
              <div className="font-semibold text-blue-300 flex items-center justify-between gap-4">
                <span>{hoveredPoint.dayLabel}</span>
                <span className="text-white font-bold">{hoveredPoint.retentionRate}%</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Athlètes actifs : <strong className="text-white">{hoveredPoint.activeCount}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Benchmark marché : {hoveredPoint.benchmarkRate}% (Différence : +
                {(hoveredPoint.retentionRate - hoveredPoint.benchmarkRate).toFixed(1)}%)
              </div>
              {hoveredPoint.annotation && (
                <div className="text-[10px] text-emerald-400 font-medium pt-1 border-t border-slate-800">
                  ⚡ {hoveredPoint.annotation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cohort Retention Table Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Matrice de Rétention par Cohorte Hebdomadaire
            </h4>
            <span className="text-[11px] text-slate-400">
              Mise à jour en temps réel via événements d'activité Firebase
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-slate-700">Cohorte d'inscription</th>
                  <th className="py-2.5 px-3">Athlètes</th>
                  <th className="py-2.5 px-3 font-semibold text-blue-700">J1 (+24h)</th>
                  <th className="py-2.5 px-3 font-semibold text-blue-700">J7 (+7j)</th>
                  <th className="py-2.5 px-3">J14 (+14j)</th>
                  <th className="py-2.5 px-3 font-semibold text-emerald-700">J30 (+30j)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cohortTableData.map((row, i) => {
                  const isAvg = i === cohortTableData.length - 1;
                  return (
                    <tr key={row.cohortName} className={isAvg ? 'bg-slate-50/80 font-semibold' : 'hover:bg-slate-50/50'}>
                      <td className="py-2.5 px-4 text-slate-900">{row.cohortName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{row.totalUsers}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md font-medium bg-blue-50 text-blue-700">
                          {row.d1}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md font-medium bg-blue-100/70 text-blue-800">
                          {row.d7}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700">
                          {row.d14}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.d30 !== null ? (
                          <span className="inline-block px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700">
                            {row.d30}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">En cours</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Chart Card (Stripe-like Minimalist Bar Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Volume hebdomadaire des mouvements analysés
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Répétitions certifiées par le modèle Google ML Kit Pose Detection sur Android
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Pompes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-200"></span>
                Squats & Dips
              </span>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
              {(['24h', '7d', '30d', 'year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    timeRange === r
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clean Bar Chart */}
        <div className="h-60 w-full pt-4 flex items-end justify-between gap-4 border-b border-slate-100 pb-2">
          {weekDays.map((day, idx) => {
            const pushupHeight = (pushupsData[idx] / maxRepValue) * 100;
            const squatHeight = (squatsData[idx] / maxRepValue) * 100;
            return (
              <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2 font-medium">
                  {(pushupsData[idx] + squatsData[idx]).toLocaleString()}
                </div>
                <div className="w-full flex items-end justify-center gap-1.5 h-full max-h-44">
                  {/* Pushups */}
                  <div
                    style={{ height: `${pushupHeight}%` }}
                    className="w-full max-w-[14px] bg-blue-600 rounded-t-sm transition-all duration-200 group-hover:bg-blue-700"
                    title={`${day}: ${pushupsData[idx]} pompes`}
                  />
                  {/* Squats */}
                  <div
                    style={{ height: `${squatHeight}%` }}
                    className="w-full max-w-[14px] bg-indigo-200 rounded-t-sm transition-all duration-200 group-hover:bg-indigo-300"
                    title={`${day}: ${squatsData[idx]} squats`}
                  />
                </div>
                <span className="text-xs text-slate-500 mt-3 font-medium">
                  {day.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Cards: DualBalance & Territorial Dominance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clan Dominance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Contrôle des Bastions par Clan
            </h3>
            <span className="text-xs text-slate-400 font-medium">35 spots recensés</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1.5">
                <span>Légion Noire</span>
                <span className="text-slate-900 font-semibold">14 bastions (40.0%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1.5">
                <span>Valkyries Primordiales</span>
                <span className="text-slate-900 font-semibold">11 bastions (31.4%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '31.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1.5">
                <span>Ombres du Dojo</span>
                <span className="text-slate-900 font-semibold">6 bastions (17.1%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17.1%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-medium mb-1.5">
                <span>Philosophes Guerriers</span>
                <span className="text-slate-900 font-semibold">4 bastions (11.5%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '11.5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* DualBalance Physical vs Mental */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Équilibre Global : Force physique vs Sagesse
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
              DualBalance Engine
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Distribution globale de l'expérience entre les entraînements physiques (pompes, tractions, sprints) 
            et le renforcement mental (lectures philosophiques, respiration, audio du Sanctuaire).
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-blue-600">Force physique (68%)</span>
              <span className="text-amber-600">Sagesse & Mental (32%)</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-600" style={{ width: '68%' }} title="Force (68%)"></div>
              <div className="h-full bg-amber-400" style={{ width: '32%' }} title="Sagesse (32%)"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Dojo IA + Colisée 1v1</span>
              <span>Sanctuaire + Méditation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

