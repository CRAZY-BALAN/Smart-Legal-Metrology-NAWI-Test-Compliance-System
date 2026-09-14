/**
 * Government Portal Header & Navigation Bar
 * Conforms to National Informatics Centre (NIC) and Ministry of Consumer Affairs guidelines.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Activity,
  Layers,
  Archive,
  Cpu,
  HelpCircle,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  AlertTriangle,
  Clock,
  LogOut,
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  onSwitchUser: (role: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  notifications: NotificationItem[];
  onOpenAssistant: () => void;
  onViewVerifyToken?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  isOffline,
  onToggleOffline,
  notifications,
  onOpenAssistant,
  onLogout,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E9F4FD]">
      {/* Top Tricolor & Ministry Header Bar — scrolls away with the page,
          it does NOT stick, so it stops eating permanent screen space */}
      <div className="bg-[#162F4D] text-[#FFFFFF] px-4 py-2 border-b border-[#234B70]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between text-xs gap-2">
          {/* Government of India Official Identity */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isOffline ? (
  <div className="w-10 h-10 rounded-md bg-[#2F699C] flex items-center justify-center">
    <ShieldCheck className="w-6 h-6 text-white" />
  </div>
) : (
  <img
    src={`${import.meta.env.BASE_URL}assets/doca/dca-logo.png`}
    alt="Department of Consumer Affairs"
    className="h-10 w-auto object-contain"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
      if (fallback) fallback.style.display = 'flex';
    }}
  />
)}

