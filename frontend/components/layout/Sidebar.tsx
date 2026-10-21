"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logoutUser, UserProfile } from '../../app/lib/api';
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
  User,
  LucideIcon
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    color: string;
  };
  status?: {
    text: string;
    color: string;
    dot: string;
  };
};

type NavGroup = {
  section: string;
  items: NavItem[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setCurrentUser(null);
    router.push('/login');
  };

  const navItems: NavGroup[] = [
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
    <aside className="w-72 h-screen bg-slate-950 border-r border-slate-200 flex flex-col font-sans">
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#5636f5] rounded-lg flex items-center justify-center text-white font-bold text-md shadow-md">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-10 text-[15px] leading-tight">ReviewPilot AI</span>
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
            <h3 className="px-3 text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-3">
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
                        : "text-slate-100 hover:bg-slate-900/50 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "text-slate-300 group-hover:text-slate-300"}`} />
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
              <p className="text-sm font-bold text-slate-900 truncate">
                {currentUser?.name || "Dinuka Alwis"}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-medium">
                {currentUser?.email || "dinuka@cafe.com"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Link href="/dashboard/reviews" className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              <Settings className="w-4 h-4" />
              Reviews
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
