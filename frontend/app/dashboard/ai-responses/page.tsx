"use client";

import React, { useState } from 'react';
import {
  Bot,
  X,
  Check,
  Send,
  CheckCircle2,
  Sparkles,
  Search,
  ChevronDown
} from 'lucide-react';

export default function AIResponsesPage() {
  const [isModalOpen, setIsModalOpen] = useState(true); // Open by default to show the feature

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

      {/* Background Page Layout */}
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
                <span className="text-[10px] font-mono text-slate-400">LOC-CMB-0081</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">AI Responses</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Review and approve automated AI drafts for your customer feedback.
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button className="px-4 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
                  All Responses <span className="text-slate-400 font-medium">24</span>
                </button>
                <button className="px-4 py-1.5 bg-white text-blue-600 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5">
                  Pending Approval <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md text-[10px]">12</span>
                </button>
                <button className="px-4 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
                  Approved <span className="text-slate-400 font-medium">12</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve All Pending (12)
              </button>
            </div>
          </div>
        </header>

        {/* Table Area (Background Mock) */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="p-6 flex items-start gap-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-amber-600 text-white shadow-sm">
                SM
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-[15px]">Sarah M.</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Local Guide
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Draft Pending
                  </span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13px] text-slate-700 italic font-medium mb-4">
                  "Amazing service and very friendly staff! The cold brew and cardamom croissant were unbelievable. We'll be back every weekend."
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                  <p className="text-[13px] text-slate-700 font-medium">
                    Hi Sarah, thank you so much for the wonderful review! We're delighted to hear that you loved our cold brew and cardamom croissants. Our baristas and bakers work hard every morning to make each visit special. We can't wait to welcome you back this weekend! — Dinuka & Team
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Edit Response
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                    Approve & Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit AI Response Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">

          {/* Modal Container */}
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Edit AI Response <span className="text-slate-300 font-normal">•</span> <span className="text-sm font-semibold text-slate-600">Sarah M. (5 Stars)</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Customize wording, adapt tone, and run automated safety compliance.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-[#F8FAFC]">

              {/* Original Review */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Original Review Snippet</h3>
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4">
                  <p className="text-[13px] text-slate-700 italic font-medium leading-relaxed">
                    "Amazing service and very friendly staff! The cold brew and cardamom croissant were unbelievable. We'll be back every weekend."
                  </p>
                </div>
              </div>

              {/* Tone Adjuster */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Adjust Tone & Style Preset:</h3>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Professional
                  </button>
                  <button className="flex-1 py-2.5 bg-blue-600 border border-blue-600 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Friendly
                  </button>
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Casual
                  </button>
                  <button className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Empathetic
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 ml-1 mr-1">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response Text (Google Maps Visible)</h3>
                  <span className="text-[10px] font-semibold text-slate-400">214 / 500 characters</span>
                </div>
                <textarea
                  className="w-full h-32 p-4 bg-white border border-blue-100 rounded-xl text-[13px] text-slate-800 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner resize-none"
                  defaultValue="Hi Sarah, thank you so much for the wonderful review! We're delighted to hear that you loved our cold brew and cardamom croissants. Our baristas and bakers work hard every morning to make each visit special. We can't wait to welcome you back this weekend! — Dinuka & Team"
                />
              </div>

              {/* Compliance Bar */}
              <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[11px] font-bold text-emerald-600">100% Brand Safety & Guardrail Compliant</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">No PII • Zero Hallucination risk</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors">
                  Save & Preview
                </button>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-colors group">
                  <Send className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  Approve & Publish Immediately
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
