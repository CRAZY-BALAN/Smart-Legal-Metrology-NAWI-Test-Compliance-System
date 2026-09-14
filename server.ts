/**
 * Smart Legal Metrology NAWI Test & Compliance Management Server
 * Ministry of Consumer Affairs, Food & Public Distribution
 */

import express from 'express';
import path from 'path';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_INSTRUMENTS,
  INITIAL_TEST_SESSIONS,
  INITIAL_TEST_REPORTS,
  INITIAL_PROJECTS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_RULE_CONFIGS,
  INITIAL_AUDIT_LOGS,
} from './src/data/mockData.ts';
import {
  evaluateWeighingObservations,
  evaluateRepeatability,
  evaluateEccentricity,
  evaluateDiscrimination,
  determineOverallCompliance,
  generateReportIntegrityHash,
} from './src/utils/oimlCalculations.ts';
import { analyzeMultiSampleDataset, generateSampleDataset } from './src/utils/mlEngine.ts';

// In-memory state synchronized across server operations
let users = [...INITIAL_USERS];
let instruments = [...INITIAL_INSTRUMENTS];
let testSessions = [...INITIAL_TEST_SESSIONS];
let testReports = [...INITIAL_TEST_REPORTS];
let projects = [...INITIAL_PROJECTS];
let inventory = [...INITIAL_INVENTORY];
let notifications = [...INITIAL_NOTIFICATIONS];
let auditLogs = [...INITIAL_AUDIT_LOGS];
const ruleConfigs = [...INITIAL_RULE_CONFIGS];

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Pre-generate QR code for initial report
(async () => {
  try {
    const qrUrl = await QRCode.toDataURL(
      JSON.stringify({
        reportNumber: testReports[0].reportNumber,
        instrumentModel: testReports[0].testSession.instrument.model,
        serialNumber: testReports[0].testSession.instrument.serialNumber,
        complianceStatus: testReports[0].testSession.complianceStatus,
        verificationToken: testReports[0].verificationToken,
        issuedBy: testReports[0].laboratoryName,
        verifyUrl: `https://nawi-trs.gov.in/verify/${testReports[0].verificationToken}`,
      })
    );
    testReports[0].qrCodeDataUrl = qrUrl;
  } catch (err) {
    console.error('Failed to pre-generate initial QR code:', err);
  }
})();

// ==================== REST API ENDPOINTS ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Legal Metrology NAWI Test & Compliance Platform',
    organization: 'Ministry of Consumer Affairs, Food & Public Distribution',
    ruleEngineVersion: 'OIML-R76-2006-IN-REV4',
    timestamp: new Date().toISOString(),
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { officialId, role } = req.body;
  const user =
    users.find((u) => u.officialId === officialId) ||
    users.find((u) => u.role === role) ||
    users[0];

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: `${user.name} (${user.officialId})`,
    role: user.role,
    action: 'USER_LOGIN',
    entityType: 'AUTH',
    entityId: user.id,
    details: 'User authenticated into Smart Legal Metrology system.',
  });

  res.json({
    token: `jwt_token_${user.id}_${Date.now()}`,
    user,
  });
});

// Dashboard Statistics
app.get('/api/dashboard', (req, res) => {
  const completedReports = testReports.length;
  const activeSessions = testSessions.filter((s) => s.status !== 'APPROVED').length;
  const pendingReviews = testSessions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;
  const lowInventoryCount = inventory.filter((i) => i.isLowStock || i.isExpiringSoon).length;

  res.json({
    kpis: {
      completedReports,
      activeSessions,
      pendingReviews,
      totalInstruments: instruments.length,
      passRatePercentage: 94.2,
      lowInventoryCount,
      activeProjectsCount: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    },
    projects,
    recentReports: testReports.slice(0, 5),
    notifications: notifications.slice(0, 6),
    inventoryAlerts: inventory.filter((i) => i.isLowStock || i.isExpiringSoon),
  });
});

// Instruments
app.get('/api/instruments', (req, res) => {
  res.json(instruments);
});

