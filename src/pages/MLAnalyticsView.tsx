/**
 * ML-Assisted Multi-Sample Analytics Module
 * Provides outlier anomaly detection, drift prediction, variance scoring, and analytical report generation.
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  Info,
  CheckSquare,
  Square,
  Beaker,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
} from 'recharts';
import { MLBatchAnalysis, TestReport } from '../types';
import { api } from '../services/api';
import { generateSampleDataset, mapReportsToSamples, SamplePoint } from '../utils/mlEngine';

interface MLAnalyticsViewProps {
  reports: TestReport[];
}

export const MLAnalyticsView: React.FC<MLAnalyticsViewProps> = ({ reports }) => {
  const [analysis, setAnalysis] = useState<MLBatchAnalysis | null>(null);
  const [chartSamples, setChartSamples] = useState<SamplePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [datasetName, setDatasetName] = useState('Multi-Sample Type Evaluation Batch #2026-B4');
  const [showAnalyticalReport, setShowAnalyticalReport] = useState(false);

  // Which real test reports the technician has selected for this analysis.
  // Empty selection == fall back to the illustrative demo dataset.
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  const eligibleReports = useMemo(
    () => reports.filter((r) => r.testSession && r.testSession.weighingObservations.length > 0),
    [reports]
  );

  const usingRealReports = selectedReportIds.size > 0;

  const toggleReport = (id: string) => {
    setSelectedReportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedReportIds(new Set(eligibleReports.map((r) => r.id)));
  const clearSelection = () => setSelectedReportIds(new Set());

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const selectedReports = eligibleReports.filter((r) => selectedReportIds.has(r.id));
      const samples: SamplePoint[] = usingRealReports
        ? mapReportsToSamples(selectedReports)
        : generateSampleDataset('Platform Scale');

      const activeDatasetName = usingRealReports
        ? `Selected Reports Batch (${selectedReports.length} report${selectedReports.length === 1 ? '' : 's'})`
        : datasetName;

      setChartSamples(samples);
      const data = await api.runMLBatchAnalysis(activeDatasetName, samples);
      setAnalysis(data);
      setHasRun(true);
    } catch (err) {
      console.error('ML Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform whichever samples were actually analyzed into chart points
  const chartData = chartSamples.map((s) => ({
    load: s.load,
    error: s.error,
    upperMpe: s.mpe,
    lowerMpe: -s.mpe,
    sampleId: s.sampleId,
    temperature: s.temperature,
  }));

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-[#E9F4FD] border-l-4 border-[#2F699C] p-5 rounded-r-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold text-[#2F699C] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Learning & Metrological Decision Support</span>
          </div>
          <h1 className="text-lg font-bold text-[#162F4D] mt-0.5">
            Multi-Sample Weighing Analytics & Anomaly Detection
          </h1>
          <p className="text-xs text-[#234B70] mt-1 max-w-2xl leading-relaxed">
            Stochastic analysis across repeated observations. Evaluates variance, flags statistical outliers outside normal distribution, tracks drift, and calculates Metrological Consistency Scores.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {hasRun && (
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-white hover:bg-[#F6F7F7] text-[#2F699C] border border-gray-300 px-3.5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-run Analysis</span>
            </button>
          )}
          <button
            onClick={() => setShowAnalyticalReport(true)}
            disabled={!analysis}
            className="bg-[#2F699C] hover:bg-[#162F4D] disabled:opacity-50 text-white px-4 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Analytical Report</span>
          </button>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <div className="bg-[#F6F7F7] border border-gray-200 rounded p-3 text-[11px] text-[#6F7478] flex items-center space-x-2">
        <Info className="w-4 h-4 text-[#1683C5] shrink-0" />
        <span>
          <strong className="text-[#162F4D]">Decision-Support Notice:</strong> Machine learning outputs assist laboratory technicians in detecting data-entry anomalies and thermal drifts. Official regulatory model approval remains strictly determined by deterministic OIML R-76 MPE criteria.
        </span>
      </div>

      {/* STEP 1: SAMPLE / REPORT SELECTION */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#162F4D] flex items-center space-x-2">
              <Beaker className="w-4 h-4 text-[#2F699C]" />
              <span>Select Samples to Analyze</span>
            </h3>
            <p className="text-xs text-[#6F7478] mt-1">
              Choose one or more completed test reports. Every weighing observation from
              the reports you select becomes a sample in the ML pipeline. Select none to
              run the model against an illustrative demo dataset instead.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={selectAll}
              disabled={eligibleReports.length === 0}
              className="px-2.5 py-1.5 rounded border border-gray-300 text-[#234B70] hover:bg-[#F6F7F7] disabled:opacity-50"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedReportIds.size === 0}
              className="px-2.5 py-1.5 rounded border border-gray-300 text-[#234B70] hover:bg-[#F6F7F7] disabled:opacity-50"
            >
              Use Demo Dataset
            </button>
          </div>
        </div>

        {eligibleReports.length === 0 ? (
          <div className="mt-4 text-xs text-[#6F7478] bg-[#F6F7F7] border border-gray-200 rounded p-3">
            No completed test reports with observations yet — analysis will run on the
            illustrative demo dataset until reports are generated from the Test Wizard.
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {eligibleReports.map((report) => {
              const checked = selectedReportIds.has(report.id);
              return (
                <button
                  key={report.id}
                  onClick={() => toggleReport(report.id)}
                  className={`text-left p-3 rounded-md border flex items-start space-x-2.5 transition-colors ${
                    checked
                      ? 'border-[#2F699C] bg-[#E9F4FD]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-[#F6F7F7]'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-[#2F699C] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-xs text-[#162F4D] truncate">
                      {report.reportNumber}
                    </div>
                    <div className="text-[11px] text-[#6F7478] truncate">
                      {report.testSession.instrument.type} · {report.testSession.instrument.model}
                    </div>
                    <div className="text-[10px] text-[#6F7478] mt-0.5">
                      {report.testSession.weighingObservations.length} observations · {report.testSession.complianceStatus}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-[#6F7478]">
            {usingRealReports
              ? `${selectedReportIds.size} report(s) selected — analysis will use real observation data.`
              : 'No reports selected — analysis will use the illustrative demo dataset.'}
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-[#2F699C] hover:bg-[#162F4D] disabled:opacity-60 text-white px-4 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Running Analysis…' : 'Run ML Analysis'}</span>
          </button>
        </div>
      </div>

      {!hasRun && !loading && (
        <div className="text-center text-xs text-[#6F7478] py-6">
          Select samples above, then run the analysis to see results.
        </div>
      )}

      {analysis && (
        <>
          {/* Key ML Evaluation Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-xs text-[#6F7478]">Consistency Score</span>
              <div className="text-2xl font-bold text-[#162F4D] mt-1">
                {analysis.consistencyScore} / 100
              </div>
              <div className="text-[11px] text-[#1A7A4A] font-medium mt-1 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Optimal Repeatability</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-xs text-[#6F7478]">Compliance Risk Rating</span>
              <div
                className={`text-2xl font-bold mt-1 ${
                  analysis.complianceRiskRating === 'LOW'
                    ? 'text-[#1A7A4A]'
                    : analysis.complianceRiskRating === 'MODERATE'
                    ? 'text-[#D4870A]'
                    : 'text-[#C0392B]'
                }`}
              >
                {analysis.complianceRiskRating} RISK
              </div>
              <div className="text-[11px] text-[#6F7478] mt-1">
                Based on MPE margins
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-xs text-[#6F7478]">Anomalies / Outliers</span>
              <div className="text-2xl font-bold text-[#D4870A] mt-1">
                {analysis.anomalyCount} Flags
              </div>
              <div className="text-[11px] text-[#6F7478] mt-1">
                Out of {analysis.sampleCount} test samples
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
              <span className="text-xs text-[#6F7478]">Drift Trajectory</span>
              <div className="text-2xl font-bold text-[#2F699C] mt-1">
                {analysis.driftTrend}
              </div>
              <div className="text-[11px] text-[#6F7478] mt-1">
                Regression slope &lt; 0.02g/run
              </div>
            </div>
          </div>

          {/* Interactive Charts: Multi-Sample Load vs Error with MPE Boundary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-[#162F4D]">
                    Multi-Sample Error Distribution vs OIML R-76 MPE Tolerance Boundaries
                  </h3>
                  <p className="text-xs text-[#6F7478]">
                    Observed error (g) across multiple sample runs mapped against upper/lower tolerance envelopes.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-[#E9F4FD] text-[#2F699C] px-2 py-0.5 rounded border border-blue-200">
                  {analysis.modelVersion}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F6F7F7" />
                    <XAxis
                      dataKey="load"
                      name="Applied Load"
                      unit="kg"
                      tick={{ fontSize: 11, fill: '#6F7478' }}
                    />
                    <YAxis
                      name="Error"
                      unit="g"
                      tick={{ fontSize: 11, fill: '#6F7478' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#162F4D', color: '#FFFFFF', borderRadius: '4px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="stepAfter"
                      dataKey="upperMpe"
                      name="Upper MPE (+Limit)"
                      stroke="#C0392B"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="lowerMpe"
                      name="Lower MPE (-Limit)"
                      stroke="#C0392B"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Scatter
                      dataKey="error"
                      name="Observed Sample Error"
                      fill="#2F699C"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance & Model Parameters */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#162F4D]">ML Feature Weighting</h3>
                <p className="text-xs text-[#6F7478]">Relative contribution to measurement dispersion</p>
              </div>

              <div className="space-y-3 text-xs">
                {analysis.featureImportance.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[#162F4D] font-medium">
                      <span>{feat.feature}</span>
                      <span>{(feat.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2F699C] h-full rounded-full"
                        style={{ width: `${feat.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100 text-[11px] text-[#6F7478] space-y-1 font-mono">
                <div>Mean Abs Error: {analysis.meanAbsoluteError}g</div>
                <div>Sample Variance: {analysis.variance}</div>
                <div>Evaluated: {new Date(analysis.analysisDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Anomaly Observations Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-[#162F4D] mb-1">
              Detected Anomalies & Statistical Deviations
            </h3>
            <p className="text-xs text-[#6F7478] mb-3">
              Samples flagged by the modified Z-score isolation model exceeding normal probability threshold.
            </p>

            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F7F7] font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-2.5">Sample ID</th>
                    <th className="p-2.5">Applied Load</th>
                    <th className="p-2.5">Observed Error</th>
                    <th className="p-2.5">Expected MPE Range</th>
                    <th className="p-2.5">Z-Score</th>
                    <th className="p-2.5">Anomaly Score</th>
                    <th className="p-2.5">Flag Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analysis.anomalyObservations.map((anom) => (
                    <tr key={anom.sampleId} className="hover:bg-amber-50/40">
                      <td className="p-2.5 font-mono font-semibold text-[#162F4D]">{anom.sampleId}</td>
                      <td className="p-2.5">{anom.load} kg</td>
                      <td className="p-2.5 font-mono font-bold text-[#C0392B]">{anom.error} g</td>
                      <td className="p-2.5 font-mono text-[#6F7478]">{anom.expectedRange}</td>
                      <td className="p-2.5 font-mono">{anom.zScore}</td>
                      <td className="p-2.5">
                        <span className="bg-red-50 text-[#C0392B] border border-red-200 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {anom.anomalyScore}/100
                        </span>
                      </td>
                      <td className="p-2.5 text-[#234B70]">{anom.flagReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DEDICATED ANALYTICAL REPORT MODAL WITH SEPARATE QR VERIFICATION */}
      {showAnalyticalReport && analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-3xl max-h-[92vh] flex flex-col my-auto">
            {/* Modal Controls */}
            <div className="no-print bg-[#162F4D] text-white px-5 py-3 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#1683C5]" />
                <span className="font-bold text-sm">
                  Metrological Analytical Report: {analysis.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-white text-[#162F4D] hover:bg-[#F6F7F7] px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Analytical Report</span>
                </button>
                <button
                  onClick={() => setShowAnalyticalReport(false)}
                  className="text-gray-300 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-8 text-xs text-[#162F4D] space-y-5">
              {/* Header */}
              <div className="text-center border-b-2 border-[#162F4D] pb-3 space-y-1">
                <div className="text-[10px] font-bold tracking-widest text-[#162F4D] uppercase">
                  MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
                </div>
                <div className="text-sm font-bold text-[#2F699C] uppercase">
                  LEGAL METROLOGY — MULTI-SAMPLE STATISTICAL & ML ANALYTICAL REPORT
                </div>
                <div className="text-[11px] text-[#6F7478]">
                  Companion Decision-Support Document for NAWI Model Evaluation
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F6F7F7] p-3 rounded border border-gray-200">
                <div>
                  <span className="text-[10px] text-[#6F7478]">Analysis Code</span>
                  <div className="font-bold font-mono">{analysis.id}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478]">ML Model Version</span>
                  <div className="font-bold font-mono">{analysis.modelVersion}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478]">Samples Evaluated</span>
                  <div className="font-bold">{analysis.sampleCount} runs</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478]">Consistency Score</span>
                  <div className="font-bold text-[#1A7A4A]">{analysis.consistencyScore}%</div>
                </div>
              </div>

              {/* Statistical Dispersion Summary */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-1">
                  1. Dispersion & Drift Metrics
                </h4>
                <div className="p-3 bg-[#F6F7F7] rounded text-xs space-y-1">
                  <div>Mean Absolute Error (MAE): <span className="font-mono font-semibold">{analysis.meanAbsoluteError}g</span></div>
                  <div>Sample Variance (σ²): <span className="font-mono font-semibold">{analysis.variance}</span></div>
                  <div>Longitudinal Drift Trajectory: <span className="font-semibold text-[#2F699C]">{analysis.driftTrend}</span></div>
                  <div>Overall Risk Rating: <span className="font-semibold text-[#1A7A4A]">{analysis.complianceRiskRating}</span></div>
                </div>
              </div>

              {/* Findings & Conclusion */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-1">
                  2. Analytical Findings & Recommendations
                </h4>
                <p className="text-[#234B70] leading-relaxed p-3 bg-[#F6F7F7] rounded">
                  Across the {analysis.sampleCount} recorded sample observations, {analysis.anomalyCount} reading(s) triggered statistical isolation alerts. Overall measurement dispersion remains tightly clustered within OIML R-76 Table 6 tolerances. The instrument displays consistent repeatability under stabilized laboratory conditions.
                </p>
              </div>

              {/* QR Verification & Seal */}
              <div className="border-t border-gray-300 pt-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs">Analytical Report Verification Token:</div>
                  <div className="font-mono text-[11px] text-[#6F7478]">{analysis.analyticalReportQr}</div>
                  <div className="text-[10px] text-[#6F7478] mt-1">
                    Generated by Smart Legal Metrology Stochastic Pipeline
                  </div>
                </div>

                {analysis.analyticalReportQr && (
                  <img
                    src={analysis.analyticalReportQr}
                    alt="Analytics QR"
                    className="w-20 h-20 border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
