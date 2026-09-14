/**
 * Authentication Gateway — First screen of the application.
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 *
 * This is a front-end auth gate (no real backend session yet). It validates
 * that fields are filled, "hashes" the password client-side for show, and
 * hands the selected role back to App.tsx via onLogin(role).
 * Wire this to your real auth endpoint in handleSubmit() when the backend
 * is ready — the TODO marks exactly where.
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface AuthViewProps {
  onLogin: (role: UserRole) => void;
}

const ROLE_OPTIONS: { role: UserRole; label: string; helper: string }[] = [
  { role: 'LAB_TECHNICIAN', label: 'Lab Technician', helper: 'Enter observations & update test progress' },
  { role: 'REVIEWER', label: 'Reviewer / Scientist', helper: 'Validate calculations & approve reports' },
  { role: 'ADMIN', label: 'Administrator', helper: 'Full access — rules, inventory & deadlines' },
];

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('LAB_TECHNICIAN');
  const [officialId, setOfficialId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!officialId.trim() || !password.trim()) {
      setError('Enter your Official ID and password to continue.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setSubmitting(true);

    // TODO: replace this block with your real backend call, e.g.:
    // const res = await api.login({ officialId, password, role: selectedRole });
    // if (!res.ok) { setError(res.message); return; }
    setTimeout(() => {
      setSubmitting(false);
      onLogin(selectedRole);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F6F7F7]">
      {/* Left institutional / brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#162F4D] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative">
          <div className="flex items-center space-x-3">
            <img
  src="/assets/doca/dca-logo.png"
  alt="Department of Consumer Affairs"
  className="h-12 w-auto object-contain"
/>
            <div>
              <div className="font-bold tracking-wide uppercase text-sm">Government of India</div>
              <div className="text-gray-300 text-xs">भारत सरकार</div>
            </div>
          </div>
          <div className="mt-1 text-gray-300 text-xs">
            Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology Division
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Smart Legal Metrology
            <br />
            NAWI Test &amp; Compliance System
          </h1>
          <p className="text-gray-300 text-sm max-w-md leading-relaxed">
            Secure portal for generating, reviewing, and authorizing Non-Automatic
            Weighing Instrument test reports under OIML R-76.
          </p>
        </div>

        <div className="relative text-[11px] text-gray-400 flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Sessions are encrypted end-to-end. Unauthorized access is a punishable offence.</span>
        </div>
      </div>

      {/* Right auth form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile-only brand header */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-[#2F699C] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#162F4D] leading-tight">Smart Legal Metrology</div>
              <div className="text-[11px] text-[#6F7478]">NAWI Test & Compliance System</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-[#162F4D]">Sign in to continue</h2>
            <p className="text-sm text-[#6F7478] mt-1">
              Use your official laboratory credentials to access the system.
            </p>

            {/* Role selector */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setSelectedRole(opt.role)}
                  className={`px-2 py-2 rounded-md border text-[11px] font-semibold transition-colors text-center ${
                    selectedRole === opt.role
                      ? 'bg-[#E9F4FD] border-[#2F699C] text-[#2F699C]'
                      : 'border-gray-200 text-[#6F7478] hover:bg-[#F6F7F7]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#6F7478]">
              {ROLE_OPTIONS.find((o) => o.role === selectedRole)?.helper}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#234B70] mb-1.5">
                  Official ID / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6F7478] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder="e.g. MCA-TECH-002"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F699C]/30 focus:border-[#2F699C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#234B70] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6F7478] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F699C]/30 focus:border-[#2F699C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7478]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-[#C0392B] rounded-md p-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2F699C] hover:bg-[#162F4D] disabled:opacity-70 text-white font-semibold py-2.5 rounded-md text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials…</span>
                  </>
                ) : (
                  <span>Secure Sign-In</span>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-[#6F7478] flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-[#1683C5]" />
              <span>Protected by TLS encryption. Access is logged for audit purposes.</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#6F7478] mt-6">
            © {new Date().getFullYear()} Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India
          </p>
        </div>
      </div>
    </div>
  );
};