app.post('/api/instruments', (req, res) => {
  const newInst = {
    id: `inst-${Date.now()}`,
    ...req.body,
    dateReceived: req.body.dateReceived || new Date().toISOString().split('T')[0],
  };
  instruments.unshift(newInst);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Authorized Metrology Officer',
    role: 'LAB_TECHNICIAN',
    action: 'INSTRUMENT_REGISTERED',
    entityType: 'INSTRUMENT',
    entityId: newInst.id,
    details: `Registered ${newInst.manufacturer} - ${newInst.model} (S/N: ${newInst.serialNumber}) for evaluation.`,
  });

  res.status(201).json(newInst);
});

// Test Sessions
app.get('/api/tests', (req, res) => {
  res.json(testSessions);
});

app.get('/api/tests/:id', (req, res) => {
  const session = testSessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Test session not found' });
  }
  res.json(session);
});

// Real-time calculation & validation endpoint
app.post('/api/tests/calculate', (req, res) => {
  const { weighingObservations, e, d, accuracyClass, repeatability, eccentricity, discrimination } = req.body;

  const evaluatedWeighing = evaluateWeighingObservations(weighingObservations || [], e, d, accuracyClass);
  const evaluatedRep = repeatability
    ? evaluateRepeatability(repeatability.testLoad, repeatability.readings, e, accuracyClass)
    : null;
  const evaluatedEcc = eccentricity
    ? evaluateEccentricity(eccentricity.appliedLoad, eccentricity.readings, e, accuracyClass)
    : null;
  const evaluatedDisc = discrimination ? evaluateDiscrimination(discrimination.tests) : null;

  const weighingPass = evaluatedWeighing.every((w) => w.status === 'PASS');
  const repPass = evaluatedRep ? evaluatedRep.status === 'PASS' : true;
  const eccPass = evaluatedEcc ? evaluatedEcc.status === 'PASS' : true;
  const discPass = evaluatedDisc ? evaluatedDisc.every((d) => d.passed) : true;

  const overall = determineOverallCompliance(weighingPass, repPass, eccPass, discPass);

  res.json({
    weighingObservations: evaluatedWeighing,
    repeatabilityTest: evaluatedRep,
    eccentricityTest: evaluatedEcc,
    discriminationTest: evaluatedDisc,
    complianceStatus: overall.status,
    overallVerdict: overall.summary,
  });
});

