import React from 'react';
import { Mail, Pencil, RefreshCw, ShieldCheck, ArrowLeft, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans items-center justify-center p-4 py-12">
            {/* Centered Card */}
            <div className="w-full max-w-[600px] bg-white rounded-[24px] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative">

                {/* Small Logo at top */}
                <div className="w-10 h-10 bg-[#f0f4f8] rounded-xl flex items-center justify-center mb-8 border border-slate-100">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#0f172a] rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    </div>
                </div>

                {/* Envelope Illustration */}
                <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-50 rounded-full blur-xl opacity-60"></div>
                    <div className="relative z-10 w-20 h-16 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                        {/* Envelope Flaps */}
                        <div className="absolute top-0 left-0 w-full h-full border-t-[32px] border-l-[40px] border-r-[40px] border-t-slate-50 border-x-transparent z-0"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-b-[32px] border-l-[40px] border-r-[40px] border-b-slate-100/50 border-x-transparent z-0"></div>

                        {/* Shield Badge */}
                        <div className="absolute z-20 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 transform translate-y-1">
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                    </div>
                    {/* Sparkles */}
                    <Sparkles className="absolute top-0 right-0 w-5 h-5 text-blue-400 z-20" />
                    <Sparkles className="absolute bottom-2 left-0 w-3 h-3 text-blue-300 z-20" />
                </div>

                {/* Headings */}
                <h1 className="text-3xl font-bold mb-3 tracking-tight text-slate-900">
                    Check your inbox
                </h1>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed max-w-[420px] font-medium">
                    We've dispatched a secure verification link to authenticate your enterprise account and unlock your autonomous reputation pipeline.
                </p>

                {/* Email display bar */}
                <div className="w-full bg-[#f4f7fb] rounded-xl p-4 flex items-center justify-between mb-4 border border-blue-50">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 font-mono tracking-tight">
                        <Mail className="w-4 h-4 text-blue-600" />
                        alex****@thegrandbistro.com
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Wrong email? Edit <Pencil className="w-3 h-3" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-3 mb-8">
                    <button className="bg-[#f0f4f8] hover:bg-[#e2e8f0] text-slate-700 rounded-xl py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200/50">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                        </svg>
                        Open Google Workspace
                    </button>
                    <button className="bg-[#f0f4f8] hover:bg-[#e2e8f0] text-slate-700 rounded-xl py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200/50">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-10 6.25L2 8V6l10 6.25L22 6v2z" />
                        </svg>
                        Open Outlook 365
                    </button>
                </div>

                {/* Resend Section */}
                <div className="w-full bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase font-mono">
                            Dispatch System Status: EN ROUTE
                        </span>
                    </div>
                    <button disabled className="bg-slate-200/50 text-slate-400 rounded-lg py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Resend verification email (available in 0:42s)
                    </button>
                </div>

                {/* Info Box */}
                <div className="w-full bg-[#f4f7fb] rounded-xl p-5 flex gap-3 text-left mb-8 border border-blue-50/50">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        <span className="font-bold text-slate-800">Didn't receive the email?</span> Check your spam folder or corporate quarantine filter. For dedicated provisioning assistance, ping our priority concierge at <a href="mailto:support@reviewpilot.ai" className="text-blue-600 hover:underline font-bold">support@reviewpilot.ai</a>.
                    </p>
                </div>

                {/* Back Link */}
                <Link href="/login" className="flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>

            </div>
        </div>
    );
}
