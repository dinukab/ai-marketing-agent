"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Command, Store, ChevronDown, RefreshCw, Bell, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  // Create breadcrumbs based on pathname
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  const currentPage = pathParts.length > 1 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1).replace('-', ' ') 
    : 'Dashboard';

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10 font-sans shadow-sm shadow-slate-100/50">
      
      {/* Left side: Breadcrumbs & Search */}
      <div className="flex items-center gap-6 flex-1">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold leading-tight">ReviewPilot<br/>AI</span>
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
        <button className="hidden sm:flex items-center gap-2.5 bg-blue-50/80 hover:bg-blue-100/50 text-slate-700 px-3 py-2 rounded-lg transition-colors border border-blue-100/50">
          <Store className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col items-start text-left">
            <span className="text-[13px] font-bold leading-none text-slate-900">Dinuka Cafe</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        {/* Sync Status */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[12px] font-semibold text-slate-500">Synced 12m ago</span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1"></div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell className="w-5 h-5" />
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        {/* User Profile / Avatar */}
        <button className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white ring-2 ring-white shadow-sm hover:ring-slate-100 transition-all ml-1">
          <User className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
}