app.post('/api/tests', async (req, res) => {
  const sessionData = req.body;
  const newSession: any = {
    id: `sess-${Date.now()}`,
    sessionNumber: `TS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...sessionData,
  };

  testSessions.unshift(newSession);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: newSession.technicianName || 'Lab Technician',
    role: 'LAB_TECHNICIAN',
    action: 'TEST_SESSION_CREATED',
    entityType: 'TEST_SESSION',
    entityId: newSession.id,
    details: `Created test session ${newSession.sessionNumber} for ${newSession.instrument?.model}.`,
  });

  res.status(201).json(newSession);
});

// Reports
app.get('/api/reports', (req, res) => {
  res.json(testReports);
});

app.get('/api/reports/:id', (req, res) => {
  const report = testReports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});

app.post('/api/reports/generate', async (req, res) => {
  try {
    const { testSessionId, authorizedSignatory, designation, laboratoryName, laboratoryAddress } = req.body;
    const session = testSessions.find((s) => s.id === testSessionId);
    if (!session) {
      return res.status(404).json({ error: 'Referenced test session not found' });
    }

    const reportNumber = `LM-NAWI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationToken = `VRF-MCA-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Cryptographic SHA-256 hash representation
    const rawPayload = `${reportNumber}|${session.instrument.serialNumber}|${session.complianceStatus}|${session.overallVerdict}|${Date.now()}`;
    const sha256Hash = await generateReportIntegrityHash(rawPayload);

    // Generate QR Code data URL with official verification payload
    const qrPayload = JSON.stringify({
      reportNumber,
      instrumentModel: session.instrument.model,
      serialNumber: session.instrument.serialNumber,
      complianceStatus: session.complianceStatus,
      verificationToken,
      issuedBy: laboratoryName || 'Regional Reference Standards Laboratory (RRSL)',
      verifyUrl: `https://nawi-trs.gov.in/verify/${verificationToken}`,
      sha256Hash,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#162F4D',
        light: '#FFFFFF',
      },
    });

    const newReport: any = {
      id: `rep-${Date.now()}`,
      reportNumber,
      version: '1.0',
      testSessionId: session.id,
      testSession: session,
      sha256Hash,
      qrCodeDataUrl,
      verificationToken,
      issuedAt: new Date().toISOString(),
      laboratoryName: laboratoryName || 'Regional Reference Standards Laboratory (RRSL)',
      laboratoryAddress: laboratoryAddress || 'Sector 27-C, Mathura Road, Faridabad, Haryana 121003',
      authorizedSignatory: authorizedSignatory || 'Dr. Rajeshwar Sharma',
      designation: designation || 'Director & Authorized Government Signatory',
      status: 'OFFICIAL',
    };

    testReports.unshift(newReport);

    // Update test session status to APPROVED
    session.status = 'APPROVED';
    session.updatedAt = new Date().toISOString();

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: authorizedSignatory || 'Government Verifying Officer',
      role: 'ADMIN',
      action: 'REPORT_GENERATED',
      entityType: 'REPORT',
      entityId: newReport.id,
      details: `Generated standardized OIML R-76 report ${reportNumber} with QR verification and SHA-256 integrity seal.`,
    });

    // Notify lab
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Official Report Issued: ${reportNumber}`,
      message: `Type evaluation report for ${session.instrument.model} has been authorized and archived.`,
      type: 'REPORT_APPROVED',
      timestamp: new Date().toISOString(),
      read: false,
      severity: 'INFO',
    });

    res.status(201).json(newReport);
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

// Projects / Research tracker
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: `proj-${Date.now()}`,
    projectCode: `MCA-EVAL-2026-${Math.floor(10 + Math.random() * 90)}`,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  projects.unshift(newProject);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Project Administrator',
    role: 'ADMIN',
    action: 'PROJECT_CREATED',
    entityType: 'PROJECT',
    entityId: newProject.id,
    details: `Created lab work item "${newProject.title}".`,
  });

  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updated = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  projects[index] = updated;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: req.body.updatedBy || 'Metrology Officer',
    role: req.body.userRole || 'LAB_TECHNICIAN',
    action: 'PROJECT_UPDATED',
    entityType: 'PROJECT',
    entityId: updated.id,
    details: `Updated progress to ${updated.progressPercentage}%. Remaining tasks logged.`,
  });

  res.json(updated);
});

// Laboratory Inventory & Chemicals Monitoring
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.put('/api/inventory/:id', (req, res) => {
  const index = inventory.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }

  const updated = { ...inventory[index], ...req.body };
  updated.isLowStock = updated.quantity <= updated.minThreshold;
  inventory[index] = updated;

  res.json(updated);
});

// Machine Learning Multi-Sample Analytics API
app.post('/api/ml/analyze', async (req, res) => {
  try {
    const { datasetName, samples, accuracyClass } = req.body;
    const inputSamples = samples && samples.length > 0 ? samples : generateSampleDataset('Platform Scale');
    const result = analyzeMultiSampleDataset(datasetName || 'Multi-Sample Batch Run #2026-B4', inputSamples, accuracyClass || 'III');

    // Generate QR code for analytical report verification
    result.analyticalReportQr = await QRCode.toDataURL(
      JSON.stringify({
        analyticalReportId: result.id,
        dataset: result.datasetName,
        consistencyScore: `${result.consistencyScore}%`,
        anomalyCount: result.anomalyCount,
        riskRating: result.complianceRiskRating,
        verifyUrl: `https://nawi-trs.gov.in/verify-analytics/${result.id}`,
      })
    );

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Automated ML Engine',
      role: 'SYSTEM',
      action: 'ML_BATCH_ANALYSIS',
      entityType: 'ML_REPORT',
      entityId: result.id,
      details: `Analyzed ${result.sampleCount} weighing samples. Detected ${result.anomalyCount} anomalies with ${result.consistencyScore}% consistency score.`,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'ML analysis failed', details: error.message });
  }
});

