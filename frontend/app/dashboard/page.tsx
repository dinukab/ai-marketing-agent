import React from 'react';

export default function DashboardPage() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-lg">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <line x1="3" x2="21" y1="9" y2="9"/>
            <line x1="9" x2="9" y1="21" y2="9"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Layout Ready</h2>
        <p className="text-slate-500 leading-relaxed">
          Your sidebar and top navigation are fully integrated. This is the main content area where your dashboard widgets and components will live.
        </p>
      </div>
    </div>
  );
}
