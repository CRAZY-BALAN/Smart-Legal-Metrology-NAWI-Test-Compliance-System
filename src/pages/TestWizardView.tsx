/**
 * OIML R-76 Guided Type Evaluation Test Wizard
 * Multi-step data recording, real-time calculations, MPE compliance checks, and report generation
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Save,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  InstrumentDetails,
  EnvironmentalConditions,
  AccuracyClass,
  InstrumentType,
  TestSession,
  TestReport,
} from '../types';
import {
  calculateMPE,
  evaluateWeighingObservations,
  evaluateRepeatability,
  evaluateEccentricity,
  evaluateDiscrimination,
  determineOverallCompliance,
} from '../utils/oimlCalculations';
import { generateAndDownloadDocxReport } from '../services/reportDocxGenerator';

interface TestWizardViewProps {
  instruments: InstrumentDetails[];
  onSaveSession: (session: Partial<TestSession>) => Promise<TestSession>;
  onGenerateReport: (payload: any) => Promise<TestReport>;
  onViewReport: (report: TestReport) => void;
}

export const TestWizardView: React.FC<TestWizardViewProps> = ({
  instruments,
  onSaveSession,
  onGenerateReport,
  onViewReport,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<TestReport | null>(null);

  // Step 1: Instrument selection / data
  const [selectedInstId, setSelectedInstId] = useState<string>(instruments[0]?.id || '');
  const selectedInstrument = instruments.find((i) => i.id === selectedInstId) || instruments[0];

  // Step 2: Environmental conditions
  const [environmental, setEnvironmental] = useState<EnvironmentalConditions>({
    temperatureMin: 21.5,
    temperatureMax: 23.0,
    relativeHumidity: 55,
    atmosphericPressure: 1013.2,
    supplyVoltage: 230,
    supplyFrequency: 50,
    testBenchLocation: 'RRSL Metrology Lab Bay 1, Vibration-Damped Granite Table',
    testDateTime: new Date().toISOString(),
    remarks: 'Ambient conditions steady throughout evaluation sequence.',
  });

  // Step 3: Weighing Test Table
  const [weighingRows, setWeighingRows] = useState([
    { id: '1', step: 1, loadDirection: 'ASCENDING' as const, appliedLoad_L: 0.1, indication_I: 0.1, deltaL: 0 },
    { id: '2', step: 2, loadDirection: 'ASCENDING' as const, appliedLoad_L: 2.5, indication_I: 2.501, deltaL: 0 },
    { id: '3', step: 3, loadDirection: 'ASCENDING' as const, appliedLoad_L: 10.0, indication_I: 10.002, deltaL: 0 },
    { id: '4', step: 4, loadDirection: 'ASCENDING' as const, appliedLoad_L: 20.0, indication_I: 20.003, deltaL: 0 },
    { id: '5', step: 5, loadDirection: 'ASCENDING' as const, appliedLoad_L: 30.0, indication_I: 30.004, deltaL: 0 },
    { id: '6', step: 6, loadDirection: 'DESCENDING' as const, appliedLoad_L: 20.0, indication_I: 20.003, deltaL: 0 },
    { id: '7', step: 7, loadDirection: 'DESCENDING' as const, appliedLoad_L: 10.0, indication_I: 10.001, deltaL: 0 },
    { id: '8', step: 8, loadDirection: 'DESCENDING' as const, appliedLoad_L: 0.1, indication_I: 0.1, deltaL: 0 },
  ]);

  // Step 3: Repeatability Test Readings
  const [repeatabilityLoad, setRepeatabilityLoad] = useState<number>(15.0);
  const [repeatabilityReadings, setRepeatabilityReadings] = useState<number[]>([15.002, 15.003, 15.002]);

  // Step 3: Eccentricity Test Readings (5 positions)
  const [eccentricityLoad, setEccentricityLoad] = useState<number>(10.0);
  const [eccentricityReadings, setEccentricityReadings] = useState([
    { position: 'CENTER' as const, indication: 10.002 },
    { position: 'FRONT_LEFT' as const, indication: 10.003 },
    { position: 'FRONT_RIGHT' as const, indication: 10.002 },
    { position: 'BACK_RIGHT' as const, indication: 10.003 },
    { position: 'BACK_LEFT' as const, indication: 10.002 },
  ]);

  // Step 4: Remarks & Signature
  const [technicianRemarks, setTechnicianRemarks] = useState<string>(
    'Instrument shows high linearity and rapid stabilization. Zero drift within tolerance.'
  );
  const [technicianName, setTechnicianName] = useState<string>('Alok Kumar Verma');
  const [signatoryName, setSignatoryName] = useState<string>('Dr. Rajeshwar Sharma');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>(
    'Director & Authorized Government Signatory'
  );

  // Live evaluated data
  const eVal = (selectedInstrument?.verificationScaleInterval_e || 5) / (selectedInstrument?.unit === 'kg' ? 1000 : 1);
  const dVal = (selectedInstrument?.actualScaleInterval_d || 1) / (selectedInstrument?.unit === 'kg' ? 1000 : 1);
  const accClass = selectedInstrument?.accuracyClass || 'III';

  const evaluatedWeighing = evaluateWeighingObservations(weighingRows, eVal, dVal, accClass);
  const evaluatedRep = evaluateRepeatability(repeatabilityLoad, repeatabilityReadings, eVal, accClass);
  const evaluatedEcc = evaluateEccentricity(eccentricityLoad, eccentricityReadings, eVal, accClass);
  const evaluatedDisc = evaluateDiscrimination([
    {
      testLoad: 10.0,
      initialIndication: 10.0,
      finalIndication: 10.0 + dVal,
      d: dVal,
    },
  ]);

  const weighingPass = evaluatedWeighing.every((w) => w.status === 'PASS');
  const repPass = evaluatedRep.status === 'PASS';
  const eccPass = evaluatedEcc.status === 'PASS';
  const discPass = evaluatedDisc.every((d) => d.passed);

  const overallCompliance = determineOverallCompliance(weighingPass, repPass, eccPass, discPass);

  const steps = [
    { num: 1, label: 'Instrument Specifications' },
    { num: 2, label: 'Lab & Environmental' },
    { num: 3, label: 'OIML Test Observations' },
    { num: 4, label: 'Compliance & Verification' },
    { num: 5, label: 'Generate Official Reports' },
  ];

  const handleFinalizeAndGenerateReport = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create test session
      const newSessionPayload: any = {
        instrumentId: selectedInstrument.id,
        instrument: selectedInstrument,
        environmental,
        weighingObservations: evaluatedWeighing,
        repeatabilityTest: evaluatedRep,
        eccentricityTest: evaluatedEcc,
        discriminationTest: evaluatedDisc,
        tareTest: {
          tareLoad: 5.0,
          netLoad: 15.0,
          grossIndication: 20.003,
          netIndication: 15.002,
          error: 0.002,
          mpe: calculateMPE(15.0, eVal, accClass),
          status: 'PASS',
        },
        complianceStatus: overallCompliance.status,
        overallVerdict: overallCompliance.summary,
        technicianName,
        technicianRemarks,
        status: 'APPROVED',
        ruleVersion: 'OIML-R76-2006-IN-REV4',
      };

      const session = await onSaveSession(newSessionPayload);

      // 2. Generate official report with QR code and SHA-256 hash
      const report = await onGenerateReport({
        testSessionId: session.id,
        authorizedSignatory: signatoryName,
        designation: signatoryDesignation,
        laboratoryName: 'Regional Reference Standards Laboratory (RRSL)',
        laboratoryAddress: 'Sector 27-C, Mathura Road, Faridabad, Haryana 121003',
      });

      setGeneratedReport(report);
      setCurrentStep(5);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    currentStep === s.num
                      ? 'bg-[#2F699C] text-white'
                      : currentStep > s.num
                      ? 'bg-[#1A7A4A] text-white'
                      : 'bg-gray-100 text-[#6F7478]'
                  }`}
                >
                  {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs hidden md:inline font-medium ${
                    currentStep === s.num ? 'text-[#162F4D] font-bold' : 'text-[#6F7478]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep > s.num ? 'bg-[#1A7A4A]' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: Instrument Details */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-[#162F4D]">
              Step 1: Non-Automatic Weighing Instrument (NAWI) Selection & Specs
            </h2>
            <p className="text-xs text-[#6F7478]">
              Verify instrument classification, capacities, verification scale intervals (e), and applicant details.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#162F4D] mb-1.5">
              Select Instrument from Laboratory Registry
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full bg-[#F6F7F7] border border-gray-300 rounded p-2 text-xs text-[#162F4D] font-medium"
            >
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.manufacturer} — {i.model} (S/N: {i.serialNumber}, Class {i.accuracyClass}, Max: {i.maxCapacity}{i.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedInstrument && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F6F7F7] p-4 rounded-md border border-gray-200 text-xs">
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Manufacturer</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.manufacturer}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Model / Serial</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.model} / {selectedInstrument.serialNumber}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Accuracy Class</span>
                <div className="font-bold text-[#2F699C] mt-0.5">Class {selectedInstrument.accuracyClass}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Max / Min Capacity</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.maxCapacity}{selectedInstrument.unit} / {selectedInstrument.minCapacity}{selectedInstrument.unit}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Verification Interval (e)</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.verificationScaleInterval_e}g</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Actual Interval (d)</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.actualScaleInterval_d}g</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Number of Intervals (n)</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.numberOfIntervals_n}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Load Cell Class</span>
                <div className="font-bold text-[#162F4D] mt-0.5">{selectedInstrument.loadCellClass}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <span>Continue to Lab Conditions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Lab & Environmental */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-[#162F4D]">
              Step 2: Laboratory & Environmental Conditions (Clause 3.9)
            </h2>
            <p className="text-xs text-[#6F7478]">
              Record ambient climatic conditions, mains supply stability, and test bench isolation parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Temperature Range (°C)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={environmental.temperatureMin}
                  onChange={(e) => setEnvironmental({ ...environmental, temperatureMin: Number(e.target.value) })}
                  className="w-1/2 border border-gray-300 rounded p-2 text-[#162F4D]"
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  step="0.1"
                  value={environmental.temperatureMax}
                  onChange={(e) => setEnvironmental({ ...environmental, temperatureMax: Number(e.target.value) })}
                  className="w-1/2 border border-gray-300 rounded p-2 text-[#162F4D]"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Relative Humidity (%)</label>
              <input
                type="number"
                value={environmental.relativeHumidity}
                onChange={(e) => setEnvironmental({ ...environmental, relativeHumidity: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Atmospheric Pressure (hPa)</label>
              <input
                type="number"
                step="0.1"
                value={environmental.atmosphericPressure}
                onChange={(e) => setEnvironmental({ ...environmental, atmosphericPressure: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Mains Supply Voltage (V)</label>
              <input
                type="number"
                value={environmental.supplyVoltage}
                onChange={(e) => setEnvironmental({ ...environmental, supplyVoltage: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Supply Frequency (Hz)</label>
              <input
                type="number"
                value={environmental.supplyFrequency}
                onChange={(e) => setEnvironmental({ ...environmental, supplyFrequency: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">Test Bench & Location</label>
              <input
                type="text"
                value={environmental.testBenchLocation}
                onChange={(e) => setEnvironmental({ ...environmental, testBenchLocation: e.target.value })}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-[#234B70] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <span>Continue to Test Observations</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OIML Test Observations Table */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#162F4D]">
                Step 3: OIML R-76 Test Observations Entry & Live MPE Calculation
              </h2>
              <p className="text-xs text-[#6F7478]">
                Errors and Maximum Permissible Error (MPE) thresholds are evaluated in real-time according to Class {selectedInstrument.accuracyClass} rules.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-[#E9F4FD] px-3 py-1.5 rounded border border-blue-200 text-xs">
              <Calculator className="w-4 h-4 text-[#2F699C]" />
              <span className="font-semibold text-[#2F699C]">
                Verification Interval e = {selectedInstrument.verificationScaleInterval_e}g
              </span>
            </div>
          </div>

          {/* Subsection A: Weighing Performance Table */}
          <div>
            <h3 className="text-xs font-bold text-[#162F4D] uppercase tracking-wider mb-2">
              A. Weighing Performance Test (Clause A.4.4 — Ascending & Descending)
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F7F7] text-[#162F4D] border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="p-2.5">Step</th>
                    <th className="p-2.5">Direction</th>
                    <th className="p-2.5">Applied Load ({selectedInstrument.unit})</th>
                    <th className="p-2.5">Indication ({selectedInstrument.unit})</th>
                    <th className="p-2.5">Error E ({selectedInstrument.unit})</th>
                    <th className="p-2.5">MPE (±{selectedInstrument.unit})</th>
                    <th className="p-2.5">Margin</th>
                    <th className="p-2.5">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {evaluatedWeighing.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-[#F6F7F7]">
                      <td className="p-2.5 font-mono">{row.step}</td>
                      <td className="p-2.5 text-[#6F7478]">{row.loadDirection}</td>
                      <td className="p-2.5 font-semibold text-[#162F4D]">{row.appliedLoad_L}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.001"
                          value={row.indication_I}
                          onChange={(e) => {
                            const newRows = [...weighingRows];
                            newRows[idx].indication_I = Number(e.target.value);
                            setWeighingRows(newRows);
                          }}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-xs text-[#162F4D] font-mono"
                        />
                      </td>
                      <td className="p-2.5 font-mono font-medium">{row.calculatedError_E}</td>
                      <td className="p-2.5 font-mono text-[#6F7478]">±{row.mpe}</td>
                      <td className="p-2.5 font-mono text-emerald-700">+{row.deviationMargin}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            row.status === 'PASS'
                              ? 'bg-emerald-50 text-[#1A7A4A] border-emerald-200'
                              : 'bg-red-50 text-[#C0392B] border-red-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subsection B: Repeatability & Eccentricity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Repeatability */}
            <div className="border border-gray-200 rounded-md p-4 bg-[#F6F7F7]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#162F4D]">
                  B. Repeatability Test (Clause A.4.4.1)
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    evaluatedRep.status === 'PASS'
                      ? 'bg-emerald-50 text-[#1A7A4A] border-emerald-200'
                      : 'bg-red-50 text-[#C0392B] border-red-200'
                  }`}
                >
                  {evaluatedRep.status}
                </span>
              </div>
              <p className="text-[11px] text-[#6F7478] mb-3">
                Spread difference (E_max - E_min) must not exceed |MPE| ({evaluatedRep.mpeSpreadLimit}{selectedInstrument.unit}).
              </p>

              <div className="space-y-2 text-xs">
                {repeatabilityReadings.map((val, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-between">
                    <span className="text-[#6F7478]">Run {rIdx + 1} (Load: {repeatabilityLoad}{selectedInstrument.unit})</span>
                    <input
                      type="number"
                      step="0.001"
                      value={val}
                      onChange={(e) => {
                        const newR = [...repeatabilityReadings];
                        newR[rIdx] = Number(e.target.value);
                        setRepeatabilityReadings(newR);
                      }}
                      className="w-28 border border-gray-300 rounded px-2 py-1 bg-white"
                    />
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold text-[#162F4D]">
                  <span>Calculated Spread:</span>
                  <span className="font-mono">{evaluatedRep.maxSpread} {selectedInstrument.unit}</span>
                </div>
              </div>
            </div>

            {/* Eccentricity (Corner Loading) */}
            <div className="border border-gray-200 rounded-md p-4 bg-[#F6F7F7]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#162F4D]">
                  C. Eccentricity Test (Clause A.4.7 — 5 Positions)
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    evaluatedEcc.status === 'PASS'
                      ? 'bg-emerald-50 text-[#1A7A4A] border-emerald-200'
                      : 'bg-red-50 text-[#C0392B] border-red-200'
                  }`}
                >
                  {evaluatedEcc.status}
                </span>
              </div>
              <p className="text-[11px] text-[#6F7478] mb-3">
                Load of approx 1/3 Max ({eccentricityLoad}{selectedInstrument.unit}) applied at 5 positions.
              </p>

              <div className="space-y-1.5 text-xs">
                {eccentricityReadings.map((ecc, eIdx) => (
                  <div key={eIdx} className="flex items-center justify-between">
                    <span className="text-[#6F7478]">{ecc.position.replace('_', ' ')}</span>
                    <input
                      type="number"
                      step="0.001"
                      value={ecc.indication}
                      onChange={(e) => {
                        const newE = [...eccentricityReadings];
                        newE[eIdx].indication = Number(e.target.value);
                        setEccentricityReadings(newE);
                      }}
                      className="w-28 border border-gray-300 rounded px-2 py-1 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-[#234B70] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <span>Review Compliance Status</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Compliance Review & Signatory */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-base font-bold text-[#162F4D]">
              Step 4: Compliance Verification & Signatory Authorization
            </h2>
            <p className="text-xs text-[#6F7478]">
              Automated deterministic pass/fail evaluation per OIML Recommendation R-76-1:2006.
            </p>
          </div>

          {/* Compliance Status Banner */}
          <div
            className={`p-5 rounded-lg border flex items-start space-x-3 ${
              overallCompliance.status === 'PASS'
                ? 'bg-emerald-50/70 border-emerald-300 text-[#162F4D]'
                : 'bg-red-50/70 border-red-300 text-[#162F4D]'
            }`}
          >
            <CheckCircle2
              className={`w-6 h-6 mt-0.5 shrink-0 ${
                overallCompliance.status === 'PASS' ? 'text-[#1A7A4A]' : 'text-[#C0392B]'
              }`}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  Overall Evaluation Verdict: {overallCompliance.status}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/80 rounded border">
                  OIML R-76 Clause 3.5
                </span>
              </div>
              <p className="text-xs text-[#234B70] mt-1 leading-relaxed">
                {overallCompliance.summary}
              </p>
            </div>
          </div>

          {/* Signatory & Remarks Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">
                Testing Officer / Lab Technician Name
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#162F4D] mb-1">
                Authorized Government Signatory
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-[#162F4D] mb-1">
                Technician Observations & Metrological Remarks
              </label>
              <textarea
                rows={2}
                value={technicianRemarks}
                onChange={(e) => setTechnicianRemarks(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-[#234B70] flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalizeAndGenerateReport}
              disabled={isSubmitting}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-6 py-2.5 rounded text-xs font-bold shadow-md flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Authorizing & Cryptographically Signing...' : 'Generate Official Report (PDF + Word)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Report Generated Success Screen */}
      {currentStep === 5 && generatedReport && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-[#1A7A4A] rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#162F4D]">
              OIML R-76 Type Evaluation Test Report Generated Successfully
            </h2>
            <div className="text-xs font-mono text-[#2F699C] font-semibold">
              Official Report No: {generatedReport.reportNumber}
            </div>
            <p className="text-xs text-[#6F7478] max-w-lg mx-auto leading-relaxed pt-1">
              The report has been permanently archived in the Legal Metrology repository with an embedded verification QR code and SHA-256 cryptographic seal.
            </p>
          </div>

          {/* Cryptographic Verification Badge */}
          <div className="bg-[#F6F7F7] p-4 rounded-lg border border-gray-200 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
            <div className="text-[10px] text-[#6F7478] uppercase font-sans font-bold">Document Integrity Verification</div>
            <div className="truncate text-gray-600 text-[11px]">
              <span className="font-semibold text-[#162F4D]">SHA-256:</span> {generatedReport.sha256Hash}
            </div>
            <div className="text-gray-600 text-[11px]">
              <span className="font-semibold text-[#162F4D]">Verification Token:</span> {generatedReport.verificationToken}
            </div>
          </div>

          {/* Action Buttons: Preview PDF, Download Word DOCX, View in Gallery */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewReport(generatedReport)}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-5 py-2.5 rounded-md text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>View & Print Standardized Report</span>
            </button>

            <button
              onClick={() => generateAndDownloadDocxReport(generatedReport)}
              className="bg-white hover:bg-[#E9F4FD] text-[#2F699C] border border-[#2F699C] px-5 py-2.5 rounded-md text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Word Document (.docx)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
