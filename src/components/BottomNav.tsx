/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  CheckSquare,
  Clock,
  Layers,
  Wrench,
  Calendar,
  FileSpreadsheet,
  Settings,
  Sliders,
  LayoutGrid,
  TrendingUp,
  Network
} from 'lucide-react';
import { UserProfile } from '../types';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  checklistProgress: number;
  pendingTodosCount?: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenDatabase?: (tab?: 'backup' | 'csv-import') => void;
  onOpenSettings: () => void;
  onOpenUserModal?: (tab?: 'profile' | 'roles') => void;
  onOpenChat?: () => void;
  onOpenAndroidPackage?: () => void;
  onOpenAuth?: () => void;
  profile?: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  checklistProgress,
  onOpenSettings
}) => {
  // All Core Tabs (Floor Plan & Line Setup merged)
  const allTabs = [
    {
      id: 'dashboard',
      label: 'Home',
      fullLabel: 'Production Dashboard',
      icon: Activity,
      badge: undefined
    },
    {
      id: 'linedata',
      label: 'Lines',
      fullLabel: 'Workstation & Line Balancing',
      icon: Layers,
      badge: undefined
    },
    {
      id: 'floor-plan',
      label: 'Floor & Setup',
      fullLabel: 'Visual Sewing Floor Plan & Line Setup',
      icon: LayoutGrid,
      badge: 'MAP'
    },
    {
      id: 'simulator',
      label: 'Simulator',
      fullLabel: 'IE Line Setup & Flow Simulator',
      icon: Sliders,
      badge: 'PRO'
    },
    {
      id: 'checklist',
      label: 'Activity Track',
      fullLabel: 'IE Daily Activity Tracking',
      icon: CheckSquare,
      badge: `${checklistProgress}%`
    },
    {
      id: 'todo-schedule',
      label: 'To-Do',
      fullLabel: 'Floor Tasks & Shift Timeline',
      icon: Clock,
      badge: undefined
    },
    {
      id: 'lean-toolkit',
      label: 'Lean WCM',
      fullLabel: 'Lean 13 Methods & Kaizens',
      icon: Wrench,
      badge: undefined
    },
    {
      id: 'monthly',
      label: 'Monthly',
      fullLabel: 'Monthly Efficiency Analytics',
      icon: Calendar,
      badge: undefined
    },
    {
      id: 'reports',
      label: 'Reports',
      fullLabel: 'Shift Audit Reports & CSV',
      icon: FileSpreadsheet,
      badge: undefined
    },
    {
      id: 'line-history',
      label: 'Line History',
      fullLabel: 'Line Production History & Efficiency Chart',
      icon: TrendingUp,
      badge: 'CHART'
    },
    {
      id: 'roles',
      label: 'IE Org',
      fullLabel: 'Debonair Unit-02 IE Org & Roles',
      icon: Network,
      badge: 'DEBONAIR'
    }
  ];

  const isTabActive = (tabId: string) =>
    currentTab === tabId ||
    (tabId === 'line-history' && (currentTab === 'history' || currentTab === 'production-history')) ||
    (tabId === 'floor-plan' && (currentTab === 'line-management' || currentTab === 'floorplan'));

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#fbfaf6]/95 backdrop-blur-md border-t border-[#d9d2c2] shadow-[0_-4px_20px_rgba(12,28,45,0.10)] pb-[env(safe-area-inset-bottom)] cockpit-nav"
    >
      <div className="max-w-[1500px] mx-auto px-2 sm:px-6">
        {/* Mobile View: 5 slots (Home, Lines, Simulator, Checklist, and Settings) */}
        <div className="flex md:hidden items-center justify-around h-16 select-none">
          {/* 1. Home */}
          <button
            id="bottom-nav-mobile-dashboard"
            onClick={() => handleTabClick('dashboard')}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'dashboard'
                ? 'text-[#176f78]'
                : 'text-slate-500 hover:text-[#176f78]'
            }`}
          >
            <div className="relative">
              <Activity
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'dashboard' ? 'scale-110' : ''
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                currentTab === 'dashboard' ? 'font-bold' : 'font-medium'
              }`}
            >
              Home
            </span>
            {currentTab === 'dashboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#176f78] mt-0.5 animate-fadeIn" />
            )}
          </button>

          {/* 2. Lines */}
          <button
            id="bottom-nav-mobile-lines"
            onClick={() => handleTabClick('linedata')}
            aria-current={currentTab === 'linedata' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'linedata'
                ? 'text-[#176f78]'
                : 'text-slate-500 hover:text-[#176f78]'
            }`}
          >
            <div className="relative">
              <Layers
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'linedata' ? 'scale-110' : ''
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                currentTab === 'linedata' ? 'font-bold' : 'font-medium'
              }`}
            >
              Lines
            </span>
            {currentTab === 'linedata' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#176f78] mt-0.5 animate-fadeIn" />
            )}
          </button>

          {/* 3. Simulator */}
          <button
            id="bottom-nav-mobile-simulator"
            onClick={() => handleTabClick('simulator')}
            aria-current={currentTab === 'simulator' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all relative cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'simulator'
                ? 'text-[#176f78]'
                : 'text-slate-500 hover:text-[#176f78]'
            }`}
          >
            <div className="relative">
              <Sliders
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'simulator' ? 'scale-110' : ''
                }`}
              />
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[8px] font-mono-numbers font-bold bg-[#176f78] text-white">
                PRO
              </span>
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                currentTab === 'simulator' ? 'font-bold' : 'font-medium'
              }`}
            >
              Simulator
            </span>
            {currentTab === 'simulator' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#176f78] mt-0.5 animate-fadeIn" />
            )}
          </button>

          {/* 4. Checklist */}
          <button
            id="bottom-nav-mobile-checklist"
            onClick={() => handleTabClick('checklist')}
            aria-current={currentTab === 'checklist' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all relative cursor-pointer touch-manipulation active:scale-95 ${
              currentTab === 'checklist'
                ? 'text-[#176f78]'
                : 'text-slate-500 hover:text-[#176f78]'
            }`}
          >
            <div className="relative">
              <CheckSquare
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'checklist' ? 'scale-110' : ''
                }`}
              />
              <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8px] font-mono-numbers font-bold bg-[#dceceb] text-[#176f78] border border-[#176f78]/20">
                {checklistProgress}%
              </span>
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                currentTab === 'checklist' ? 'font-bold' : 'font-medium'
              }`}
            >
              Activity
            </span>
            {currentTab === 'checklist' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#176f78] mt-0.5 animate-fadeIn" />
            )}
          </button>

          {/* 5. Settings Button (Replaced More button) */}
          <button
            id="bottom-nav-mobile-settings"
            onClick={onOpenSettings}
            title="Open Settings & IE Control Center"
            aria-label="Settings"
            className="flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all relative cursor-pointer touch-manipulation active:scale-95 text-slate-500 hover:text-[#176f78] group"
          >
            <div className="relative">
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium group-hover:text-[#176f78]">
              Settings
            </span>
          </button>
        </div>

        {/* Tablet & Desktop View: Seamless Bottom Navigation Dock */}
        <div className="hidden md:flex items-center justify-between h-14">
          {/* Left label / brand indicator */}
          <div className="flex items-center gap-2 text-xs text-[#527078]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#17343a]">Floor Status:</span>
            <span>All Lines Operational</span>
          </div>

          {/* Center Tabs */}
          <div
            id="bottom-nav-desktop-tabs"
            className="flex items-center gap-1 bg-[#f1eee6] p-1 rounded-2xl border border-[#d9d2c2]"
          >
            {allTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  id={`bottom-nav-desktop-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-[#176f78] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#176f78] hover:bg-[#e7e1d5]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#dceceb] text-[#176f78]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Settings & Control Center Button (Replaced More button) */}
          <div className="flex items-center gap-2">
            <button
              id="bottom-nav-desktop-settings-btn"
              onClick={onOpenSettings}
              title="Open Settings & IE Control Center"
              aria-label="Settings & Control Center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1eee6] border border-[#d9d2c2] text-xs font-bold text-[#17343a] hover:bg-[#e7e1d5] hover:text-[#176f78] transition-colors cursor-pointer group shadow-2xs touch-manipulation active:scale-95"
            >
              <Settings className="w-3.5 h-3.5 text-[#176f78] transition-transform group-hover:rotate-45 duration-300" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
