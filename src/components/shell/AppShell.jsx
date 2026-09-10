import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

export default function AppShell() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding' || location.pathname === '/profile' || location.pathname === '/baseline';

  return (
    <div className="min-h-screen bg-[#0A1412] flex items-center justify-center p-0 md:p-8">
      {/* Phone Mockup Frame */}
      <div className="w-full max-w-[420px] h-full md:h-[850px] max-h-screen bg-ink md:rounded-[2.5rem] md:border-[12px] border-[#16231F] shadow-2xl overflow-hidden relative flex flex-col mx-auto">
        
        {/* Mock notch / dynamic island area */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none hidden md:flex">
          <div className="w-32 h-7 bg-[#16231F] rounded-b-3xl"></div>
        </div>

        <div className="flex flex-col flex-1 min-h-0 relative z-10 pt-0 md:pt-6 bg-ink">
          {!isOnboarding && <TopBar />}
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar pb-10">
            <Outlet />
          </main>
          
          {!isOnboarding && <BottomNav />}
        </div>
      </div>
    </div>
  );
}
