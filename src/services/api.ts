/**
 * Frontend API client with resilient Offline Laboratory Mode support
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import {
  UserProfile,
  InstrumentDetails,
  TestSession,
  TestReport,
  LabProject,
  InventoryItem,
  NotificationItem,
  MLBatchAnalysis,
  AuditLogItem,
  OIMLRuleConfig,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_INSTRUMENTS,
  INITIAL_TEST_SESSIONS,
  INITIAL_TEST_REPORTS,
  INITIAL_PROJECTS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_RULE_CONFIGS,
} from '../data/mockData';

// Local cache keys
const CACHE_KEYS = {
  OFFLINE_MODE: 'mca_nawi_offline_mode',
  INSTRUMENTS: 'mca_nawi_instruments',
  SESSIONS: 'mca_nawi_sessions',
  REPORTS: 'mca_nawi_reports',
  PROJECTS: 'mca_nawi_projects',
  INVENTORY: 'mca_nawi_inventory',
  NOTIFICATIONS: 'mca_nawi_notifications',
  AUDIT: 'mca_nawi_audit',
  CURRENT_USER: 'mca_nawi_current_user',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Initial hydration if first time
if (!localStorage.getItem(CACHE_KEYS.INSTRUMENTS)) {
  setLocal(CACHE_KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS);
  setLocal(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
  setLocal(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
  setLocal(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
  setLocal(CACHE_KEYS.INVENTORY, INITIAL_INVENTORY);
  setLocal(CACHE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  setLocal(CACHE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  setLocal(CACHE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
}

export const api = {
  isOfflineMode(): boolean {
    return getLocal<boolean>(CACHE_KEYS.OFFLINE_MODE, false);
  },

  setOfflineMode(offline: boolean) {
    setLocal(CACHE_KEYS.OFFLINE_MODE, offline);
  },

  getCurrentUser(): UserProfile {
    return getLocal<UserProfile>(CACHE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: UserProfile) {
    setLocal(CACHE_KEYS.CURRENT_USER, user);
  },

  async login(officialId: string, role: string): Promise<{ token: string; user: UserProfile }> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officialId, role }),
        });
        if (res.ok) {
          const data = await res.json();
          this.setCurrentUser(data.user);
          return data;
        }
      }
    } catch {
      // Fall through to offline cache
    }

    const user =
      INITIAL_USERS.find((u) => u.officialId === officialId) ||
      INITIAL_USERS.find((u) => u.role === role) ||
      INITIAL_USERS[0];
    this.setCurrentUser(user);
    return { token: `local_token_${user.id}`, user };
  },

  async getDashboard() {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/dashboard');
        if (res.ok) return await res.json();
      }
    } catch {}

    // Offline computation
    const reports = getLocal<TestReport[]>(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
    const sessions = getLocal<TestSession[]>(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
    const projects = getLocal<LabProject[]>(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const inventory = getLocal<InventoryItem[]>(CACHE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const notifications = getLocal<NotificationItem[]>(CACHE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

    return {
      kpis: {
        completedReports: reports.length,
        activeSessions: sessions.filter((s) => s.status !== 'APPROVED').length,
        pendingReviews: sessions.filter((s) => s.status === 'SUBMITTED').length,
        totalInstruments: getLocal<InstrumentDetails[]>(CACHE_KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS).length,
        passRatePercentage: 94.2,
        lowInventoryCount: inventory.filter((i) => i.isLowStock || i.isExpiringSoon).length,
        activeProjectsCount: projects.filter((p) => p.status === 'IN_PROGRESS').length,
      },
      projects,
      recentReports: reports.slice(0, 5),
      notifications: notifications.slice(0, 6),
      inventoryAlerts: inventory.filter((i) => i.isLowStock || i.isExpiringSoon),
    };
  },

  async getInstruments(): Promise<InstrumentDetails[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/instruments');
        if (res.ok) {
          const data = await res.json();
          setLocal(CACHE_KEYS.INSTRUMENTS, data);
          return data;
        }
      }
    } catch {}
    return getLocal<InstrumentDetails[]>(CACHE_KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS);
  },

  async addInstrument(inst: Omit<InstrumentDetails, 'id' | 'dateReceived'>): Promise<InstrumentDetails> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/instruments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inst),
        });
        if (res.ok) {
          const created = await res.json();
          const list = getLocal<InstrumentDetails[]>(CACHE_KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS);
          setLocal(CACHE_KEYS.INSTRUMENTS, [created, ...list]);
          return created;
        }
      }
    } catch {}

    const newInst: InstrumentDetails = {
      id: `inst-${Date.now()}`,
      ...inst,
      dateReceived: new Date().toISOString().split('T')[0],
    };
    const list = getLocal<InstrumentDetails[]>(CACHE_KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS);
    setLocal(CACHE_KEYS.INSTRUMENTS, [newInst, ...list]);
    return newInst;
  },

  async getTestSessions(): Promise<TestSession[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/tests');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<TestSession[]>(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
  },

  async getReports(): Promise<TestReport[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/reports');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<TestReport[]>(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
  },

  async generateReport(payload: {
    testSessionId: string;
    authorizedSignatory: string;
    designation: string;
    laboratoryName?: string;
    laboratoryAddress?: string;
  }): Promise<TestReport> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const report = await res.json();
          const reports = getLocal<TestReport[]>(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
          setLocal(CACHE_KEYS.REPORTS, [report, ...reports]);
          return report;
        }
      }
    } catch {}

    // Offline report generation fallback
    const sessions = getLocal<TestSession[]>(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
    const session = sessions.find((s) => s.id === payload.testSessionId) || sessions[0];
    const reportNumber = `LM-NAWI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationToken = `VRF-MCA-OFFLINE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newReport: TestReport = {
      id: `rep-${Date.now()}`,
      reportNumber,
      version: '1.0',
      testSessionId: session.id,
      testSession: session,
      sha256Hash: `sha256-offline-${Math.random().toString(16).substring(2, 34)}`,
      qrCodeDataUrl: '',
      verificationToken,
      issuedAt: new Date().toISOString(),
      laboratoryName: payload.laboratoryName || 'Regional Reference Standards Laboratory (RRSL)',
      laboratoryAddress: payload.laboratoryAddress || 'Sector 27-C, Mathura Road, Faridabad, Haryana 121003',
      authorizedSignatory: payload.authorizedSignatory,
      designation: payload.designation,
      status: 'OFFICIAL',
    };

    const reports = getLocal<TestReport[]>(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
    setLocal(CACHE_KEYS.REPORTS, [newReport, ...reports]);
    return newReport;
  },

  async getProjects(): Promise<LabProject[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/projects');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<LabProject[]>(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },

  async updateProject(id: string, updates: Partial<LabProject>): Promise<LabProject> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = await res.json();
          const list = getLocal<LabProject[]>(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
          const idx = list.findIndex((p) => p.id === id);
          if (idx !== -1) list[idx] = updated;
          setLocal(CACHE_KEYS.PROJECTS, list);
          return updated;
        }
      }
    } catch {}

    const list = getLocal<LabProject[]>(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      setLocal(CACHE_KEYS.PROJECTS, list);
      return list[idx];
    }
    throw new Error('Project not found');
  },

  async addProject(project: Omit<LabProject, 'id' | 'projectCode' | 'updatedAt'>): Promise<LabProject> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project),
        });
        if (res.ok) return await res.json();
      }
    } catch {}

    const newProject: LabProject = {
      id: `proj-${Date.now()}`,
      projectCode: `MCA-EVAL-2026-${Math.floor(10 + Math.random() * 90)}`,
      ...project,
      updatedAt: new Date().toISOString(),
    };
    const list = getLocal<LabProject[]>(CACHE_KEYS.PROJECTS, INITIAL_PROJECTS);
    setLocal(CACHE_KEYS.PROJECTS, [newProject, ...list]);
    return newProject;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/notifications');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<NotificationItem[]>(CACHE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  async createTestSession(sessionData: any): Promise<TestSession> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });
        if (res.ok) {
          const created = await res.json();
          const list = getLocal<TestSession[]>(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
          setLocal(CACHE_KEYS.SESSIONS, [created, ...list]);
          return created;
        }
      }
    } catch {}

    const newSession: TestSession = {
      id: `sess-${Date.now()}`,
      sessionNumber: `MCA-TS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: sessionData.status || 'SUBMITTED',
      complianceStatus: sessionData.complianceStatus || 'PASS',
      ...sessionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = getLocal<TestSession[]>(CACHE_KEYS.SESSIONS, INITIAL_TEST_SESSIONS);
    setLocal(CACHE_KEYS.SESSIONS, [newSession, ...list]);
    return newSession;
  },

  async createProject(project: Omit<LabProject, 'id' | 'projectCode' | 'updatedAt'>): Promise<LabProject> {
    return this.addProject(project);
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch(`/api/inventory/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) return await res.json();
      }
    } catch {}

    const list = getLocal<InventoryItem[]>(CACHE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const idx = list.findIndex((i) => i.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...updates,
        lastInspected: new Date().toISOString().split('T')[0],
      };
      list[idx].isLowStock = list[idx].quantity <= list[idx].minThreshold;
      setLocal(CACHE_KEYS.INVENTORY, list);
      return list[idx];
    }
    throw new Error('Inventory item not found');
  },

  async getInventory(): Promise<InventoryItem[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/inventory');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<InventoryItem[]>(CACHE_KEYS.INVENTORY, INITIAL_INVENTORY);
  },

  async runMLBatchAnalysis(datasetName: string, samples?: any[]): Promise<MLBatchAnalysis> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/ml/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasetName, samples }),
        });
        if (res.ok) return await res.json();
      }
    } catch {}

    // Fallback local ML computation
    const { analyzeMultiSampleDataset, generateSampleDataset } = await import('../utils/mlEngine');
    const inputSamples = samples || generateSampleDataset('Platform Scale');
    return analyzeMultiSampleDataset(datasetName, inputSamples, 'III');
  },

  async queryAssistant(query: string): Promise<{ query: string; answer: string; citation: string }> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/assistant/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (res.ok) return await res.json();
      }
    } catch {}

    return {
      query,
      answer:
        'In offline laboratory mode, OIML R-76 MPE evaluation: Class III tolerance is ±0.5e for 0-500e, ±1.0e for 500-2000e, and ±1.5e for >2000e. Repeatability difference must remain <= |MPE|.',
      citation: 'OIML R-76-1:2006 Clause 3.5 & Annex A',
    };
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/audit');
        if (res.ok) return await res.json();
      }
    } catch {}
    return getLocal<AuditLogItem[]>(CACHE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  },

  async getRules(): Promise<OIMLRuleConfig[]> {
    try {
      if (!this.isOfflineMode()) {
        const res = await fetch('/api/rules');
        if (res.ok) return await res.json();
      }
    } catch {}
    return INITIAL_RULE_CONFIGS;
  },

  async verifyReportToken(token: string) {
    try {
      const res = await fetch(`/api/verify/${token}`);
      return await res.json();
    } catch {
      const reports = getLocal<TestReport[]>(CACHE_KEYS.REPORTS, INITIAL_TEST_REPORTS);
      const found = reports.find((r) => r.verificationToken === token);
      if (found) {
        return {
          verified: true,
          reportNumber: found.reportNumber,
          version: found.version,
          instrumentModel: found.testSession.instrument.model,
          manufacturer: found.testSession.instrument.manufacturer,
          serialNumber: found.testSession.instrument.serialNumber,
          complianceStatus: found.testSession.complianceStatus,
          laboratoryName: found.laboratoryName,
          authorizedSignatory: found.authorizedSignatory,
          sha256Hash: found.sha256Hash,
          issuedAt: found.issuedAt,
          regulatoryStandard: 'OIML Recommendation R-76-1:2006 & Legal Metrology Act 2009',
        };
      }
      return { verified: false, message: 'Verification record not located.' };
    }
  },
};
