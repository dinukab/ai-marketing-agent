"use client";

import React, { useState } from 'react';
import {
  Calendar, Download, RefreshCw, Star, MessageSquare, ThumbsUp,
  Bot, Clock, TrendingUp, ChevronDown, CheckCircle2, AlertCircle,
  TrendingDown, Zap, ArrowRight, ShieldAlert, Sparkles, Filter, Store
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';

// --- Dummy Data ---
const ratingTrendData = [
  { name: 'Week 1', value: 4.1 },
  { name: 'Week 2', value: 4.3 },
  { name: 'Week 3', value: 4.4 },
  { name: 'Week 4', value: 4.6 },
];

const sentimentData = [
  { name: 'Positive', value: 82, color: '#10b981' }, // emerald-500
  { name: 'Neutral', value: 12, color: '#f59e0b' },  // amber-500
  { name: 'Negative', value: 6, color: '#ef4444' },  // red-500
];

const volumeData = [
  { name: 'Week 1', Current: 40, Previous: 30 },
  { name: 'Week 2', Current: 55, Previous: 35 },
  { name: 'Week 3', Current: 60, Previous: 45 },
  { name: 'Week 4', Current: 85, Previous: 50 },
];

const topics = [
  { name: 'Food & Pastry Quality', count: 72, percentage: 89, isPositive: true },
  { name: 'Customer Service', count: 64, percentage: 75, isPositive: true },
  { name: 'Delivery & Packaging', count: 41, percentage: 37, isPositive: false },
  { name: 'Price & Portion Value', count: 33, percentage: 55, isPositive: true },
  { name: 'Staff Hospitality', count: 18, percentage: 92, isPositive: true },
];

const reviews = [
  {
    id: 1,
    author: 'Sarah M.',
    source: 'Google Maps',
    time: '2 hours ago',
    rating: 5,
    sentiment: 'Positive',
    text: "Amazing service and very friendly staff! The cold brew and cardamom croissant were unbelievable. Perfect spot to read or catch up with friends.",
    aiReply: "Hi Sarah! Thank you so much for the love! Our team bakes those cardamom croissants fresh every morning, and we're thrilled you enjoyed the cold brew. Looking forward to your next visit!",
    status: 'draft'
  },
  {
    id: 2,
    author: 'John D.',
    source: 'Yelp Reviews',
    time: '5 hours ago',
    rating: 3,
    sentiment: 'Neutral',
    text: "The food was good but delivery took too long. Fries arrived cold.",
    aiReply: null,
    status: 'pending'
  },
  {
    id: 3,
    author: 'Michael K.',
    source: 'Google Maps',
    time: 'Yesterday',
    rating: 5,
    sentiment: 'Positive',
    text: "Best spot in Colombo for weekend brunch. Great vibe and fast Wi-Fi.",
    aiReply: null,
    status: 'published'
  },
  {
    id: 4,
    author: 'Emma W.',
    source: 'Google Maps',
    time: '2 days ago',
    rating: 2,
    sentiment: 'Negative',
    text: "Waited 25 minutes for a table despite having a reservation.",
    aiReply: "Hi Emma, we sincerely apologize for the wait time despite your reservation. This isn't our standard. Please reach out to us at support@dinukacafe.com so we can make this right.",
    status: 'draft'
  }
];

export default function DashboardPage() {
  const [userName, setUserName] = useState('Dinuka');

  React.useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            Executive Overview <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Google Connected</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {userName} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Here's what's happening with your customer feedback today across Google Business Profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4" />
            Last 30 days
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors shadow-md">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">

        {/* Metric 1: Average Rating */}
        <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-800">Average Rating</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">4.6</span>
              <div className="flex text-amber-400 mb-1">
                {[1, 2, 3, 4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <Star className="w-3.5 h-3.5 fill-current opacity-50" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> +0.4
              </span>
              <span className="text-slate-400">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Reviews */}
        <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-800">Total Reviews</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">248</span>
              <span className="text-sm font-semibold text-slate-500 mb-1">reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Positive Reviews */}
        <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-800">Positive Reviews</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">82%</span>
              <span className="text-sm font-semibold text-slate-500 mb-1">203 pos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> sentiment jump
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: AI Responses */}
        <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-800">AI Responses</h3>
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">186</span>
              <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded mb-1.5">12 pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> automation rate
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Response Rate */}
        <div className="bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-800">Response Rate</h3>
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-3xl font-bold text-slate-900">92%</span>
              <span className="text-sm font-semibold text-slate-500 mb-1">avg 10m</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> SLA speed
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Rating Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rating Trend</h2>
              <p className="text-sm font-medium text-slate-500">Average customer rating over time (Google Business Profile)</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded bg-white shadow-sm text-slate-800">7D</button>
              <button className="px-3 py-1 text-xs font-bold rounded text-slate-500">30D</button>
              <button className="px-3 py-1 text-xs font-bold rounded text-slate-500">1M</button>
              <button className="px-3 py-1 text-xs font-bold rounded text-slate-500">6M</button>
              <button className="px-3 py-1 text-xs font-bold rounded text-slate-500">1Y</button>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ratingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5636f5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5636f5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis domain={[3, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="value" stroke="#5636f5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Sentiment Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Sentiment</h2>
            <p className="text-sm font-medium text-slate-500">AI breakdown of 248 total customer reviews</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">82%</span>
              <span className="text-xs font-semibold text-slate-500">Positive</span>
            </div>

            {/* Legend Overlay */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {sentimentData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-semibold text-slate-700 w-16">{item.name}</span>
                  <span className="text-xs font-medium text-slate-400">({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-blue-50/50 rounded-xl p-3 flex items-start gap-3 border border-blue-100">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-blue-900 leading-relaxed">
              <span className="font-bold text-blue-700">Positive sentiment increased +8%</span> this period following your revised pastry menu introduction.
            </p>
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Review Volume & Inflow */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review Volume & Inflow</h2>
              <p className="text-sm font-medium text-slate-500">Weekly inflow comparison vs prior month</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#5636f5]"></div> Current</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-200"></div> Previous</div>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Current" fill="#5636f5" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Previous" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">Google Maps Reviews</span>
              </div>
              <span className="font-bold text-slate-900">214</span>
            </div>
            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">Direct QR Inflow</span>
              </div>
              <span className="font-bold text-slate-900">34</span>
            </div>
          </div>
        </div>

        {/* What Customers Are Talking About */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">What Customers Are Talking About</h2>
              <p className="text-sm font-medium text-slate-500">Top semantic categories parsed by AI natural language pipeline</p>
            </div>
            <button className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
              All topics
            </button>
          </div>

          <div className="space-y-5 mt-2">
            {topics.map((topic, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {topic.isPositive ? <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                    <span className="text-sm font-bold text-slate-700">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">{topic.count} reviews ({Math.round((topic.count / 248) * 100)}%)</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${topic.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {topic.percentage}% {topic.isPositive ? 'Pos' : 'Neg'}
                    </span>
                  </div>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${topic.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                  <div
                    className="h-full bg-slate-200"
                    style={{ width: `${100 - topic.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Reviews & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Reviews List (col-span-2) */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Customer Reviews</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Live feed from connected Google Business locations</p>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              View All Reviews (248) <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">

                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm border border-slate-200">
                      {review.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{review.author}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                        <span>{review.source}</span>
                        <span>•</span>
                        <span>{review.time}</span>
                      </div>
                    </div>
                  </div>
                  {/* Sentiment Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border
                    ${review.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      review.sentiment === 'Negative' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full 
                      ${review.sentiment === 'Positive' ? 'bg-emerald-500' :
                        review.sentiment === 'Negative' ? 'bg-rose-500' :
                          'bg-amber-500'}`}>
                    </div>
                    {review.sentiment}
                  </div>
                </div>

                {/* Rating Stars & Review Text */}
                <div className="mb-4">
                  <div className="flex gap-0.5 text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">"{review.text}"</p>
                </div>

                {/* AI Action Area */}
                {review.status === 'draft' && review.aiReply && (
                  <div className="mt-4 bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                        <Bot className="w-4 h-4" /> AI Suggested Reply
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Tone: Warm & Welcoming</span>
                    </div>
                    <p className="text-sm text-slate-600 italic leading-relaxed mb-4">"{review.aiReply}"</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded">Delivery</span>
                        <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded">Wait time</span>
                      </div>
                      <div className="flex gap-3">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Edit Draft</button>
                        <button className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Approve & Send</button>
                      </div>
                    </div>
                  </div>
                )}

                {review.status === 'pending' && (
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Delivery Delay</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Food Temp</span>
                    </div>
                    <button className="text-xs font-bold bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Generate AI Draft
                    </button>
                  </div>
                )}

                {review.status === 'published' && (
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Responded by ReviewPilot AI in 12m
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">Published to Google ↗</span>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* AI Actionable Intelligence (col-span-1) */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> AI Intelligence
            </h2>
          </div>

          <div className="space-y-4">

            {/* Alert Card */}
            <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-sm overflow-hidden">
              <div className="bg-rose-50/50 p-4 border-b border-rose-100 flex justify-between items-start">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" /> PRIORITY ALERT • HIGH
                </div>
                <span className="text-[10px] font-bold text-rose-400 uppercase">Past 14 days</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-2">Delivery Delays Detected</h4>
                <p className="text-sm font-medium text-slate-600 mb-4 leading-relaxed">
                  18% of negative feedback in the last 14 days explicitly mentions delivery delays over 40 minutes during evening rush hours.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                  <h5 className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
                  </h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Review delivery courier scheduling during peak 6 PM-8 PM rush or adjust estimated prep times on delivery platforms.
                  </p>
                </div>
                <button className="w-full text-xs font-bold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  View 12 Related Reviews →
                </button>
              </div>
            </div>

            {/* Strength Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" /> BUSINESS STRENGTH
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">100% Pos</span>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-2">Staff Hospitality Praise</h4>
                <p className="text-sm font-medium text-slate-600 mb-4 leading-relaxed">
                  Customers repeatedly praise server friendliness and attentive service, generating strong repeat business indicators.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h5 className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
                  </h5>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                    Feature barista team highlights in social marketing to reinforce high customer trust and celebrate internal staff excellence.
                  </p>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    Explore Insight <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Growth Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="p-5 pt-8">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Growth Opportunity</h4>
                <h3 className="font-bold text-white text-lg mb-3 leading-tight">Weekend Brunch Momentum</h3>
                <p className="text-sm font-medium text-slate-300 mb-5 leading-relaxed">
                  Weekend reviews increased +34% with strong positive sentiment on artisanal croissants and specialty cold brew.
                </p>
                <button className="w-full text-sm font-bold text-slate-900 bg-white py-3 rounded-xl hover:bg-slate-100 transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  Generate Campaign Brief <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Coverage Mini Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 mt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Automated Coverage</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-white">88.4%</span>
                <span className="text-xs font-medium text-slate-400 mb-1">of incoming reviews handled</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88.4%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
