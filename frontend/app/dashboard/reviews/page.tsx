"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchReviews,
  seedReviews,
  fetchReviewStats,
  generateReviewReply,
  editReviewReply,
  approveReviewReply,
  rejectReviewReply,
  getCurrentUser,
  UserProfile,
  ReviewItem,
  ReviewStats as ApiReviewStats,
} from '../../lib/api';
import {
  Search,
  ChevronDown,
  Download,
  MessageSquare,
  ThumbsUp,
  Minus,
  AlertTriangle,
  RefreshCcw,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2,
  Clock,
  PenLine,
  Send,
  Loader2,
  LogIn,
  ShieldCheck,
  Check,
  XCircle,
  Copy
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [businessId, setBusinessId] = useState<number>(1);
  const [businessName, setBusinessName] = useState<string>("Dinuka Cafe");

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [sortFilter, setSortFilter] = useState("newest");
  const [dateFilter, setDateFilter] = useState("30days");

  const [stats, setStats] = useState<ApiReviewStats | null>(null);

  // Reply generator state
  const [selectedTone, setSelectedTone] = useState<string>("Warm & Friendly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReplyText, setEditedReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Check auth session via HTTP-only cookie
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user.businesses && user.businesses.length > 0) {
          setBusinessId(user.businesses[0].id);
          setBusinessName(user.businesses[0].name || "Dinuka Cafe");
          if (user.businesses[0].ai_tone) {
            setSelectedTone(user.businesses[0].ai_tone);
          }
        }
      } catch (err) {
        console.warn("Unauthenticated session:", err);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, []);

  const loadReviews = async (
    search?: string,
    sentiment?: string,
    ratingStr?: string,
    sort?: string,
    dateRange?: string
  ) => {
    try {
      setLoading(true);
      const rating = ratingStr && ratingStr !== "0" ? parseInt(ratingStr) : undefined;
      const data = await fetchReviews(businessId, search, sentiment, rating, sort, dateRange);
      setReviews(data.items || (data as any) || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchReviewStats(businessId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadReviews(searchQuery, sentimentFilter, ratingFilter, sortFilter, dateFilter);
      loadStats();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [businessId, searchQuery, sentimentFilter, ratingFilter, sortFilter, dateFilter]);

  const handleSeed = async () => {
    try {
      await seedReviews(businessId);
      await loadReviews(searchQuery, sentimentFilter, ratingFilter, sortFilter, dateFilter);
      await loadStats();
      setFeedback({ type: 'success', message: 'Sample reviews seeded successfully.' });
    } catch (error: any) {
      console.error("Failed to seed reviews:", error);
      setFeedback({ type: 'error', message: error.message || 'Failed to seed reviews' });
    }
  };

  const selectedReview = reviews.find(r => r.id.toString() === selectedReviewId);

  // Sync editedReplyText when selected review changes or when editing starts
  useEffect(() => {
    if (selectedReview?.ai_response) {
      setEditedReplyText(selectedReview.ai_response);
    } else {
      setEditedReplyText("");
    }
    setIsEditing(false);
    setFeedback(null);
  }, [selectedReviewId, selectedReview?.ai_response]);

  // AI Reply Generation Handler
  const handleGenerateReply = async (toneToUse?: string) => {
    if (!selectedReview) return;
    const tone = toneToUse || selectedTone;

    setIsGenerating(true);
    setFeedback(null);

    try {
      const response = await generateReviewReply(selectedReview.id, tone);

      // Update state locally
      setReviews(prev =>
        prev.map(r =>
          r.id === selectedReview.id
            ? { ...r, ai_response: response.reply, response_status: response.response_status || "Draft" }
            : r
        )
      );

      if (response.reply) {
        setEditedReplyText(response.reply);
      }

      setFeedback({
        type: 'success',
        message: 'Personalized AI reply generated with Gemini!',
      });
      loadStats();
    } catch (err: any) {
      console.error("Reply generation error:", err);
      if (err.status === 401) {
        setFeedback({
          type: 'error',
          message: 'Session expired or not logged in. Please sign in to generate replies.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to generate AI reply. Please check connection.',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Save edited draft
  const handleSaveEdit = async () => {
    if (!selectedReview) return;
    if (!editedReplyText.trim()) {
      setFeedback({ type: 'error', message: 'Reply text cannot be empty' });
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    try {
      const response = await editReviewReply(selectedReview.id, editedReplyText.trim());

      setReviews(prev =>
        prev.map(r =>
          r.id === selectedReview.id
            ? { ...r, ai_response: response.reply, response_status: response.response_status || "Draft" }
            : r
        )
      );

      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Draft reply updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update reply.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Approve draft
  const handleApproveReply = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const response = await approveReviewReply(selectedReview.id);

      setReviews(prev =>
        prev.map(r =>
          r.id === selectedReview.id
            ? { ...r, response_status: response.response_status || "Approved" }
            : r
        )
      );

      setFeedback({
        type: 'success',
        message: 'Draft approved successfully! Marked as Approved in database.',
      });
      loadStats();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve reply.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject draft
  const handleRejectReply = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const response = await rejectReviewReply(selectedReview.id);

      setReviews(prev =>
        prev.map(r =>
          r.id === selectedReview.id
            ? { ...r, response_status: response.response_status || "Rejected" }
            : r
        )
      );

      setFeedback({ type: 'success', message: 'Draft reply marked as Rejected.' });
      loadStats();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject reply.' });
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapReview = (r: ReviewItem) => {
    const rawStatus = (r.response_status || "needs response").toLowerCase();
    let displayStatus = "Needs Response";
    if (rawStatus === "approved") displayStatus = "Approved";
    else if (rawStatus === "draft" || rawStatus === "pending") displayStatus = r.ai_response ? "Draft Pending" : "Needs Response";
    else if (rawStatus === "rejected") displayStatus = "Rejected";
    else if (rawStatus === "ai ready") displayStatus = "AI Ready";

    const hasReply = !!(r.ai_response && r.ai_response.trim());

    return {
      id: r.id.toString(),
      raw: r,
      customer: {
        name: r.customer_name || "Customer",
        avatar: r.customer_avatar || (r.customer_name ? r.customer_name.substring(0, 2).toUpperCase() : "CU"),
        level: r.source || "Google Customer",
        initialsBg: "bg-slate-200 text-slate-700"
      },
      rating: r.rating,
      timeAgo: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recently",
      dateFull: r.created_at ? new Date(r.created_at).toLocaleString() : undefined,
      excerpt: r.review_text ? (r.review_text.length > 80 ? r.review_text.substring(0, 80) + "..." : r.review_text) : "No review text provided",
      fullText: r.review_text,
      topics: Array.isArray(r.topics) ? r.topics : [],
      sentiment: (r.sentiment || "Neutral").charAt(0).toUpperCase() + (r.sentiment || "Neutral").slice(1).toLowerCase(),
      sentimentScore: r.sentiment_score ?? 0.8,
      aiState: displayStatus,
      aiResponse: r.ai_response,
      action: hasReply ? "VIEW DRAFT" : "RESPOND",
      verified: true
    };
  };

  const uiReviews = reviews.map(mapReview);
  const selectedUiReview = uiReviews.find(r => r.id === selectedReviewId);

  // Helper for stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const tones = [
    { id: "Warm & Friendly", label: "Warm & Friendly" },
    { id: "Professional", label: "Professional" },
    { id: "Casual", label: "Casual" },
    { id: "Concise", label: "Concise" },
    { id: "Empathetic", label: "Empathetic" },
  ];

  return (
    <div className="flex h-full min-h-0 bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Auth status banner if unauthenticated */}
        {authChecked && !currentUser && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You are viewing demo reviews in read-only mode. Sign in to enable AI reply generation with your authenticated HTTP-only cookie.</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1 rounded-md shadow-sm transition-colors text-xs shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Link>
          </div>
        )}

        {/* Authenticated banner confirmation */}
        {authChecked && currentUser && (
          <div className="bg-emerald-50/70 border-b border-emerald-100 px-8 py-1.5 flex items-center justify-between text-[11px] text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Authenticated via HTTP-only cookie as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono font-semibold">
              Live FastAPI Connected
            </span>
          </div>
        )}

        {/* Header section */}
        <header className="px-8 py-6 bg-white border-b border-slate-200 flex-none shrink-0">
          <div className="flex justify-between items-start">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                  {businessName} • Google My Business
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Gemini Flash 2.0 AI
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Customer Reviews</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Autonomous AI reply drafting & sentiment triage connected directly to FastAPI. Select any review to draft, edit, and approve personalized responses.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex gap-2">
                {/* Stats */}
                <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold text-slate-900 leading-none mt-1">{stats ? stats.total_reviews : reviews.length}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Positive</p>
                    <p className="text-lg font-bold text-slate-900 leading-none mt-1 flex items-baseline gap-1">
                      {stats ? stats.positive_count : reviews.filter(r => r.sentiment?.toLowerCase() === 'positive').length}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Minus className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Neutral</p>
                    <p className="text-lg font-bold text-slate-900 leading-none mt-1 flex items-baseline gap-1">
                      {stats ? stats.neutral_count : reviews.filter(r => r.sentiment?.toLowerCase() === 'neutral').length}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-3 shadow-sm flex-col justify-center gap-1.5 border-rose-200 bg-rose-50/30">
                  <div className="flex items-center gap-2 w-full px-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Negative</p>
                  </div>
                  <div className="px-2 w-full text-left">
                    <p className="text-lg font-bold text-slate-900 leading-none flex items-baseline gap-1">
                      {stats ? stats.negative_count : reviews.filter(r => r.sentiment?.toLowerCase() === 'negative').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSeed}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-md px-4 py-3 flex items-center justify-center gap-2 shadow-sm transition-colors text-xs font-semibold"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Seed Reviews <span className="opacity-60 font-normal ml-0.5">(dev)</span></span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-[340px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reviews, topics, customer name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sentimentFilter} onValueChange={(val) => val && setSentimentFilter(val)}>
                <SelectTrigger className="w-[160px] h-8 px-4 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0">
                  <SelectValue placeholder="Sentiment: All" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectItem value="all" className="text-xs text-gray-800">All Sentiments</SelectItem>
                    <SelectItem value="positive" className="text-xs text-gray-800">Positive</SelectItem>
                    <SelectItem value="neutral" className="text-xs text-gray-800">Neutral</SelectItem>
                    <SelectItem value="negative" className="text-xs text-gray-800">Negative</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={(val) => val && setRatingFilter(val)}>
                <SelectTrigger className="w-[130px] h-8 px-4 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0">
                  <SelectValue placeholder="All Stars" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectItem value="0" className="text-xs text-gray-800">All Stars</SelectItem>
                    <SelectItem value="5" className="text-xs text-gray-800">5 Stars</SelectItem>
                    <SelectItem value="4" className="text-xs text-gray-800">4 Stars</SelectItem>
                    <SelectItem value="3" className="text-xs text-gray-800">3 Stars</SelectItem>
                    <SelectItem value="2" className="text-xs text-gray-800">2 Stars</SelectItem>
                    <SelectItem value="1" className="text-xs text-gray-800">1 Star</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={sortFilter} onValueChange={(val) => val && setSortFilter(val)}>
                <SelectTrigger className="w-[160px] h-8 px-4 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0">
                  <SelectValue placeholder="Sort: Newest" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectItem value="newest" className="text-xs text-gray-800">Sort: Newest First</SelectItem>
                    <SelectItem value="oldest" className="text-xs text-gray-800">Sort: Oldest First</SelectItem>
                    <SelectItem value="highest" className="text-xs text-gray-800">Highest Rated</SelectItem>
                    <SelectItem value="lowest" className="text-xs text-gray-800">Lowest Rated</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(val) => val && setDateFilter(val)}>
                <SelectTrigger className="w-[150px] h-8 px-4 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectItem value="all" className="text-xs text-gray-800">All Time</SelectItem>
                    <SelectItem value="30days" className="text-xs text-gray-800">Last 30 Days</SelectItem>
                    <SelectItem value="7days" className="text-xs text-gray-800">Last 7 Days</SelectItem>
                    <SelectItem value="24hours" className="text-xs text-gray-800">Last 24 Hours</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Actions */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <span className="text-sm font-semibold text-slate-700">
                {loading ? "Loading customer feedback..." : `Showing ${uiReviews.length} customer reviews`}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const firstUnanswered = reviews.find(r => !r.ai_response);
                    if (firstUnanswered) setSelectedReviewId(firstUnanswered.id.toString());
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Jump to Unanswered
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-3 pl-8">Customer</div>
              <div className="col-span-4">Review Excerpt & Topics</div>
              <div className="col-span-2">Sentiment</div>
              <div className="col-span-2">AI State</div>
              <div className="col-span-1 text-right pr-4">Action</div>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Fetching reviews from FastAPI backend...</p>
              </div>
            ) : uiReviews.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No reviews found matching current filter</p>
                <button
                  onClick={handleSeed}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
                >
                  Seed Sample Reviews Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {uiReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 items-center group cursor-pointer transition-colors ${
                      selectedReviewId === review.id ? 'bg-blue-50/40 relative' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedReviewId(review.id)}
                  >
                    {selectedReviewId === review.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                    )}

                    <div className="col-span-3 flex items-start gap-4">
                      <label className="flex items-center justify-center mt-2 cursor-pointer">
                        <div
                          className={`w-4 h-4 rounded border ${
                            selectedReviewId === review.id
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300 group-hover:border-blue-500'
                          } flex items-center justify-center transition-colors bg-white`}
                        >
                          {selectedReviewId === review.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${review.customer.initialsBg}`}
                        >
                          {review.customer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-slate-900">{review.customer.name}</p>
                            <div className="w-3.5 h-3.5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            </div>
                          </div>
                          <div className="mt-1">{renderStars(review.rating)}</div>
                          <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">
                            {review.timeAgo}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-4 pr-6">
                      <p className="text-[13px] text-slate-700 font-medium leading-relaxed mb-2 line-clamp-2">
                        "{review.excerpt}"
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {review.topics.map((topic: string) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200/60 shadow-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                          review.sentiment === 'Positive'
                            ? 'bg-emerald-100 text-emerald-700'
                            : review.sentiment === 'Neutral'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            review.sentiment === 'Positive'
                              ? 'bg-emerald-500'
                              : review.sentiment === 'Neutral'
                              ? 'bg-slate-500'
                              : 'bg-rose-500'
                          }`}
                        ></div>
                        {review.sentiment}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-1.5">
                          {review.aiState === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {review.aiState === 'Draft Pending' && <PenLine className="w-3.5 h-3.5 text-amber-500" />}
                          {review.aiState === 'Needs Response' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          {review.aiState === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-slate-400" />}

                          <span
                            className={`text-[12px] font-bold ${
                              review.aiState === 'Approved'
                                ? 'text-emerald-700'
                                : review.aiState === 'Draft Pending'
                                ? 'text-amber-600'
                                : review.aiState === 'Needs Response'
                                ? 'text-rose-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {review.aiState}
                          </span>
                        </div>
                        {review.aiResponse && (
                          <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]">
                            Drafted
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center justify-end pr-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReviewId(review.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          review.action === 'RESPOND'
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        }`}
                      >
                        {review.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar (Review Detail & Copilot) */}
      {selectedUiReview && (
        <div className="w-[460px] bg-slate-50 border-l border-slate-200 flex flex-col h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-600 tracking-wider">#{selectedUiReview.id}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
                  selectedUiReview.aiState === 'Approved'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : selectedUiReview.aiResponse
                    ? 'text-blue-700 bg-blue-50 border-blue-100'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                {selectedUiReview.aiState}
              </span>
            </div>
            <button
              onClick={() => setSelectedReviewId(null)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Notification / Feedback Banner */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-medium leading-tight">{feedback.message}</span>
                </div>
                <button
                  onClick={() => setFeedback(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${selectedUiReview.customer.initialsBg}`}
                >
                  {selectedUiReview.customer.avatar}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-[15px] leading-none">
                        {selectedUiReview.customer.name}
                      </h3>
                      <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1.5">{selectedUiReview.customer.level}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    {renderStars(selectedUiReview.rating)}
                    <span className="text-xs font-semibold text-slate-700">{selectedUiReview.rating}.0 Star Rating</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted</p>
                  <p className="text-xs font-bold text-slate-700">{selectedUiReview.dateFull || "Recently"}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    Google Review
                  </span>
                </div>
              </div>

              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium italic relative z-10">
                  "{selectedUiReview.fullText || selectedUiReview.excerpt}"
                </p>
              </div>
            </div>

            {/* AI Telemetry Breakdown */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Sentiment & Topics Analysis
                </span>
                <span className="text-emerald-600 font-semibold text-[10px]">
                  {Math.round((selectedUiReview.sentimentScore || 0.85) * 100)}% confidence
                </span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Sentiment</p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedUiReview.sentiment === 'Positive'
                          ? 'bg-emerald-500'
                          : selectedUiReview.sentiment === 'Neutral'
                          ? 'bg-slate-500'
                          : 'bg-rose-500'
                      }`}
                    ></div>
                    <span className="text-xs font-bold text-slate-900">{selectedUiReview.sentiment}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Status</p>
                  <span className="text-xs font-bold text-slate-900">{selectedUiReview.aiState}</span>
                </div>
              </div>

              {selectedUiReview.topics.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-wide">
                    Extracted Feedback Topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUiReview.topics.map((topic: string) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/80"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Reply Copilot Card */}
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-white text-[15px]">AI Reply Copilot</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                  Gemini API
                </span>
              </div>

              <div className="p-5">
                {/* Tone Selector */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  Select Reply Tone:
                </p>
                <div className="flex items-center gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1">
                  {tones.map(tone => {
                    const active = selectedTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setSelectedTone(tone.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {tone.label}
                      </button>
                    );
                  })}
                </div>

                {/* AI Draft Response Box */}
                {isGenerating ? (
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 mb-5 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
                    <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
                    <p className="text-sm font-semibold text-white">Drafting personalized reply with Gemini...</p>
                    <p className="text-xs text-slate-400">
                      Tailoring for {selectedUiReview.customer.name} in a {selectedTone} tone
                    </p>
                  </div>
                ) : selectedUiReview.aiResponse ? (
                  <div className="mb-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          rows={5}
                          value={editedReplyText}
                          onChange={(e) => setEditedReplyText(e.target.value)}
                          className="w-full bg-slate-800 border border-blue-500 rounded-xl p-3.5 text-[13px] text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="Type your response here..."
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedReplyText(selectedUiReview.aiResponse || "");
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={actionLoading}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Save Draft
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 relative group">
                        <p className="text-[13px] text-slate-200 leading-relaxed font-normal">
                          {selectedUiReview.aiResponse}
                        </p>
                        <button
                          onClick={() => copyToClipboard(selectedUiReview.aiResponse || "")}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition-colors"
                          title="Copy reply"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {/* Metadata & Actions row */}
                    {!isEditing && (
                      <div className="flex items-center justify-between mt-3 mb-5 px-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleGenerateReply()}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                          >
                            <RefreshCcw className="w-3 h-3" /> Regenerate
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                          >
                            <PenLine className="w-3 h-3" /> Edit Draft
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedUiReview.aiResponse.length} chars
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-6 mb-5 text-center">
                    <p className="text-xs text-slate-400 mb-4">
                      No response drafted yet. Click below to generate an AI reply with Gemini.
                    </p>
                    <button
                      onClick={() => handleGenerateReply()}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Generate AI Reply with Gemini
                    </button>
                  </div>
                )}

                {/* Approve & Reject Actions */}
                {selectedUiReview.aiResponse && !isEditing && (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleApproveReply}
                      disabled={actionLoading || selectedUiReview.aiState === 'Approved'}
                      className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                        selectedUiReview.aiState === 'Approved'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedUiReview.aiState === 'Approved' ? 'Draft Approved (Saved in DB)' : 'Approve Draft Reply'}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleGenerateReply()}
                        disabled={isGenerating || actionLoading}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Re-draft
                      </button>
                      <button
                        onClick={handleRejectReply}
                        disabled={actionLoading || selectedUiReview.aiState === 'Rejected'}
                        className={`font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                          selectedUiReview.aiState === 'Rejected'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/40'
                            : 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700/60'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        {selectedUiReview.aiState === 'Rejected' ? 'Draft Rejected' : 'Reject Draft'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Endpoint telemetry footer */}
              <div className="px-5 py-2.5 bg-slate-950 flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    FastAPI Endpoint: /api/reviews/{selectedUiReview.id}/generate-reply
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Cookie: Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
