/**
 * Smart Legal Metrology — NAWI Test & Compliance System
 * Ministry of Consumer Affairs, Food & Public Distribution | Government of India
 * Complete Application Entry Point
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AssistantModal } from './components/AssistantModal';
import { VerificationModal } from './components/VerificationModal';
import {
  DashboardStatsSkeleton,
  TableSkeleton,
  CardSkeleton,
} from './components/SkeletonLoader';

import { AuthView } from './pages/AuthView';
import { DashboardView } from './pages/DashboardView';
import { TestWizardView } from './pages/TestWizardView';
import { AllReportsView } from './pages/AllReportsView';
import { MLAnalyticsView } from './pages/MLAnalyticsView';
import { InventoryView } from './pages/InventoryView';

import { api } from './services/api';
import {
  UserProfile,
  LabProject,
  TestReport,
  InventoryItem,
  NotificationItem,
  InstrumentDetails,
  TestSession,
} from './types';

export default function App() {
  // Authentication gate — must sign in before anything else renders
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Navigation & view state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // System actors (switchable to test RBAC)
  const users: UserProfile[] = [
    {
      id: 'usr-1',
      name: 'Dr. Rajeshwar Sharma',
      officialId: 'MCA-DIR-001',
      role: 'ADMIN',
      designation: 'Director & Chief Metrologist',
      laboratory: 'RRSL, Faridabad',
      email: 'dir.rrsl-ca@gov.in',
    },
    {
      id: 'usr-2',
      name: 'Alok Kumar Verma',
      officialId: 'MCA-TECH-002',
      role: 'LAB_TECHNICIAN',
      designation: 'Senior Metrological Officer',
      laboratory: 'RRSL, Faridabad',
      email: 'ak.verma.lm@nic.in',
    },
    {
      id: 'usr-3',
      name: 'Meenakshi Sundaram',
      officialId: 'MCA-REV-003',
      role: 'REVIEWER',
      designation: 'Legal Metrology Inspector',
      laboratory: 'Department of Consumer Affairs',
      email: 'm.sundaram@gov.in',
    },
  ];

  const [currentUser, setCurrentUser] = useState<UserProfile>(users[0]);
  const [isOffline, setIsOffline] = useState<boolean>(api.isOfflineMode());

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [instruments, setInstruments] = useState<InstrumentDetails[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<TestReport | null>(null);

  // Load all foundational data
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dash, projList, repList, invList, notifList, instList] = await Promise.all([
        api.getDashboard(),
        api.getProjects(),
        api.getReports(),
        api.getInventory(),
        api.getNotifications(),
        api.getInstruments(),
      ]);

      setDashboardData(dash);
      setProjects(projList);
      setReports(repList);
      setInventory(invList);
      setNotifications(notifList);
      setInstruments(instList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      // Simulate realistic smooth transition for skeleton loader
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Offline toggle handler
  const handleToggleOffline = () => {
    setIsOffline((currentMode) => {
      const nextMode = !currentMode;
      api.setOfflineMode(nextMode);
      return nextMode;
    });
  };

  // Switch role handler
  const handleRoleChange = (role: string) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Project update handler (Lab tracker)
  const handleUpdateProject = async (id: string, updates: Partial<LabProject>) => {
    const updated = await api.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  // Create project handler
  const handleCreateProject = async (projectData: any) => {
    const created = await api.createProject(projectData);
    setProjects((prev) => [created, ...prev]);
  };

  // Save session handler
  const handleSaveSession = async (sessionData: Partial<TestSession>) => {
    return await api.createTestSession(sessionData);
  };

  // Generate report handler
  const handleGenerateReport = async (payload: any) => {
    const report = await api.generateReport(payload);
    setReports((prev) => [report, ...prev]);
    // Refresh dashboard KPIs
    api.getDashboard().then((d) => setDashboardData(d));
    return report;
  };

  // Inventory update handler
  const handleUpdateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updated = await api.updateInventoryItem(id, updates);
    setInventory((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  // Filter low inventory alerts
  const inventoryAlerts = inventory.filter(
    (item) => item.quantity <= item.minThreshold || item.isExpiringSoon
  );

  // GATE: unauthenticated users only ever see the login page.
  // AuthView hands back the role that was signed in with; we map it onto
  // one of the seeded demo users so the rest of the app behaves exactly
  // as before once past this screen.
  if (!isAuthenticated) {
    return (
      <AuthView
        onLogin={(role) => {
          handleRoleChange(role);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F7] text-[#162F4D] flex flex-col font-sans">
      {/* Official Top Institutional Bar & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingReport(null);
        }}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        currentUser={currentUser}
        onSwitchUser={handleRoleChange}
        notifications={notifications}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="space-y-6">
            <DashboardStatsSkeleton />
            <CardSkeleton count={3} />
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <>
            {/* VIEW: DASHBOARD */}
            {activeTab === 'dashboard' && dashboardData && (
              <DashboardView
                kpis={{
                  completedReports: reports.length,
                  activeSessions: dashboardData.activeSessionsCount || 3,
                  pendingReviews: dashboardData.pendingReviewsCount || 2,
                  totalInstruments: instruments.length,
                  passRatePercentage: dashboardData.passRatePercentage || 92,
                  lowInventoryCount: inventoryAlerts.length,
                  activeProjectsCount: projects.filter((p) => p.status !== 'COMPLETED').length,
                }}
                projects={projects}
                recentReports={reports.slice(0, 4)}
                notifications={notifications}
                inventoryAlerts={inventoryAlerts}
                currentUser={currentUser}
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectReport={(rep) => {
                  setViewingReport(rep);
                  setActiveTab('reports');
                }}
                onUpdateProject={handleUpdateProject}
                onCreateProject={handleCreateProject}
              />
            )}

            {/* VIEW: OIML R-76 TEST WIZARD */}
            {activeTab === 'wizard' && (
              <TestWizardView
                instruments={instruments}
                onSaveSession={handleSaveSession}
                onGenerateReport={handleGenerateReport}
                onViewReport={(rep) => {
                  setViewingReport(rep);
                  setActiveTab('reports');
                }}
              />
            )}

            {/* VIEW: ALL REPORTS REPOSITORY */}
            {activeTab === 'reports' && (
              <AllReportsView
                reports={reports}
                selectedReport={viewingReport}
                onSelectReport={setViewingReport}
                onVerifyToken={(tok) => setVerificationToken(tok)}
              />
            )}

            {/* VIEW: LAB PROJECTS TRACKER (Standalone view) */}
            {activeTab === 'projects' && dashboardData && (
              <div className="space-y-6">
                <DashboardView
                  kpis={{
                    completedReports: reports.length,
                    activeSessions: dashboardData.activeSessionsCount || 3,
                    pendingReviews: dashboardData.pendingReviewsCount || 2,
                    totalInstruments: instruments.length,
                    passRatePercentage: dashboardData.passRatePercentage || 92,
                    lowInventoryCount: inventoryAlerts.length,
                    activeProjectsCount: projects.filter((p) => p.status !== 'COMPLETED').length,
                  }}
                  projects={projects}
                  recentReports={reports.slice(0, 4)}
                  notifications={notifications}
                  inventoryAlerts={inventoryAlerts}
                  currentUser={currentUser}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectReport={(rep) => {
                    setViewingReport(rep);
                    setActiveTab('reports');
                  }}
                  onUpdateProject={handleUpdateProject}
                  onCreateProject={handleCreateProject}
                />
              </div>
            )}

            {/* VIEW: MULTI-SAMPLE ML ANALYTICS */}
            {activeTab === 'ml' && <MLAnalyticsView reports={reports} />}

            {/* VIEW: INVENTORY & REFERENCE WEIGHTS */}
            {activeTab === 'inventory' && (
              <InventoryView
                inventory={inventory}
                currentUser={currentUser}
                onUpdateItem={handleUpdateInventoryItem}
              />
            )}

            {/* VIEW: ADMINISTRATION & RULES */}
            {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
              <section className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2F699C]">Administration</p>
                  <h1 className="mt-1 text-2xl font-bold text-[#162F4D]">Rules & Laboratory Controls</h1>
                  <p className="mt-2 text-sm text-[#6F7478]">
                    Manage the operational areas used to review, test, and authorize NAWI evaluations.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    onClick={() => setActiveTab('wizard')}
                    className="rounded-md border border-[#D7E6F2] bg-white p-5 text-left shadow-sm hover:border-[#2F699C]"
                  >
                    <div className="font-bold text-[#162F4D]">Test Sessions</div>
                    <div className="mt-1 text-xs text-[#6F7478]">Open the OIML R-76 test entry workflow.</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="rounded-md border border-[#D7E6F2] bg-white p-5 text-left shadow-sm hover:border-[#2F699C]"
                  >
                    <div className="font-bold text-[#162F4D]">Inventory Controls</div>
                    <div className="mt-1 text-xs text-[#6F7478]">Review reference weights and laboratory supplies.</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="rounded-md border border-[#D7E6F2] bg-white p-5 text-left shadow-sm hover:border-[#2F699C]"
                  >
                    <div className="font-bold text-[#162F4D]">Report Authorization</div>
                    <div className="mt-1 text-xs text-[#6F7478]">Review generated reports and verification tokens.</div>
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Grounded OIML Technical Assistant Modal */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Cryptographic QR Token Authenticity Modal */}
      <VerificationModal
        token={verificationToken}
        onClose={() => setVerificationToken(null)}
      />

      {/* Institutional Legal Metrology Footer */}
      <Footer />
    </div>
  );
}
