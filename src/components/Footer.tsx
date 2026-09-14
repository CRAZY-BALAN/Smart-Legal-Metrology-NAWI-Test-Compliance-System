/**
 * Government Portal Official Institutional Footer
 * Conforms to NIC Web Guidelines & Legal Metrology Act 2009 citations.
 */

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#162F4D] text-[#FFFFFF] mt-16 border-t border-[#234B70] text-xs">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-white/10">
          {/* Column 1: Organization */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#1683C5]" />
              <span className="font-bold text-sm tracking-wide">LEGAL METROLOGY</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Ministry of Consumer Affairs, Food & Public Distribution, Government of India. Dedicated software framework for Type Approval & Verification of Non-Automatic Weighing Instruments.
            </p>
          </div>

          {/* Column 2: Legal & Regulatory Framework */}
          <div>
            <div className="font-semibold text-gray-200 text-xs uppercase tracking-wider mb-2">
              Statutory Framework
            </div>
            <ul className="space-y-1.5 text-gray-300 text-[11px]">
              <li>Legal Metrology Act, 2009 (Act 1 of 2010)</li>
              <li>Legal Metrology (General) Rules, 2011</li>
              <li>OIML Recommendation R-76-1 (Edition 2006)</li>
              <li>WELMEC Software Guide 7.2 (Model Approval)</li>
            </ul>
          </div>

          {/* Column 3: Designated Laboratories */}
          <div>
            <div className="font-semibold text-gray-200 text-xs uppercase tracking-wider mb-2">
              Designated Laboratories
            </div>
            <ul className="space-y-1.5 text-gray-300 text-[11px]">
              <li>National Physical Laboratory (NPL), New Delhi</li>
              <li>Regional Reference Standards Lab (RRSL), Faridabad</li>
              <li>RRSL Ahmedabad, Bengaluru, Bhubaneswar, Guwahati</li>
              <li>Indian Institute of Legal Metrology (IILM), Ranchi</li>
            </ul>
          </div>

          {/* Column 4: Compliance & Integrity */}
          <div>
            <div className="font-semibold text-gray-200 text-xs uppercase tracking-wider mb-2">
              Report Authenticity
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed mb-2">
              All generated test reports contain tamper-evident SHA-256 cryptographic signatures and embedded verification QR codes accessible by authorized state inspectors.
            </p>
            <div className="inline-flex items-center space-x-1 text-[11px] text-[#1683C5]">
              <span>Official Consumer Affairs Portal</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          <div>
            © 2026 Ministry of Consumer Affairs, Food & Public Distribution, Government of India. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Security Certified</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>NIC Guidelines Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
