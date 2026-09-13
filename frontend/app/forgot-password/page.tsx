import React from 'react';
import { Mail, ArrowLeft, RotateCcw, ShieldCheck, Headset, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans items-center justify-center p-4">
      {/* Centered Card */}
      <div className="w-full max-w-[540px] bg-white rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Subtle Top Gradient for the card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10 z-10 relative">
          <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-bold tracking-tighter shadow-sm">
            {/* Simple logo placeholder similar to image */}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="text-left">
            <div className="font-bold text-xl leading-none flex items-center gap-1 text-slate-900 tracking-tight">
              ReviewPilot<span className="text-blue-600">.ai</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono tracking-widest mt-1 uppercase">
              Autonomous Reputation Core
            </div>
          </div>
        </div>

        {/* Reset Icon */}
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 border border-blue-100/50 z-10">
          <RotateCcw className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Headings */}
        <h1 className="text-3xl font-bold mb-3 tracking-tight text-slate-900 z-10">
          Reset your password
        </h1>
        <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-[380px] z-10 font-medium">
          Enter your verified business email and we'll send you a secure link to reset your account credentials.
        </p>

        {/* Form Area */}
        <div className="w-full text-left z-10">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-slate-800">Business email address</label>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase font-mono">
              SSO / 2FA PROTECTED
            </span>
          </div>
          
          <div className="relative mb-3">
            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              defaultValue="marcus.vance@revivegroup.io"
              className="w-full pl-11 pr-4 py-3.5 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-500 mb-8 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              We'll send recovery instructions associated with your Google Business administrator account.
            </p>
          </div>

          <button className="w-full bg-black hover:bg-slate-900 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-[15px] shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] mb-8">
            Send reset link <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-10">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>

          {/* Support Box */}
          <div className="bg-[#f0f4f8] rounded-2xl p-5 flex items-center justify-between gap-4 border border-blue-50">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Headset className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800 mb-1 leading-snug">
                Need urgent assistance accessing your location account?
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-2">
                Multi-location tier accounts receive dedicated 24/7 Priority SLA response.
              </p>
            </div>
            <a href="#" className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0">
              Contact Business Support <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