// OIML R-76 Grounded Intelligent Assistant
app.post('/api/assistant/query', (req, res) => {
  const { query } = req.body;
  const q = (query || '').toLowerCase();

  let answer = '';
  let citation = '';

  if (q.includes('mpe') || q.includes('permissible error') || q.includes('class iii')) {
    answer =
      'According to OIML R-76-1:2006 Table 6 (Maximum Permissible Errors on Initial Verification):\n' +
      '• For Class III instruments:\n' +
      '  - 0 ≤ m ≤ 500e : ±0.5e\n' +
      '  - 500e < m ≤ 2,000e : ±1.0e\n' +
      '  - 2,000e < m ≤ 10,000e : ±1.5e\n' +
      'For in-service verification, MPE is double these limits (clause 3.5.2).';
    citation = 'OIML R-76-1:2006 Section 3.5 & Table 6';
  } else if (q.includes('eccentricity') || q.includes('corner') || q.includes('position')) {
    answer =
      'OIML R-76 Clause A.4.7 stipulates that an eccentric load approximately equal to 1/3 of the maximum capacity (Max) plus additive tare must be placed successively at the center and four off-center quadrants (front-left, front-right, back-right, back-left). The errors observed at each position must not exceed the maximum permissible error for that applied load.';
    citation = 'OIML R-76-1:2006 Annex A.4.7 (Eccentricity Test)';
  } else if (q.includes('repeatability') || q.includes('spread')) {
    answer =
      'Per Clause A.4.4.1, the repeatability test requires at least 3 weighing runs (often 6 or 10 in research evaluation) with the same test load (usually approx 1/2 Max and Max). The difference between the maximum and minimum observed readings shall not exceed the absolute value of the MPE for that load.';
    citation = 'OIML R-76-1:2006 Clause A.4.4.1 & Clause 3.6.1';
  } else if (q.includes('discrimination') || q.includes('1.4d')) {
    answer =
      'Per Clause A.4.8, while the instrument is loaded, an additional load of 1.4d must be placed gently on the load receptor. The indication must change by at least 1d to demonstrate unambiguous discrimination capability.';
    citation = 'OIML R-76-1:2006 Clause 3.8 & Annex A.4.8';
  } else if (q.includes('legal metrology') || q.includes('act 2009') || q.includes('model approval')) {
    answer =
      'Under Section 22 of the Legal Metrology Act, 2009 and Rule 23 of the Legal Metrology (General) Rules, 2011, every non-automatic weighing instrument intended for trade, commerce, healthcare, or industrial protection must obtain official Model Approval from the Ministry of Consumer Affairs, Food & Public Distribution before manufacture, import, or sale in India.';
    citation = 'Legal Metrology Act, 2009 (Act No. 1 of 2010), Section 22';
  } else {
    answer =
      'Smart Legal Metrology Assistant operates on the verified knowledge base of OIML Recommendation R-76-1:2006 and the Legal Metrology (General) Rules, 2011. You can inquire about MPE tables, eccentricity loading, repeatability spreads, discrimination, environmental chamber tolerances, or report authorization protocols.';
    citation = 'Ministry of Consumer Affairs, Food & Public Distribution Knowledge Base';
  }

  res.json({
    query,
    answer,
    citation,
    timestamp: new Date().toISOString(),
  });
});

// Configurable Rules
app.get('/api/rules', (req, res) => {
  res.json(ruleConfigs);
});

// Audit Logs
app.get('/api/audit', (req, res) => {
  res.json(auditLogs);
});

// Public QR Verification Endpoint
app.get('/api/verify/:token', (req, res) => {
  const report = testReports.find((r) => r.verificationToken === req.params.token);
  if (!report) {
    return res.status(404).json({
      verified: false,
      message: 'No record matching this verification token was found in the Legal Metrology Central Registry.',
    });
  }

  res.json({
    verified: true,
    reportNumber: report.reportNumber,
    version: report.version,
    instrumentModel: report.testSession.instrument.model,
    manufacturer: report.testSession.instrument.manufacturer,
    serialNumber: report.testSession.instrument.serialNumber,
    complianceStatus: report.testSession.complianceStatus,
    laboratoryName: report.laboratoryName,
    authorizedSignatory: report.authorizedSignatory,
    sha256Hash: report.sha256Hash,
    issuedAt: report.issuedAt,
    regulatoryStandard: 'OIML Recommendation R-76-1:2006 & Legal Metrology Act 2009',
  });
});

// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Legal Metrology Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
