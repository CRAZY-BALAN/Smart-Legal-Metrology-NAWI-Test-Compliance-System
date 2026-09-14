/**
 * Cryptographic QR Code & Token Authenticity Verification Modal
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Lock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

interface VerificationModalProps {
  token: string | null;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ token, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .verifyReportToken(token)
      .then((res) => {
        setResult(res);
      })
      .catch((err) => {
        setResult({ valid: false, message: 'Invalid or revoked verification token' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (!token) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-lg overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-[#162F4D] text-white p-4 flex items-center justify-between border-b border-[#234B70]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#1683C5]" />
            <span className="font-bold text-sm">Official Report Authenticity Check</span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-6 space-y-2">
              <div className="animate-spin w-8 h-8 border-3 border-[#2F699C] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500">Checking central registry & cryptographic seal...</p>
            </div>
          ) : result && result.valid ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-[#1A7A4A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#162F4D] text-sm">
                    GENUINE & TAMPER-EVIDENT GOVERNMENT DOCUMENT
                  </h4>
                  <p className="text-[#234B70] mt-1 text-[11px] leading-relaxed">
                    This report has been validated against the Legal Metrology Type Approval Registry. The SHA-256 seal matches the digital certificate issued at evaluation time.
                  </p>
                </div>
              </div>

              <div className="bg-[#F6F7F7] p-4 rounded-md border border-gray-200 space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-[#6F7478]">Report Number:</span>{' '}
                  <span className="font-bold text-[#162F4D]">{result.report?.reportNumber}</span>
                </div>
                <div>
                  <span className="text-[#6F7478]">Instrument:</span>{' '}
                  <span className="text-[#162F4D]">{result.report?.instrument}</span>
                </div>
                <div>
                  <span className="text-[#6F7478]">Evaluation Verdict:</span>{' '}
                  <span className="font-bold text-[#1A7A4A]">{result.report?.complianceStatus}</span>
                </div>
                <div>
                  <span className="text-[#6F7478]">Issued On:</span>{' '}
                  <span className="text-[#162F4D]">{new Date(result.report?.issuedAt).toLocaleString()}</span>
                </div>
                <div className="break-all pt-1 border-t border-gray-200 text-[10px]">
                  <span className="text-[#6F7478]">SHA-256 Digest:</span> {result.report?.sha256}
                </div>
              </div>

              <div className="text-[10px] text-[#6F7478] text-center">
                Statutory validity guaranteed under Section 22 of the Legal Metrology Act, 2009.
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start space-x-3 text-[#C0392B]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Verification Failed</div>
                <p className="text-xs mt-1">
                  The provided token ({token}) is either invalid, revoked, or does not match any official laboratory test records.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F6F7F7] px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-4 py-1.5 rounded text-xs font-semibold"
          >
            Close Verification
          </button>
        </div>
      </div>
    </div>
  );
};
