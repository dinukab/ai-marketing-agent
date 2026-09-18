"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  BarChart2, 
  Sparkles, 
  Store, 
  Network, 
  Bell, 
  Settings2, 
  HelpCircle,
  Settings,
  LogOut,
  User
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
        { name: "AI Responses", href: "/dashboard/ai-responses", icon: Bot, badge: { text: "12", color: "bg-blue-600 text-white" } },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
        { name: "AI Recommendations", href: "/dashboard/recommendations", icon: Sparkles, badge: { text: "NEW", color: "bg-emerald-300 text-emerald-900" } },
      ]
    },
    {
      section: "BUSINESS",
      items: [
        { name: "My Businesses", href: "/dashboard/businesses", icon: Store },
        { name: "Google Integration", href: "/dashboard/integrations", icon: Network, status: { text: "Connected", color: "text-emerald-500", dot: "bg-emerald-500" } },
      ]
    },
    {
      section: "SYSTEM",
      items: [
        { name: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: { text: "4", color: "bg-rose-200 text-rose-700" } },
        { name: "Settings", href: "/dashboard/settings", icon: Settings2 },
        { name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(path);
  };

  return (
    <aside className="w-72 h-screen bg-slate-50 border-r border-slate-200 flex flex-col font-sans">
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-[15px] leading-tight">ReviewPilot AI</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider">V2.4 PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 rounded-full">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Live</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
        {navItems.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              {group.section}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      active 
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
                      <span className={`text-[13px] font-medium ${active ? "font-semibold" : ""}`}>
                        {item.name}
                      </span>
                    </div>
                    
                    {/* Badges or Status */}
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge.color}`}>
                        {item.badge.text}
                      </span>
                    )}
                    {item.status && (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status.dot}`}></div>
                        <span className={`text-[10px] font-bold ${item.status.color}`}>
                          {item.status.text}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-4">
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Dinuka Alwis</p>
              <p className="text-[11px] text-slate-500 truncate font-medium">Owner • dinuka@cafe.com</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              <Settings className="w-4 h-4" />
              Preferences
            </button>
            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-500 hover:text-rose-600 transition-colors">
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
