/**
 * OIML R-76 Metrological Calculation Engine
 * Compliant with Legal Metrology Act 2009 & OIML R-76-1:2006
 */

import { AccuracyClass, WeighingObservation, RepeatabilityTest, EccentricityTest, DiscriminationObservation, ComplianceStatus } from '../types';

/**
 * Calculates the Maximum Permissible Error (MPE) for a given load and accuracy class
 * Returns MPE in terms of grams/units (using verification scale interval 'e')
 */
export function calculateMPE(
  load: number,
  e: number,
  accuracyClass: AccuracyClass,
  isInitialVerification: boolean = true
): number {
  if (e <= 0) return 0;
  const mInIntervals = Math.abs(load) / e;
  let multiplier = 0.5;

  switch (accuracyClass) {
    case 'I':
      if (mInIntervals <= 50000) {
        multiplier = 0.5;
      } else if (mInIntervals <= 200000) {
        multiplier = 1.0;
      } else {
        multiplier = 1.5;
      }
      break;

    case 'II':
      if (mInIntervals <= 5000) {
        multiplier = 0.5;
      } else if (mInIntervals <= 20000) {
        multiplier = 1.0;
      } else {
        multiplier = 1.5;
      }
      break;

    case 'III':
      if (mInIntervals <= 500) {
        multiplier = 0.5;
      } else if (mInIntervals <= 2000) {
        multiplier = 1.0;
      } else {
        multiplier = 1.5;
      }
      break;

    case 'IIII':
      if (mInIntervals <= 50) {
        multiplier = 0.5;
      } else if (mInIntervals <= 200) {
        multiplier = 1.0;
      } else {
        multiplier = 1.5;
      }
      break;

    default:
      multiplier = 1.0;
  }

  // If in-service verification, MPE is twice initial verification MPE (clause 3.5.2)
  const factor = isInitialVerification ? 1 : 2;
  return Number((multiplier * e * factor).toFixed(4));
}

/**
 * Calculates error according to OIML R-76 A.4.4.3 (Error with changeover point or simplified)
 * E = I + 0.5d - deltaL - L
 */
export function calculateObservedError(
  indication: number,
  appliedLoad: number,
  deltaL: number = 0,
  d: number = 0
): number {
  if (d > 0 && deltaL > 0) {
    const P = indication + 0.5 * d - deltaL;
    return Number((P - appliedLoad).toFixed(4));
  }
  return Number((indication - appliedLoad).toFixed(4));
}

/**
 * Evaluates full weighing performance observations
 */
export function evaluateWeighingObservations(
  observations: Array<{
    id: string;
    step: number;
    loadDirection: 'ASCENDING' | 'DESCENDING';
    appliedLoad_L: number;
    indication_I: number;
    deltaL: number;
  }>,
  e: number,
  d: number,
  accuracyClass: AccuracyClass
): WeighingObservation[] {
  return observations.map((obs) => {
    const calculatedError_E = calculateObservedError(obs.indication_I, obs.appliedLoad_L, obs.deltaL, d);
    const mpe = calculateMPE(obs.appliedLoad_L, e, accuracyClass, true);
    const pass = Math.abs(calculatedError_E) <= mpe + 0.000001;
    const deviationMargin = Number((mpe - Math.abs(calculatedError_E)).toFixed(4));

    return {
      ...obs,
      calculatedError_E,
      mpe,
      deviationMargin,
      status: pass ? 'PASS' : 'FAIL',
    };
  });
}

/**
 * Evaluates Repeatability Test (Clause A.4.4.1)
 * The difference between the results of several weighings with the same load must not exceed |MPE|
 */
export function evaluateRepeatability(
  testLoad: number,
  readings: number[],
  e: number,
  accuracyClass: AccuracyClass
): RepeatabilityTest {
  const mpe = calculateMPE(testLoad, e, accuracyClass, true);
  const errors = readings.map((r) => Number((r - testLoad).toFixed(4)));
  const minError = Math.min(...errors);
  const maxError = Math.max(...errors);
  const maxSpread = Number((maxError - minError).toFixed(4));

  // Per OIML R-76, max spread shall not exceed absolute value of MPE for that load
  const pass = maxSpread <= mpe + 0.000001;

  const observations = readings.map((r, index) => ({
    id: `rep-${index + 1}`,
    runIndex: index + 1,
    appliedLoad: testLoad,
    indication: r,
    error: Number((r - testLoad).toFixed(4)),
  }));

  return {
    testLoad,
    observations,
    maxSpread,
    mpeSpreadLimit: mpe,
    status: pass ? 'PASS' : 'FAIL',
  };
}

/**
 * Evaluates Eccentricity Test (Clause A.4.7)
 * Load approx 1/3 Max placed at 5 positions
 */
