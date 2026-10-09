"use client";

import React, { useState, useEffect } from 'react';
import { fetchReviews, seedReviews, fetchReviewStats } from '../../lib/api';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  Download,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
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
  CalendarClock
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
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [sortFilter, setSortFilter] = useState("newest");
  const [dateFilter, setDateFilter] = useState("30days");

  const [stats, setStats] = useState<any>(null);

  const loadReviews = async (search?: string, sentiment?: string, ratingStr?: string, sort?: string, dateRange?: string) => {
    try {
      setLoading(true);
      const rating = ratingStr && ratingStr !== "0" ? parseInt(ratingStr) : undefined;
      const data = await fetchReviews(1, search, sentiment, rating, sort, dateRange); // business_id=1
      setReviews(data.items ? data.items : data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchReviewStats(1); // business_id=1
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
  }, [searchQuery, sentimentFilter, ratingFilter, sortFilter, dateFilter]);

  const handleSeed = async () => {
    try {
      await seedReviews(1);
      loadReviews();
      loadStats();
    } catch (error) {
      console.error("Failed to seed reviews:", error);
    }
  };

  const mapReview = (r: any) => ({
    id: r.id.toString(),
    customer: {
      name: r.customer_name || "Unknown",
      avatar: r.customer_avatar || "?",
      level: r.source || "Customer",
      initialsBg: "bg-slate-200 text-slate-700"
    },
    rating: r.rating,
    timeAgo: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recently",
    dateFull: r.created_at ? new Date(r.created_at).toLocaleString() : undefined,
    excerpt: r.review_text ? (r.review_text.length > 50 ? r.review_text.substring(0, 50) + "..." : r.review_text) : "No text",
    fullText: r.review_text,
    topics: r.topics || [],
    sentiment: r.sentiment || "Neutral",
    aiState: r.response_status || "Needs Response",
    aiSubtext: r.ai_response ? "Tone: Warm" : undefined,
    action: r.ai_response ? "VIEW" : "RESPOND",
    verified: true
  });

  const uiReviews = reviews.map(mapReview);
  const selectedReview = uiReviews.find(r => r.id === selectedReviewId);

  // Helper for stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header section */}
        <header className="px-8 py-6 bg-white border-b border-slate-200 flex-none shrink-0">
          <div className="flex justify-between items-start">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  Google My Business Connected
                </span>

              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Customer Reviews</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Manage, triage, and publish Google Business Profile feedback with autonomous AI drafting tailored to Dinuka Cafe.
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
                    <p className="text-lg font-bold text-slate-900 leading-none mt-1">{stats ? stats.total_reviews : "-"}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-md px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Positive</p>
                    <p className="text-lg font-bold text-slate-900 leading-none mt-1 flex items-baseline gap-1">
                      {stats ? stats.positive_count : "-"} <span className="text-[11px] font-medium text-emerald-500">({stats && stats.total_reviews ? Math.round((stats.positive_count / stats.total_reviews) * 100) : 0}%)</span>
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
                      {stats ? stats.neutral_count : "-"} <span className="text-[11px] font-medium text-slate-400">({stats && stats.total_reviews ? Math.round((stats.neutral_count / stats.total_reviews) * 100) : 0}%)</span>
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
                      {stats ? stats.negative_count : "-"} <span className="text-[11px] font-medium text-rose-500">({stats && stats.total_reviews ? Math.round((stats.negative_count / stats.total_reviews) * 100) : 0}%)</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className="bg-rose-600 hover:bg-rose-700 text-white rounded-md px-5 py-2.5 flex flex-col items-center justify-center shadow-sm shadow-rose-600/20 transition-colors h-[76px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[6px] font-bold tracking-widest uppercase opacity-90">Needs Response</span>
                  </div>
                  <span className="text-[15px] font-bold">{stats ? stats.awaiting_response_count : "-"} Unanswered</span>
                </button>
                <button onClick={handleSeed} className="bg-slate-900 hover:bg-slate-800 text-white rounded-md px-4 py-2.5 flex items-center justify-center gap-2 shadow-sm transition-colors mt-auto">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Seed DB <span className="opacity-60 font-normal ml-1">(dev)</span></span>
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
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-[160px] h-7 px-4 py-1 bg-white border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Response State: All" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectItem value="all" className="text-xs text-gray-800"><span className="text-gray-800"> All</span></SelectItem>
                    <SelectItem value="positive" className="text-xs text-gray-800"><span className="text-gray-800">Positive</span></SelectItem>
                    <SelectItem value="neutral" className="text-xs text-gray-800"><span className="text-gray-800">Neutral</span></SelectItem>
                    <SelectItem value="negative" className="text-xs text-gray-800"><span className="text-gray-800">Negative</span></SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[120px] h-7 px-4 py-1 bg-white border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="All Stars" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <div className="flex items-center gap-2"></div>
                    <SelectItem value="0" className="text-xs text-gray-800">All Stars</SelectItem>
                    <SelectItem value="5" className="text-xs text-gray-800">5 Stars</SelectItem>
                    <SelectItem value="4" className="text-xs text-gray-800">4 Stars</SelectItem>
                    <SelectItem value="3" className="text-xs text-gray-800">3 Stars</SelectItem>
                    <SelectItem value="2" className="text-xs text-gray-800">2 Stars</SelectItem>
                    <SelectItem value="1" className="text-xs text-gray-800">1 Star</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="w-[160px] h-7 px-4 py-1 bg-white border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Sort: Newest First" />
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
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px] h-7 px-4 py-1 bg-white border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-sm focus:ring-0 focus:ring-offset-0">
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
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center group-hover:border-blue-500 transition-colors bg-white">
                </div>
                <span className="text-sm font-semibold text-slate-700">Select all 248 reviews</span>
              </label>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Bulk AI Draft (3)
                </button>
                <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors shadow-sm">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-3 pl-8">Customer</div>
              <div className="col-span-4">Review Excerpt & Extracted Topics</div>
              <div className="col-span-2">Sentiment</div>
              <div className="col-span-2">AI State</div>
              <div className="col-span-1 text-right pr-4">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100 bg-white">
              {uiReviews.map((review) => (
                <div
                  key={review.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 items-center group cursor-pointer transition-colors ${selectedReviewId === review.id ? 'bg-blue-50/40 relative' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedReviewId(review.id)}
                >
                  {selectedReviewId === review.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                  )}

                  <div className="col-span-3 flex items-start gap-4">
                    <label className="flex items-center justify-center mt-2 cursor-pointer">
                      <div className={`w-4 h-4 rounded border ${selectedReviewId === review.id ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-500'} flex items-center justify-center transition-colors bg-white`}>
                        {selectedReviewId === review.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${review.customer.initialsBg}`}>
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
                        <p className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wide">{review.timeAgo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 pr-6">
                    <p className="text-[13px] text-slate-700 font-medium leading-relaxed mb-2 line-clamp-2">"{review.excerpt}"</p>
                    <div className="flex flex-wrap gap-1.5">
                      {review.topics.map(topic => (
                        <span key={topic} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200/60 shadow-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${review.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                      review.sentiment === 'Neutral' ? 'bg-slate-100 text-slate-600' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${review.sentiment === 'Positive' ? 'bg-emerald-500' :
                        review.sentiment === 'Neutral' ? 'bg-slate-500' :
                          'bg-rose-500'
                        }`}></div>
                      {review.sentiment}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        {review.aiState === 'AI Ready' && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                        {review.aiState === 'Needs Response' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        {review.aiState === 'Published' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {review.aiState === 'Draft Pending' && <PenLine className="w-3.5 h-3.5 text-amber-500" />}
                        {review.aiState === 'High Priority' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}

                        <span className={`text-[12px] font-bold ${review.aiState === 'AI Ready' ? 'text-blue-600' :
                          review.aiState === 'Needs Response' ? 'text-rose-600' :
                            review.aiState === 'Published' ? 'text-emerald-600' :
                              review.aiState === 'Draft Pending' ? 'text-amber-600' :
                                'text-rose-700'
                          }`}>
                          {review.aiState}
                        </span>
                      </div>
                      {review.aiSubtext && (
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider ml-5">{review.aiSubtext}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-end pr-4">
                    <button className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${review.action === 'RESPOND' ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md' :
                      review.action === 'VIEW' ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm' :
                        'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      }`}>
                      {review.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination placeholder */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-[11px] font-semibold text-slate-500">Showing <strong>1–7</strong> of <strong>248</strong> reviews</span>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-[11px] font-bold shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors">3</button>
                <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors">36</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar (Review Detail & Copilot) */}
      {selectedReview && (
        <div className="w-[440px] bg-slate-50 border-l border-slate-200 flex flex-col h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 ease-out">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-blue-600 tracking-wider">#{selectedReview.id}</span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-blue-500" />
                AI Response Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedReviewId(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-6">

              {/* Customer Details */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${selectedReview.customer.initialsBg}`}>
                    {selectedReview.customer.avatar}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-[15px] leading-none">{selectedReview.customer.name}</h3>
                        <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1.5">{selectedReview.customer.level}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      {renderStars(selectedReview.rating)}
                      <span className="text-xs font-semibold text-slate-700">{selectedReview.rating}.0 Star Rating</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted</p>
                    <p className="text-xs font-bold text-slate-700">{selectedReview.dateFull || "Recently"}</p>
                  </div>
                  {selectedReview.verified && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Verified<br />Purchase</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium italic relative z-10">
                    "{selectedReview.fullText || selectedReview.excerpt}"
                  </p>
                </div>
              </div>

              {/* AI Telemetry */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    AI Telemetry Analysis
                  </span>
                  <span className="text-emerald-500 font-semibold tracking-normal text-[10px]">96.4% confidence</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Detected Sentiment</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-slate-900">Delighted / Positive</span>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Customer Intent</p>
                    <span className="text-xs font-bold text-slate-900">Praise & Repeat ...</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wide">Topic Sentiment Decomposition</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">Customer Service</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">(+0.98)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">Staff Hospitality</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">(+0.95)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">Beverage Craft</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">(+0.94)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ReviewPilot Copilot Area */}
              <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden mt-6 border border-slate-800">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-white text-[15px]">ReviewPilot Copilot</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">GPT-4o</span>
                </div>

                <div className="p-5">
                  {/* Tone Selector */}
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2">
                    <button className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap border border-transparent">Professional</button>
                    <button className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-white bg-blue-600 shadow-sm whitespace-nowrap border border-blue-500">Warm & Friendly</button>
                    <button className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap border border-transparent">Casual</button>
                    <button className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all whitespace-nowrap border border-transparent">Concise</button>
                  </div>

                  {/* AI Draft Text */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-4 shadow-inner">
                    <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                      Hi Sarah! Thank you so much for taking the time to share your kind words. We're thrilled that you enjoyed our flat white and felt welcomed by our team. We look forward to seeing you again soon!
                    </p>
                  </div>

                  {/* Editor actions */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                        <RefreshCcw className="w-3 h-3" /> Regenerate
                      </button>
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
                        <PenLine className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">203 chars</span>
                  </div>

                  {/* Publish Actions */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all group">
                    <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    Approve & Publish to Google
                  </button>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-[11px] flex items-center justify-center gap-2 transition-colors">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Schedule Publish
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-[11px] flex items-center justify-center gap-2 transition-colors">
                      <X className="w-3.5 h-3.5 text-slate-400" /> Reject Draft
                    </button>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-950 flex items-center justify-between border-t border-slate-800 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">GMB API v4.9 Connected</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Auth Token: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