{!isOffline && (
  <div
    className="w-10 h-10 rounded-md bg-[#2F699C] items-center justify-center"
    style={{ display: 'none' }}
  >
    <ShieldCheck className="w-6 h-6 text-white" />
  </div>
)}
              <div className="leading-tight">
                <div className="font-semibold text-white tracking-wide uppercase">
                  Government of India | भारत सरकार
                </div>
                <div className="text-gray-300 text-[11px]">
                  Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology Division
                </div>
              </div>
            </div>
          </div>

          {/* Right Status Controls: Offline Mode Toggle & Role Selector */}
          <div className="flex items-center space-x-3">
            {/* Offline Laboratory Toggle */}
            <button
              id="offline-toggle-btn"
              onClick={onToggleOffline}
              title={isOffline ? 'Switch to Online Mode' : 'Switch to Offline Laboratory Mode'}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-colors ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400'
                  : 'bg-[#1A7A4A]/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-300" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isOffline ? 'Offline Lab Mode' : 'Online Sync Active'}</span>
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                id="role-switch-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-[#234B70] hover:bg-[#2F699C] text-white text-[11px] transition-colors border border-white/10"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1683C5]" />
                <span className="font-medium">
                  {currentUser.role === 'ADMIN'
                    ? 'Admin Access'
                    : currentUser.role === 'LAB_TECHNICIAN'
                    ? 'Lab Technician'
                    : 'Reviewer / Scientist'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-300" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-white text-[#162F4D] rounded-md shadow-lg border border-gray-200 py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-gray-100 bg-[#F6F7F7]">
                    <div className="font-semibold">{currentUser.name}</div>
                    <div className="text-[10px] text-[#6F7478]">{currentUser.designation}</div>
                  </div>
                  <button
                    onClick={() => {
                      onSwitchUser('LAB_TECHNICIAN');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#E9F4FD] flex flex-col ${
                      currentUser.role === 'LAB_TECHNICIAN' ? 'bg-[#E9F4FD] font-semibold text-[#2F699C]' : ''
                    }`}
                  >
                    <span>Lab Technician (Testing & Tasks)</span>
                    <span className="text-[10px] text-[#6F7478]">Enter observations, update progress</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('ADMIN');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#E9F4FD] flex flex-col ${
                      currentUser.role === 'ADMIN' ? 'bg-[#E9F4FD] font-semibold text-[#2F699C]' : ''
                    }`}
                  >
                    <span>Administrator (Full Access)</span>
                    <span className="text-[10px] text-[#6F7478]">Manage deadlines, rules & inventory</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('REVIEWER');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#E9F4FD] flex flex-col ${
                      currentUser.role === 'REVIEWER' ? 'bg-[#E9F4FD] font-semibold text-[#2F699C]' : ''
                    }`}
                  >
                    <span>Technical Reviewer / Scientist</span>
                    <span className="text-[10px] text-[#6F7478]">Validate calculations & approve reports</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Only THIS slim bar sticks on scroll — the compact bar people actually
          need while working, instead of the whole tall header block */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E9F4FD]">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* App Title */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          {isOffline ? (
  <div className="w-10 h-10 rounded-md bg-[#2F699C] flex items-center justify-center">
    <ShieldCheck className="w-6 h-6 text-white" />
  </div>
) : (
  <img
    src={`${import.meta.env.BASE_URL}assets/doca/dca-logo.png`}
    alt="Department of Consumer Affairs"
    className="h-10 w-auto object-contain"
  />
)}
          <div>
            <div className="font-bold text-[#162F4D] text-base tracking-tight leading-tight">
              Smart Legal Metrology
            </div>
            <div className="text-[11px] text-[#234B70] font-medium">
              NAWI Test & Compliance System (OIML R-76)
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 ml-20">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-wizard"
            onClick={() => setActiveTab('wizard')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'wizard'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>OIML Test Wizard</span>
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'reports'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>All Reports Gallery</span>
          </button>

          <button
            id="nav-tab-projects"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'projects'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects & Lab Work</span>
          </button>

          <button
            id="nav-tab-ml"
            onClick={() => setActiveTab('ml')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ml'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Sample Analytics</span>
          </button>

          <button
            id="nav-tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                : 'text-[#234B70] hover:bg-[#F6F7F7]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lab Inventory</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#E9F4FD] text-[#2F699C] border border-blue-200'
                  : 'text-[#234B70] hover:bg-[#F6F7F7]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Rules</span>
            </button>
          )}
        </nav>

        {/* Right Tools: Notification Bell & Assistant Button */}
        <div className="flex items-center space-x-2">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notifs-bell-btn"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-md hover:bg-[#F6F7F7] text-[#234B70] transition-colors"
              title="Lab Operations & Stock Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C0392B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-[#162F4D]">Lab Operational Alerts</div>
                  <span className="bg-[#E9F4FD] text-[#2F699C] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {notifications.length} Total
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 hover:bg-[#F6F7F7] transition-colors ${
                        !item.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {item.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-4 h-4 text-[#C0392B] shrink-0 mt-0.5" />
                        ) : item.severity === 'WARNING' ? (
                          <AlertTriangle className="w-4 h-4 text-[#D4870A] shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-[#1683C5] shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-[#162F4D] leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[#6F7478] text-[11px] mt-0.5 leading-relaxed">
                            {item.message}
                          </div>
                          <div className="text-[9px] text-[#6F7478] mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OIML R-76 Assistant */}
          <button
            id="assistant-launcher-btn"
            onClick={onOpenAssistant}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#2F699C] hover:bg-[#162F4D] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-white" />
            <span>R-76 Assistant</span>
          </button>

          {onLogout && (
            <button
              id="logout-btn"
              onClick={onLogout}
              title="Sign out"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 hover:border-[#C0392B] hover:bg-red-50 text-[#6F7478] hover:text-[#C0392B] text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden px-4 py-2 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto text-xs bg-[#F6F7F7]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'wizard' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          Test Wizard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          All Reports
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'projects' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('ml')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'ml' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          ML Analytics
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
          }`}
        >
          Inventory
        </button>
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-[#2F699C] text-white font-medium' : 'text-[#234B70]'
            }`}
          >
            Admin
          </button>
        )}
      </div>
      </div>
    </header>
  );
};
