/**
 * Dedicated All Reports Repository & Standardized Document Viewer
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { TestReport } from '../types';
import { generateAndDownloadDocxReport } from '../services/reportDocxGenerator';

interface AllReportsViewProps {
  reports: TestReport[];
  selectedReport: TestReport | null;
  onSelectReport: (report: TestReport | null) => void;
  onVerifyToken: (token: string) => void;
}

export const AllReportsView: React.FC<AllReportsViewProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onVerifyToken,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [showQrModal, setShowQrModal] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testSession.instrument.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testSession.instrument.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testSession.instrument.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || r.testSession.complianceStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Filter Bar */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[#162F4D]">
            Official OIML R-76 Test Reports Repository
          </h1>
          <p className="text-xs text-[#6F7478]">
            Archived type evaluation reports under Section 22 of the Legal Metrology Act, 2009.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by report no, model, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#F6F7F7] border border-gray-300 rounded text-xs text-[#162F4D] w-64 focus:outline-hidden focus:border-[#2F699C]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#F6F7F7] border border-gray-300 rounded px-3 py-1.5 text-xs text-[#162F4D]"
          >
            <option value="ALL">All Verdicts</option>
            <option value="PASS">Compliant (PASS)</option>
            <option value="FAIL">Non-Compliant (FAIL)</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-[#2F699C] shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#2F699C] font-semibold bg-[#E9F4FD] px-2 py-0.5 rounded border border-blue-200">
                    {report.reportNumber}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">v{report.version} — Official Record</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    report.testSession.complianceStatus === 'PASS'
                      ? 'bg-emerald-50 text-[#1A7A4A] border-emerald-200'
                      : 'bg-red-50 text-[#C0392B] border-red-200'
                  }`}
                >
                  {report.testSession.complianceStatus}
                </span>
              </div>

              {/* Instrument Info */}
              <div className="mt-4 space-y-1">
                <h3 className="font-bold text-sm text-[#162F4D]">{report.testSession.instrument.model}</h3>
                <div className="text-xs text-[#234B70] font-medium">
                  {report.testSession.instrument.manufacturer}
                </div>
                <div className="text-[11px] text-[#6F7478]">
                  S/N: <span className="font-mono text-[#162F4D]">{report.testSession.instrument.serialNumber}</span> | Class {report.testSession.instrument.accuracyClass}
                </div>
              </div>

              {/* Verification Token */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-[#6F7478]">
                <span>Token: <span className="font-mono text-[#162F4D]">{report.verificationToken}</span></span>
                <button
                  onClick={() => onVerifyToken(report.verificationToken)}
                  className="text-[#2F699C] hover:underline font-semibold flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => onSelectReport(report)}
                className="text-xs font-semibold text-[#2F699C] hover:text-[#162F4D] flex items-center space-x-1"
              >
                <span>View Full Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => generateAndDownloadDocxReport(report)}
                  title="Download Word Document (.docx)"
                  className="p-1.5 rounded hover:bg-[#E9F4FD] text-[#2F699C] transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectReport(report)}
                  title="Print Standardized PDF"
                  className="p-1.5 rounded hover:bg-[#E9F4FD] text-[#2F699C] transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-[#6F7478]">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <div className="font-semibold text-[#162F4D]">No matching test reports located.</div>
          <div className="text-xs mt-1">Try adjusting search criteria or status filter.</div>
        </div>
      )}

      {/* DETAILED REPORT VIEWER MODAL (PRINT-READY GOVERNMENT FORMAT) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto">
            {/* Top Modal Controls */}
            <div className="no-print bg-[#162F4D] text-white px-6 py-3.5 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#1683C5]" />
                <span className="font-bold text-sm">
                  Report Viewer: {selectedReport.reportNumber} (OIML R-76)
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => generateAndDownloadDocxReport(selectedReport)}
                  className="bg-[#2F699C] hover:bg-[#234B70] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-white text-[#162F4D] hover:bg-[#F6F7F7] px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => onSelectReport(null)}
                  className="text-gray-300 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document Body */}
            <div className="flex-1 overflow-y-auto p-8 text-xs text-[#162F4D] space-y-6 print:p-0">
              {/* Official Letterhead */}
              <div className="text-center border-b-2 border-[#162F4D] pb-4 space-y-1">
                <div className="text-[11px] font-bold tracking-widest text-[#162F4D] uppercase">
                  GOVERNMENT OF INDIA | भारत सरकार
                </div>
                <div className="text-sm font-bold text-[#2F699C] uppercase tracking-wide">
                  MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
                </div>
                <div className="text-xs font-semibold text-[#234B70]">
                  DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION
                </div>
                <div className="text-[11px] text-[#6F7478]">
                  {selectedReport.laboratoryName} — {selectedReport.laboratoryAddress}
                </div>
              </div>

              {/* Document Title & Reference */}
              <div className="text-center space-y-1 py-1">
                <div className="text-base font-extrabold uppercase tracking-tight text-[#162F4D]">
                  NON-AUTOMATIC WEIGHING INSTRUMENT (NAWI) TYPE EVALUATION TEST REPORT
                </div>
                <div className="text-xs font-medium text-[#234B70]">
                  Evaluated in accordance with OIML Recommendation R-76-1:2006 & Legal Metrology Act, 2009
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F6F7F7] p-4 rounded border border-gray-300">
                <div>
                  <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Report Number</span>
                  <div className="font-bold text-[#162F4D] font-mono text-xs">{selectedReport.reportNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Date of Issue</span>
                  <div className="font-bold text-[#162F4D] text-xs">
                    {new Date(selectedReport.issuedAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Document Version</span>
                  <div className="font-bold text-[#162F4D] text-xs">v{selectedReport.version}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F7478] uppercase font-semibold">Compliance Verdict</span>
                  <div className="font-bold text-[#1A7A4A] text-xs">{selectedReport.testSession.complianceStatus}</div>
                </div>
              </div>

              {/* Instrument Technical Specifications */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-2 border-b border-gray-200 pb-1">
                  1. Instrument Technical Parameters & Applicant Data
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#6F7478]">Manufacturer:</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.manufacturer}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Model Designation:</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.model}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Serial Number:</span>
                    <div className="font-mono font-semibold">{selectedReport.testSession.instrument.serialNumber}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Accuracy Class:</span>
                    <div className="font-semibold text-[#2F699C]">Class {selectedReport.testSession.instrument.accuracyClass}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Max Capacity:</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.maxCapacity}{selectedReport.testSession.instrument.unit}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Min Capacity:</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.minCapacity}{selectedReport.testSession.instrument.unit}</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Verification Interval (e):</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.verificationScaleInterval_e}g</div>
                  </div>
                  <div>
                    <span className="text-[#6F7478]">Scale Intervals (n):</span>
                    <div className="font-semibold">{selectedReport.testSession.instrument.numberOfIntervals_n}</div>
                  </div>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-2 border-b border-gray-200 pb-1">
                  2. Laboratory & Environmental Conditions During Evaluation
                </h4>
                <div className="text-xs text-[#234B70] grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>Temperature: {selectedReport.testSession.environmental.temperatureMin}°C - {selectedReport.testSession.environmental.temperatureMax}°C</div>
                  <div>Relative Humidity: {selectedReport.testSession.environmental.relativeHumidity}%</div>
                  <div>Atmospheric Pressure: {selectedReport.testSession.environmental.atmosphericPressure} hPa</div>
                  <div>Mains Supply: {selectedReport.testSession.environmental.supplyVoltage}V, {selectedReport.testSession.environmental.supplyFrequency}Hz</div>
                </div>
              </div>

              {/* Weighing Performance Observations Table */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-2 border-b border-gray-200 pb-1">
                  3. Weighing Performance Test Results (OIML R-76 Clause A.4.4)
                </h4>
                <div className="overflow-x-auto border border-gray-300 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F7F7] font-semibold border-b border-gray-300">
                      <tr>
                        <th className="p-2">Step</th>
                        <th className="p-2">Direction</th>
                        <th className="p-2">Applied Load ({selectedReport.testSession.instrument.unit})</th>
                        <th className="p-2">Indication ({selectedReport.testSession.instrument.unit})</th>
                        <th className="p-2">Calculated Error E</th>
                        <th className="p-2">MPE Limit</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedReport.testSession.weighingObservations.map((obs) => (
                        <tr key={obs.id}>
                          <td className="p-2 font-mono">{obs.step}</td>
                          <td className="p-2 text-[#6F7478]">{obs.loadDirection}</td>
                          <td className="p-2 font-semibold">{obs.appliedLoad_L}</td>
                          <td className="p-2">{obs.indication_I}</td>
                          <td className="p-2 font-mono font-medium">{obs.calculatedError_E}</td>
                          <td className="p-2 font-mono text-[#6F7478]">±{obs.mpe}</td>
                          <td className="p-2">
                            <span className="font-bold text-[#1A7A4A]">{obs.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Metrological Tests */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-xs mb-2 border-b border-gray-200 pb-1">
                  4. Repeatability & Eccentricity Performance Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F6F7F7] rounded border border-gray-200">
                    <div className="font-bold text-[#162F4D] mb-1">Repeatability Test (Clause A.4.4.1)</div>
                    <div>Max Spread: <span className="font-mono font-semibold">{selectedReport.testSession.repeatabilityTest.maxSpread}</span> (MPE Limit: {selectedReport.testSession.repeatabilityTest.mpeSpreadLimit})</div>
                    <div className="mt-1 font-semibold text-[#1A7A4A]">Result: {selectedReport.testSession.repeatabilityTest.status}</div>
                  </div>
                  <div className="p-3 bg-[#F6F7F7] rounded border border-gray-200">
                    <div className="font-bold text-[#162F4D] mb-1">Eccentricity Loading Test (Clause A.4.7)</div>
                    <div>Applied Load: {selectedReport.testSession.eccentricityTest.appliedLoad}{selectedReport.testSession.instrument.unit} on 5 positions</div>
                    <div className="mt-1 font-semibold text-[#1A7A4A]">Result: {selectedReport.testSession.eccentricityTest.status}</div>
                  </div>
                </div>
              </div>

              {/* Verdict, SHA-256 Hash, QR Code & Signatures */}
              <div className="border-t-2 border-gray-300 pt-4 flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <div className="font-bold text-xs uppercase text-[#162F4D]">Official Metrological Verdict:</div>
                  <p className="text-xs text-[#234B70] leading-relaxed">
                    {selectedReport.testSession.overallVerdict}
                  </p>

                  <div className="pt-2 text-[10px] text-[#6F7478] space-y-1 font-mono">
                    <div className="break-all">
                      <span className="font-semibold text-[#162F4D]">SHA-256 Seal:</span> {selectedReport.sha256Hash}
                    </div>
                    <div>
                      <span className="font-semibold text-[#162F4D]">Verification URL Token:</span> {selectedReport.verificationToken}
                    </div>
                  </div>
                </div>

                {/* QR Code & Signature Box */}
                <div className="flex flex-col items-center text-center space-y-2 shrink-0 border border-gray-300 p-3 rounded bg-[#F6F7F7]">
                  {selectedReport.qrCodeDataUrl ? (
                    <img
                      src={selectedReport.qrCodeDataUrl}
                      alt="Verification QR"
                      className="w-24 h-24 border border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white border flex items-center justify-center text-[10px] text-gray-400">
                      QR Sealed
                    </div>
                  )}
                  <div className="text-[10px] font-bold text-[#162F4D]">Scan to Authenticate</div>
                  <div className="text-[11px] font-semibold text-[#2F699C] pt-1">
                    {selectedReport.authorizedSignatory}
                  </div>
                  <div className="text-[9px] text-[#6F7478]">
                    {selectedReport.designation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
