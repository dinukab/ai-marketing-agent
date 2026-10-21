"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, UserProfile } from '../../app/lib/api';
import { Search, Command, Store, ChevronDown, RefreshCw, Bell, User, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const businessName = currentUser?.businesses?.[0]?.name || "Dinuka Cafe";

  // Create breadcrumbs based on pathname
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  const currentPage = pathParts.length > 1 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1).replace('-', ' ') 
    : 'Reviews';

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10 font-sans shadow-sm shadow-slate-100/50">
      
      {/* Left side: Breadcrumbs & Search */}
      <div className="flex items-center gap-6 flex-1">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold leading-tight">ReviewPilot AI</span>
          <span className="text-slate-200 text-lg font-light">/</span>
          <span className="text-slate-900 font-bold text-[15px]">{currentPage}</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative w-full max-w-md ml-4">
          <div className="absolute left-3 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search reviews, topics, customers..." 
            className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] border-none text-slate-700 text-[13px] rounded-lg pl-9 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium placeholder:text-slate-400"
          />
          <div className="absolute right-2 flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 shadow-sm">
            <Command className="w-3 h-3" />
            <span className="text-[10px] font-bold ml-0.5">K</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Business Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-blue-50/80 text-slate-700 px-3 py-1.5 rounded-lg border border-blue-100/60 shadow-sm">
          <Store className="w-4 h-4 text-[#5636f5]" />
          <div className="flex flex-col items-start text-left">
            <span className="text-[13px] font-bold leading-none text-slate-900">{businessName}</span>
          </div>
        </div>

        {/* Sync Status */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin-reverse" />
          <span className="text-[11px] font-semibold text-slate-600">FastAPI Live</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

        {/* User Profile / Login status */}
        {currentUser ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-blue-100">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">Session Active</span>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        )}
      </div>

    </header>
  );
}
