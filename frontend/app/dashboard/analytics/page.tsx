"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  ShieldCheck,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Store,
  ThumbsUp,
  Zap,
  Lightbulb,
  Check,
  Layers,
  ChevronRight,
  ChevronDown,
  Bot,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import {
  fetchAnalyticsDashboard,
  seedReviews,
  getCurrentUser,
  UserProfile,
  AnalyticsDashboardData,
} from '../../lib/api';

const TIMEFRAMES = [
  { key: '7days', label: 'Last 7 Days' },
  { key: '30days', label: 'Last 30 Days' },
  { key: '90days', label: 'Last 90 Days' },
  { key: '12months', label: 'Past Year' },
  { key: 'all', label: 'All Time' },
];

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#10B981', // emerald-500
  Neutral: '#F59E0B',  // amber-500
  Negative: '#EF4444', // red-500
};

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [businessId, setBusinessId] = useState<number>(1);
  const [businessName, setBusinessName] = useState<string>("Dinuka Cafe");
  const [timeframe, setTimeframe] = useState<string>("30days");

  const [dashboard, setDashboard] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sub-tabs & filters
  const [activeTrendTab, setActiveTrendTab] = useState<'rating' | 'volume' | 'sentiment'>('rating');
  const [topicFilter, setTopicFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [insightFilter, setInsightFilter] = useState<string>('all');
  const [seeding, setSeeding] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load user session
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user.businesses && user.businesses.length > 0) {
          setBusinessId(user.businesses[0].id);
          setBusinessName(user.businesses[0].name || "My Business");
        }
      } catch (err) {
        console.warn("Unauthenticated session or user profile error:", err);
      }
    }
    loadUser();
  }, []);

  // Fetch consolidated analytics dashboard
  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAnalyticsDashboard(businessId, timeframe);
      setDashboard(data);
    } catch (err: any) {
      console.error("Failed to fetch analytics dashboard:", err);
      setError(err?.message || "Failed to load analytics data from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [businessId, timeframe]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Handle Seeding if no data
  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedReviews(businessId);
      await loadAnalytics(true);
    } catch (err: any) {
      alert("Failed to seed demo reviews: " + (err?.message || "Unknown error"));
    } finally {
      setSeeding(false);
    }
  };

  // Export report to JSON
  const handleExportData = () => {
    if (!dashboard) return;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dashboard, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `analytics-report-${businessName.toLowerCase().replace(/\s+/g, '-')}-${timeframe}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice("Exported report successfully!");
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Safe variables
  const overview = dashboard?.overview;
  const ratingDist = dashboard?.rating_distribution;
  const sentimentDist = dashboard?.sentiment_distribution;
  const trends = dashboard?.trends;
  const topics = dashboard?.topics || [];
  const issues = dashboard?.issues || [];
  const replyPerf = dashboard?.reply_performance;
  const aiInsights = dashboard?.ai_insights;

  // Filtered topics
  const filteredTopics = topics.filter((t) => {
    if (topicFilter === 'positive') return t.is_positive;
    if (topicFilter === 'negative') return !t.is_positive;
    return true;
  });

  // Filtered insights
  const rawInsightCards = aiInsights?.insights || [];
  const filteredInsights = rawInsightCards.filter((ins) => {
    if (insightFilter === 'all') return true;
    return ins.insight_type.toLowerCase() === insightFilter.toLowerCase();
  });

  // Sentiment donut chart data
  const sentimentPieData = [
    { name: 'Positive', value: sentimentDist?.positive || 0, color: '#10B981' },
    { name: 'Neutral', value: sentimentDist?.neutral || 0, color: '#F59E0B' },
    { name: 'Negative', value: sentimentDist?.negative || 0, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-full bg-slate-50/60 pb-16 font-sans">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Review & Sentiment Analytics
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live AI Feed
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Real-time operational metrics, customer sentiment breakdowns & Gemini AI strategic insights
                  </p>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Business Picker if multi-business */}
              {currentUser?.businesses && currentUser.businesses.length > 1 ? (
                <div className="relative">
                  <select
                    value={businessId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setBusinessId(id);
                      const b = currentUser.businesses.find((x) => x.id === id);
                      if (b) setBusinessName(b.name);
                    }}
                    className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 pr-8 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {currentUser.businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-700 border border-slate-200/60">
                  <Store className="w-3.5 h-3.5 text-slate-500" />
                  <span>{businessName}</span>
                </div>
              )}

              {/* Timeframe Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => {
                      startTransition(() => {
                        setTimeframe(tf.key);
                      });
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      timeframe === tf.key
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => loadAnalytics(true)}
                disabled={loading || refreshing}
                className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                title="Refresh analytics data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportData}
                disabled={!dashboard}
                className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-white bg-slate-900 rounded-xl shadow-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                title="Export report to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              {exportNotice}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Failed to load analytics</p>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadAnalytics(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !dashboard ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200/80 p-5">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
            <div className="h-64 bg-white rounded-2xl border border-slate-200/80 p-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-white rounded-2xl border border-slate-200/80" />
              <div className="h-80 bg-white rounded-2xl border border-slate-200/80" />
            </div>
          </div>
        ) : !overview || overview.total_reviews === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <BarChart2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Review Analytics Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              There are no customer reviews logged for {businessName} during the selected timeframe ({timeframe}).
              You can seed sample demo reviews to explore the full suite of AI analytics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                {seeding ? "Generating Demo Reviews..." : "Seed Realistic Demo Reviews"}
              </button>
              <Link
                href="/dashboard/reviews"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                Go to Reviews
              </Link>
            </div>
          </div>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* 1. KEY KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rating Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Average Rating
                  </span>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {overview.average_rating ? overview.average_rating.toFixed(2) : "0.0"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(overview.average_rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {overview.rating_change !== null && overview.rating_change !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        overview.rating_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {overview.rating_change >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {overview.rating_change > 0 ? `+${overview.rating_change}` : overview.rating_change} vs prior
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Stable period benchmark</span>
                  )}
                  <span className="text-slate-400 font-medium">{overview.total_reviews} reviews</span>
                </div>
              </div>

              {/* Total Reviews Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Total Volume
                  </span>
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {overview.total_reviews}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">reviews logged</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
                      {overview.positive_reviews} Positive
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-200/60">
                      {overview.negative_reviews} Negative
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {overview.review_count_change !== null && overview.review_count_change !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        overview.review_count_change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {overview.review_count_change >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {overview.review_count_change > 0 ? `+${overview.review_count_change}%` : `${overview.review_count_change}%`} volume
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">{timeframe} window</span>
                  )}
                  <span className="text-slate-400 font-medium">{overview.neutral_reviews} neutral</span>
                </div>
              </div>

              {/* Reply Coverage Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Reply Coverage
                  </span>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {overview.reply_coverage_percentage}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">answered</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(overview.reply_coverage_percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {overview.unanswered_reviews} awaiting reply
                  </span>
                  <Link
                    href="/dashboard/reviews"
                    className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5"
                  >
                    Respond <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Average Response Turnaround */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Turnaround Speed
                  </span>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {replyPerf?.average_response_time_hours ? (
                        <>
                          {replyPerf.average_response_time_hours}{' '}
                          <span className="text-sm font-semibold text-slate-500">hrs</span>
                        </>
                      ) : (
                        <span className="text-xl text-slate-400 font-semibold">&lt; 6 hrs</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {replyPerf?.ai_generated_replies_count || 0} automated by AI agent
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Auto-pilot active
                  </span>
                  <span className="text-slate-400 font-medium">Fast SLA</span>
                </div>
              </div>
            </div>

            {/* 2. GEMINI AI STRATEGIC BUSINESS INSIGHTS */}
            {aiInsights && (
              <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-700/30">
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Banner Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
                        <Sparkles className="w-5 h-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            Gemini AI Business Intelligence & Action Plan
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                            Deep Synthesis
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                          Autonomous intelligence extracted from customer reviews to protect brand reputation and grow revenue.
                        </p>
                      </div>
                    </div>
                    {aiInsights.generated_at && (
                      <span className="text-xs text-slate-400 font-medium self-start sm:self-center">
                        Updated {new Date(aiInsights.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Executive Summary */}
                  {aiInsights.executive_summary && (
                    <div className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
                      <div className="flex items-start gap-3">
                        <Activity className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">
                            Executive Brand Health Summary
                          </h4>
                          <p className="text-sm text-slate-200 leading-relaxed">
                            {aiInsights.executive_summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3 Pillars: Strengths, Areas for Improvement, Action Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Strengths */}
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Core Strengths</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {aiInsights.key_strengths && aiInsights.key_strengths.length > 0 ? (
                          aiInsights.key_strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span className="leading-snug">{str}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">High in-store satisfaction reported.</li>
                        )}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Friction Points</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {aiInsights.areas_for_improvement && aiInsights.areas_for_improvement.length > 0 ? (
                          aiInsights.areas_for_improvement.map((area, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              <span className="leading-snug">{area}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">No major recurring friction points found.</li>
                        )}
                      </ul>
                    </div>

                    {/* Recommended Actions */}
                    <div className="bg-indigo-950/40 border border-indigo-400/30 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-3">
                        <Lightbulb className="w-4 h-4" />
                        <span>Action Steps</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {aiInsights.recommended_actions && aiInsights.recommended_actions.length > 0 ? (
                          aiInsights.recommended_actions.map((act, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold text-indigo-400 shrink-0">{idx + 1}.</span>
                              <span className="leading-snug">{act}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400">Maintain current high service standards.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Detailed AI Insight Cards */}
                  {rawInsightCards.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Granular Intelligence Findings ({rawInsightCards.length})
                        </h4>
                        {/* Filter pills */}
                        <div className="flex items-center gap-1.5">
                          {['all', 'alert', 'weakness', 'strength', 'opportunity'].map((flt) => (
                            <button
                              key={flt}
                              onClick={() => setInsightFilter(flt)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                insightFilter === flt
                                  ? 'bg-white text-slate-900'
                                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
                              }`}
                            >
                              {flt.charAt(0).toUpperCase() + flt.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInsights.map((card, i) => {
                          const isAlert = card.insight_type === 'alert' || card.priority === 'high';
                          const isStrength = card.insight_type === 'strength';

                          return (
                            <div
                              key={card.id || i}
                              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 transition group"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {card.category}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      card.priority === 'high'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : card.priority === 'medium'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                  >
                                    {card.priority} Priority
                                  </span>
                                </div>
                                <h5 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-200 transition">
                                  {card.title}
                                </h5>
                                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                  {card.description}
                                </p>
                              </div>

                              {card.actionable_recommendation && (
                                <div className="mt-2 pt-3 border-t border-white/10 bg-black/20 p-2.5 rounded-xl">
                                  <p className="text-[11px] text-indigo-300 font-semibold mb-0.5 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-indigo-400" /> AI Recommendation
                                  </p>
                                  <p className="text-xs text-slate-200 leading-snug">
                                    {card.actionable_recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. TIME-SERIES TRENDS & VOLUME CHARTS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Historical Performance & Trend Analysis
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track rating evolution, review intake cadence, and sentiment shifts across {timeframe}
                  </p>
                </div>

                {/* Tab switchers */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTrendTab('rating')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTrendTab === 'rating'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rating Trend
                  </button>
                  <button
                    onClick={() => setActiveTrendTab('volume')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTrendTab === 'volume'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Volume Comparison
                  </button>
                  <button
                    onClick={() => setActiveTrendTab('sentiment')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      activeTrendTab === 'sentiment'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sentiment Shift
                  </button>
                </div>
              </div>

              {/* Chart Body */}
              <div className="h-72 w-full">
                {activeTrendTab === 'rating' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends?.rating_trends || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis
                        domain={[1, 5]}
                        stroke="#94A3B8"
                        fontSize={11}
                        tickLine={false}
                        ticks={[1, 2, 3, 4, 5]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${Number(val).toFixed(2)} ★`, 'Average Rating']}
                      />
                      <Area
                        type="monotone"
                        dataKey="average_rating"
                        stroke="#6366F1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#ratingGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {activeTrendTab === 'volume' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trends?.volume_trends || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                      />
                      <Bar dataKey="current" name="Current Period" fill="#6366F1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="previous" name="Prior Comparison" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {activeTrendTab === 'sentiment' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends?.sentiment_trends || []}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="positive"
                        name="Positive"
                        stackId="1"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="neutral"
                        name="Neutral"
                        stackId="1"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="negative"
                        name="Negative"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.8}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* 4. SENTIMENT DISTRIBUTION & STAR BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Donut & Emotions */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Sentiment Health & Emotion Cloud
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Deep NLP classification of customer sentiments
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
                      {sentimentDist?.total_analyzed || 0} reviews analyzed
                    </span>
                  </div>

                  {/* Chart and Legend */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 my-6">
                    <div className="h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sentimentPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {sentimentPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderRadius: '12px',
                              border: 'none',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Positive Sentiment
                        </span>
                        <div className="font-bold text-slate-900">
                          {sentimentDist?.positive_percentage}%{' '}
                          <span className="text-slate-400 font-normal">({sentimentDist?.positive})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Neutral Sentiment
                        </span>
                        <div className="font-bold text-slate-900">
                          {sentimentDist?.neutral_percentage}%{' '}
                          <span className="text-slate-400 font-normal">({sentimentDist?.neutral})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          Negative Sentiment
                        </span>
                        <div className="font-bold text-slate-900">
                          {sentimentDist?.negative_percentage}%{' '}
                          <span className="text-slate-400 font-normal">({sentimentDist?.negative})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emotion Tags */}
                {sentimentDist?.emotions && sentimentDist.emotions.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                      Detected Customer Emotional States
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sentimentDist.emotions.map((em, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <span className="capitalize">{em.emotion}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {em.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Star Rating Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Rating Distribution Breakdown
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Detailed volume proportion from 5-star to 1-star
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {ratingDist?.average_rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-xs text-slate-400 block">Avg Star</span>
                    </div>
                  </div>

                  {/* Star Progress Bars */}
                  <div className="space-y-4 my-6">
                    {(ratingDist?.items || []).map((starItem) => {
                      return (
                        <div key={starItem.rating} className="flex items-center gap-3 text-xs">
                          <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                            {starItem.rating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </span>

                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-amber-400 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${starItem.percentage}%` }}
                            />
                          </div>

                          <div className="w-20 text-right">
                            <span className="font-bold text-slate-900">{starItem.count}</span>
                            <span className="text-slate-400 font-normal ml-1">({starItem.percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Reviews rated 4 or 5 stars</span>
                  <span className="font-bold text-emerald-600">
                    {ratingDist
                      ? Math.round(
                          (((ratingDist.star_4 || 0) + (ratingDist.star_5 || 0)) /
                            (ratingDist.total_reviews || 1)) *
                            100
                        )
                      : 0}
                    % positive ratings
                  </span>
                </div>
              </div>
            </div>

            {/* 5. TOPICS & CUSTOMER PAIN POINTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recurring Topics */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Customer Discussion Topics
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Most frequently mentioned themes across reviews
                    </p>
                  </div>
                  {/* Topic filter tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setTopicFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                        topicFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTopicFilter('positive')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                        topicFilter === 'positive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Positive
                    </button>
                    <button
                      onClick={() => setTopicFilter('negative')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                        topicFilter === 'negative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Negative
                    </button>
                  </div>
                </div>

                {filteredTopics.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTopics.map((top, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              top.is_positive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900">{top.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              top.is_positive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {top.sentiment || (top.is_positive ? 'Positive' : 'Negative')}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-900">{top.count} mentions</span>
                          <span className="text-[10px] text-slate-400 block">{top.percentage}% of reviews</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No matching topics found for this filter.
                  </div>
                )}
              </div>

              {/* Customer Pain Points & Issues */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Customer Pain Points & Operational Issues
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Friction areas ranked by occurrence and severity
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200/60">
                    {issues.length} Issues Detected
                  </span>
                </div>

                {issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.map((iss, idx) => {
                      const isHigh = iss.severity === 'high';
                      const isMedium = iss.severity === 'medium';

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <AlertCircle
                              className={`w-4 h-4 shrink-0 ${
                                isHigh ? 'text-rose-500' : isMedium ? 'text-amber-500' : 'text-slate-400'
                              }`}
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{iss.issue}</p>
                              <span className="text-[10px] text-slate-400">Status: {iss.status || 'open'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isHigh
                                  ? 'bg-rose-100 text-rose-800'
                                  : isMedium
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {iss.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-700 w-12 text-right">
                              {iss.count}x
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No critical issues reported in this period. Great job!
                  </div>
                )}
              </div>
            </div>

            {/* 6. REPLY PERFORMANCE BY STAR RATING TIERS */}
            {replyPerf && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Response Performance by Customer Tier
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ensure prompt responses to critical 1-2 star reviews to mitigate customer churn
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                      AI Generated: {replyPerf.ai_generated_replies_count}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                      Manual: {replyPerf.manual_replies_count}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(replyPerf.rating_tier_breakdown || []).map((tier, idx) => {
                    const isCritical = tier.rating_group.includes("1-2");
                    const isPositive = tier.rating_group.includes("4-5");

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCritical
                            ? 'bg-rose-50/40 border-rose-200/70 hover:border-rose-300'
                            : isPositive
                            ? 'bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300'
                            : 'bg-slate-50/60 border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-xs font-bold ${
                              isCritical ? 'text-rose-900' : isPositive ? 'text-emerald-900' : 'text-slate-900'
                            }`}
                          >
                            {tier.rating_group}
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                              isCritical
                                ? 'bg-rose-200 text-rose-800'
                                : isPositive
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {tier.response_rate}% answered
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                          <div className="flex justify-between">
                            <span>Total Inflow:</span>
                            <span className="font-semibold text-slate-900">{tier.total_reviews} reviews</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Answered:</span>
                            <span className="font-semibold text-emerald-600">{tier.replied_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unanswered:</span>
                            <span className="font-semibold text-rose-600">{tier.unreplied_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Turnaround:</span>
                            <span className="font-semibold text-slate-900">
                              {tier.avg_response_hours ? `${tier.avg_response_hours} hrs` : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Direct action link */}
                        {tier.unreplied_count > 0 && (
                          <Link
                            href="/dashboard/reviews"
                            className="w-full mt-2 py-2 px-3 bg-white border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-800 hover:bg-slate-100 transition block shadow-2xs"
                          >
                            Respond to {tier.unreplied_count} Pending
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