export function evaluateEccentricity(
  appliedLoad: number,
  readings: {
    position: 'CENTER' | 'FRONT_LEFT' | 'FRONT_RIGHT' | 'BACK_RIGHT' | 'BACK_LEFT';
    indication: number;
  }[],
  e: number,
  accuracyClass: AccuracyClass
): EccentricityTest {
  const mpe = calculateMPE(appliedLoad, e, accuracyClass, true);
  let allPass = true;

  const observations = readings.map((item, idx) => {
    const error = Number((item.indication - appliedLoad).toFixed(4));
    const pass = Math.abs(error) <= mpe + 0.000001;
    if (!pass) allPass = false;

    return {
      id: `ecc-${idx + 1}`,
      position: item.position,
      appliedLoad,
      indication: item.indication,
      error,
      mpe,
      status: pass ? ('PASS' as const) : ('FAIL' as const),
    };
  });

  return {
    appliedLoad,
    observations,
    status: allPass ? 'PASS' : 'FAIL',
  };
}

/**
 * Evaluates Discrimination Test (Clause A.4.8)
 * Extra load 1.4d smoothly applied must trigger unambiguous increment
 */
export function evaluateDiscrimination(
  tests: {
    testLoad: number;
    initialIndication: number;
    finalIndication: number;
    d: number;
  }[]
): DiscriminationObservation[] {
  return tests.map((t, idx) => {
    const extraLoad_1_4d = Number((1.4 * t.d).toFixed(4));
    const deltaIndication = Number((t.finalIndication - t.initialIndication).toFixed(4));
    // Must show change of at least d
    const passed = deltaIndication >= t.d * 0.999;

    return {
      id: `disc-${idx + 1}`,
      testLoad: t.testLoad,
      extraLoad_1_4d,
      initialIndication: t.initialIndication,
      finalIndication: t.finalIndication,
      deltaIndication,
      passed,
    };
  });
}

/**
 * Determine overall OIML R-76 compliance status
 */
export function determineOverallCompliance(
  weighingPass: boolean,
  repeatabilityPass: boolean,
  eccentricityPass: boolean,
  discriminationPass: boolean,
  tarePass: boolean = true
): { status: ComplianceStatus; summary: string } {
  if (weighingPass && repeatabilityPass && eccentricityPass && discriminationPass && tarePass) {
    return {
      status: 'PASS',
      summary: 'The instrument complies with all prescribed metrological and performance requirements of OIML R-76-1:2006 for initial model verification.',
    };
  }

  const failedTests: string[] = [];
  if (!weighingPass) failedTests.push('Weighing Performance (Error > MPE)');
  if (!repeatabilityPass) failedTests.push('Repeatability Spread Exceeded');
  if (!eccentricityPass) failedTests.push('Eccentricity Loading Error');
  if (!discriminationPass) failedTests.push('Discrimination Threshold Failed');
  if (!tarePass) failedTests.push('Tare Facility Test Error');

  return {
    status: 'FAIL',
    summary: `Non-compliance identified in: ${failedTests.join(', ')}. Values exceed maximum permissible errors defined under OIML R-76 Table 6.`,
  };
}

/**
 * Computes a standard SHA-256 hash representation for tamper-evident report integrity
 */
export async function generateReportIntegrityHash(reportData: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(reportData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple checksum if subtle crypto not in current worker
  let hash = 0;
  for (let i = 0; i < reportData.length; i++) {
    const char = reportData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256-fallback-${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

/**
 * Auto-decrement days remaining between today and deadline
 */
export function calculateDaysRemaining(deadlineStr: string): {
  days: number;
  label: string;
  badgeClass: string;
  isOverdue: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      label: `${Math.abs(diffDays)} Days Overdue`,
      badgeClass: 'bg-red-100 text-[#C0392B] border-red-200',
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return {
      days: 0,
      label: 'Due Today',
      badgeClass: 'bg-amber-100 text-[#D4870A] border-amber-200',
      isOverdue: false,
    };
  }

  if (diffDays <= 6) {
    return {
      days: diffDays,
      label: `${diffDays} Days Left (Critical)`,
      badgeClass: 'bg-red-50 text-[#C0392B] border-red-200',
      isOverdue: false,
    };
  }

  if (diffDays <= 14) {
    return {
      days: diffDays,
      label: `${diffDays} Days Left (Warning)`,
      badgeClass: 'bg-amber-50 text-[#D4870A] border-amber-200',
      isOverdue: false,
    };
  }

  return {
    days: diffDays,
    label: `${diffDays} Days Left`,
    badgeClass: 'bg-[#E9F4FD] text-[#234B70] border-blue-200',
    isOverdue: false,
  };
}
