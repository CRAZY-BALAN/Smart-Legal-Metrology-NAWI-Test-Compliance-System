/**
 * Data contracts and metrological types for OIML R-76 NAWI Testing System
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

export type AccuracyClass = 'I' | 'II' | 'III' | 'IIII';

export type InstrumentType =
  | 'Electronic Tabletop Scale'
  | 'Platform Scale'
  | 'Weighbridge'
  | 'High-Precision Analytical Balance'
  | 'Retail Counter Computing Scale'
  | 'Industrial Crane Scale';

export type TestStatus =
  | 'DRAFT'
  | 'IN_TESTING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type ComplianceStatus = 'PASS' | 'FAIL' | 'CONDITIONAL';

export type UserRole = 'LAB_TECHNICIAN' | 'ADMIN' | 'REVIEWER' | 'AUDITOR';

export interface UserProfile {
  id: string;
  name: string;
  officialId: string;
  role: UserRole;
  designation: string;
  laboratory: string;
  email: string;
}

export interface InstrumentDetails {
  id: string;
  manufacturer: string;
  manufacturerAddress: string;
  model: string;
  serialNumber: string;
  type: InstrumentType;
  accuracyClass: AccuracyClass;
  maxCapacity: number; // in kg or g
  minCapacity: number;
  verificationScaleInterval_e: number; // e in g
  actualScaleInterval_d: number; // d in g
  numberOfIntervals_n: number; // n = Max / e
  unit: 'g' | 'kg';
  loadCellModel: string;
  loadCellClass: string;
  displayType: string;
  powerSupply: string;
  softwareVersion: string;
  applicantName: string;
  applicationRef: string;
  labReference: string;
  dateReceived: string;
  notes?: string;
}

export interface EnvironmentalConditions {
  temperatureMin: number; // Celsius
  temperatureMax: number;
  relativeHumidity: number; // %
  atmosphericPressure: number; // hPa
  supplyVoltage: number; // V
  supplyFrequency: number; // Hz
  testBenchLocation: string;
  testDateTime: string;
  remarks: string;
}

export interface WeighingObservation {
  id: string;
  step: number;
  loadDirection: 'ASCENDING' | 'DESCENDING';
  appliedLoad_L: number; // Load in unit (g or kg)
  indication_I: number; // Reading
  deltaL: number; // Additional test weights to next changeover
  calculatedError_E: number; // E = I + 0.5d - deltaL - L
  mpe: number; // Maximum Permissible Error
  deviationMargin: number; // |mpe| - |E|
  status: 'PASS' | 'FAIL';
}

export interface RepeatabilityObservation {
  id: string;
  runIndex: number;
  appliedLoad: number;
  indication: number;
  error: number;
}

export interface RepeatabilityTest {
  testLoad: number;
  observations: RepeatabilityObservation[];
  maxSpread: number; // E_max - E_min
  mpeSpreadLimit: number;
  status: 'PASS' | 'FAIL';
}

export interface EccentricityObservation {
  id: string;
  position: 'CENTER' | 'FRONT_LEFT' | 'FRONT_RIGHT' | 'BACK_RIGHT' | 'BACK_LEFT';
  appliedLoad: number;
  indication: number;
  error: number;
  mpe: number;
  status: 'PASS' | 'FAIL';
}

export interface EccentricityTest {
  appliedLoad: number; // Usually 1/3 Max or per OIML clause
  observations: EccentricityObservation[];
  status: 'PASS' | 'FAIL';
}

export interface DiscriminationObservation {
  id: string;
  testLoad: number;
  extraLoad_1_4d: number; // 1.4 * d
  initialIndication: number;
  finalIndication: number;
  deltaIndication: number;
  passed: boolean;
}

export interface TareTest {
  tareLoad: number;
  netLoad: number;
  grossIndication: number;
  netIndication: number;
  error: number;
  mpe: number;
  status: 'PASS' | 'FAIL';
}

export interface TestSession {
  id: string;
  sessionNumber: string;
  instrumentId: string;
  instrument: InstrumentDetails;
  environmental: EnvironmentalConditions;
  weighingObservations: WeighingObservation[];
  repeatabilityTest: RepeatabilityTest;
  eccentricityTest: EccentricityTest;
  discriminationTest: DiscriminationObservation[];
  tareTest: TareTest;
  complianceStatus: ComplianceStatus;
  overallVerdict: string;
  technicianId: string;
  technicianName: string;
  reviewerName?: string;
  technicianRemarks: string;
  digitalSignature?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  status: TestStatus;
  ruleVersion: string;
}

export interface TestReport {
  id: string;
  reportNumber: string;
  version: string;
  testSessionId: string;
  testSession: TestSession;
  sha256Hash: string;
  qrCodeDataUrl: string;
  verificationToken: string;
  issuedAt: string;
  laboratoryName: string;
  laboratoryAddress: string;
  authorizedSignatory: string;
  designation: string;
  status: 'OFFICIAL' | 'DRAFT' | 'SUPERSEDED';
  docxExportUrl?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  updatedAt?: string;
}

export interface LabProject {
  id: string;
  projectCode: string;
  title: string;
  objective: string;
  assignedLead: string;
  technicians: string[];
  startDate: string;
  tentativeDeadline: string; // ISO date string YYYY-MM-DD
  progressPercentage: number;
  currentPhase: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'ON_HOLD';
  tasks: ProjectTask[];
  remainingSummary: string;
  remarks: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'REFERENCE_WEIGHTS' | 'CALIBRATION_REAGENTS' | 'CONSUMABLES' | 'EQUIPMENT';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  expiryDate?: string;
  batchNumber: string;
  lastInspected: string;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  notes?: string;
}

export interface MLAnomalyObservation {
  sampleId: string;
  load: number;
  error: number;
  expectedRange: string;
  zScore: number;
  anomalyScore: number;
  flagReason: string;
}

export interface MLBatchAnalysis {
  id: string;
  datasetName: string;
  analysisDate: string;
  sampleCount: number;
  modelVersion: string;
  meanAbsoluteError: number;
  variance: number;
  anomalyCount: number;
  anomalyObservations: MLAnomalyObservation[];
  consistencyScore: number; // 0 to 100
  complianceRiskRating: 'LOW' | 'MODERATE' | 'HIGH';
  driftTrend: 'STABLE' | 'POSITIVE_DRIFT' | 'NEGATIVE_DRIFT';
  analyticalReportQr: string;
  featureImportance: { feature: string; weight: number }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INVENTORY_ALERT' | 'DEADLINE_ALERT' | 'TEST_SUBMITTED' | 'REPORT_APPROVED' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  relatedEntityId?: string;
}

export interface OIMLRuleConfig {
  versionId: string;
  regulationName: string;
  ruleCode: string;
  effectiveDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  applicableClauses: {
    clauseNumber: string;
    description: string;
    mpeTableRef: string;
  }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}
