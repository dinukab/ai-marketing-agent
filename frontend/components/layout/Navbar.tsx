import React from 'react';

export default function Navbar() {
    return (
        <div className="fixed top-0 left-0 w-full px-8 py-4 bg-[#F8F9FF] flex justify-between items-center border-b border-slate-200 z-50 shadow-xs">
            {/* Left side: Avatar and Logo */}
            <div className="flex items-center gap-6">
                
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-[10px] tracking-tighter">
                        RP
                    </div>
                    <div className="font-bold text-sm leading-tight flex items-center gap-1 text-slate-900">
                        ReviewPilot <span className="text-blue-600">AI</span>
                        <span className="text-[10px] bg-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-mono ml-1 font-semibold">AUTH</span>
                    </div>
                </div>
            </div>

            {/* Right side Links */}
            <div className="flex items-center gap-6 text-sm text-slate-600 font-semibold">
                <a href="#" className="text-slate-900 font-bold">Sign In</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Create Account</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Enterprise SSO</a>
                <div className="flex items-center gap-1.5 text-xs font-mono bg-white/50 px-2 py-1 rounded border border-slate-200/50 text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Systems Operational
                </div>
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white ml-2 shadow-sm border-2 border-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
        </div>
        </div>
    );
}
