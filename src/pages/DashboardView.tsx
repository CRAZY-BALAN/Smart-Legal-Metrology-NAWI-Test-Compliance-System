/**
 * Main Government Dashboard View
 * Features: Metrology KPIs, OIML testing workflows, and the interactive Lab Projects & Work Tracker
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React, { useState } from 'react';
import {
  Activity,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Plus,
  Calendar,
  User,
  Shield,
  Search,
  Sliders,
  Sparkles,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { LabProject, UserProfile, TestReport, NotificationItem, InventoryItem } from '../types';
import { calculateDaysRemaining } from '../utils/oimlCalculations';

interface DashboardViewProps {
  kpis: {
    completedReports: number;
    activeSessions: number;
    pendingReviews: number;
    totalInstruments: number;
    passRatePercentage: number;
    lowInventoryCount: number;
    activeProjectsCount: number;
  };
  projects: LabProject[];
  recentReports: TestReport[];
  notifications: NotificationItem[];
  inventoryAlerts: InventoryItem[];
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
  onSelectReport: (report: TestReport) => void;
  onUpdateProject: (id: string, updates: Partial<LabProject>) => Promise<void>;
  onCreateProject: (project: any) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  projects,
  recentReports,
  inventoryAlerts,
  currentUser,
  onNavigate,
  onSelectReport,
  onUpdateProject,
  onCreateProject,
}) => {
  // Selected project for detail modal
  const [selectedProject, setSelectedProject] = useState<LabProject | null>(null);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editPercentage, setEditPercentage] = useState<number>(0);
  const [editRemainingSummary, setEditRemainingSummary] = useState<string>('');
  const [editDeadline, setEditDeadline] = useState<string>('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-10-15');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  const handleOpenDetail = (project: LabProject) => {
    setSelectedProject(project);
    setEditPercentage(project.progressPercentage);
    setEditRemainingSummary(project.remainingSummary);
    setEditDeadline(project.tentativeDeadline);
    setIsEditingProgress(false);
  };

  const handleSaveProjectUpdates = async () => {
    if (!selectedProject) return;

    const updates: Partial<LabProject> = {
      progressPercentage: editPercentage,
      remainingSummary: editRemainingSummary,
      ...(currentUser.role === 'ADMIN' ? { tentativeDeadline: editDeadline } : {}),
      status: editPercentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
    };

    await onUpdateProject(selectedProject.id, updates);
    setSelectedProject({ ...selectedProject, ...updates });
    setIsEditingProgress(false);
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateProject({
      title: newTitle,
      objective: newObjective,
      assignedLead: currentUser.name,
      technicians: [currentUser.name],
      startDate: new Date().toISOString().split('T')[0],
      tentativeDeadline: newDeadline,
      progressPercentage: 0,
      currentPhase: 'Initial Instrumentation & Setup',
      priority: newPriority,
      status: 'NOT_STARTED',
      tasks: [
        { id: `t-${Date.now()}-1`, title: 'Preliminary inspection and baseline calibration', completed: false, assignedTo: currentUser.name },
        { id: `t-${Date.now()}-2`, title: 'OIML R-76 loading sequence execution', completed: false, assignedTo: currentUser.name },
      ],
      remainingSummary: 'Initial project setup pending.',
      remarks: 'Registered via Smart Legal Metrology Laboratory Portal.',
    });

    setShowNewProjectModal(false);
    setNewTitle('');
    setNewObjective('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Institutional Top Banner */}
      <div className="bg-[#E9F4FD] border-l-4 border-[#2F699C] p-5 rounded-r-lg shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-[#2F699C] tracking-wider uppercase">
              Official Laboratory Evaluation Portal
            </div>
            <h1 className="text-xl font-bold text-[#162F4D] mt-0.5">
              Legal Metrology NAWI Verification & OIML R-76 Compliance
            </h1>
            <p className="text-xs text-[#234B70] mt-1 max-w-3xl leading-relaxed">
              Designated platform for testing Non-Automatic Weighing Instruments under the Legal Metrology Act, 2009. Automated calculation of Maximum Permissible Errors, compliance determination, and cryptographic report generation.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="start-test-btn"
              onClick={() => onNavigate('wizard')}
              className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Start OIML Test Session</span>
            </button>
            <button
              id="view-gallery-btn"
              onClick={() => onNavigate('reports')}
              className="bg-white hover:bg-[#F6F7F7] text-[#234B70] border border-gray-300 px-4 py-2.5 rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <span>View All Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Facility / Low Chemical Pop-up Alert Banner */}
      {inventoryAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#D4870A] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-[#162F4D]">
              Laboratory Operations Alert: Low Stock / Expiring Consumables Detected
            </div>
            <p className="text-[#6F7478] mt-0.5">
              {inventoryAlerts.length} laboratory resource(s) require immediate attention (e.g.{' '}
              {inventoryAlerts.map((i) => i.name).slice(0, 2).join(', ')}). Replenish before environmental chamber runs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="bg-[#D4870A] text-white px-3 py-1 rounded text-xs font-medium hover:bg-amber-700 transition-colors"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6F7478]">
            <span>Reports Generated</span>
            <FileCheck className="w-4 h-4 text-[#2F699C]" />
          </div>
          <div className="text-2xl font-bold text-[#162F4D] mt-2">
            {kpis.completedReports}
          </div>
          <div className="text-[11px] text-[#1A7A4A] font-medium mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tamper-evident QR stamped</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6F7478]">
            <span>Active Test Sessions</span>
            <Activity className="w-4 h-4 text-[#1683C5]" />
          </div>
          <div className="text-2xl font-bold text-[#162F4D] mt-2">
            {kpis.activeSessions}
          </div>
          <div className="text-[11px] text-[#234B70] mt-1">
            <span>In testing & review pipeline</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6F7478]">
            <span>Compliance Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#1A7A4A]" />
          </div>
          <div className="text-2xl font-bold text-[#162F4D] mt-2">
            {kpis.passRatePercentage}%
          </div>
          <div className="text-[11px] text-[#6F7478] mt-1">
            <span>Initial verification standards</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6F7478]">
            <span>Active Lab Projects</span>
            <Layers className="w-4 h-4 text-[#2F699C]" />
          </div>
          <div className="text-2xl font-bold text-[#162F4D] mt-2">
            {kpis.activeProjectsCount}
          </div>
          <div className="text-[11px] text-[#D4870A] font-medium mt-1 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Deadlines auto-computed daily</span>
          </div>
        </div>
      </div>

      {/* SECTION: LABORATORY WORK & PROJECTS TRACKER (Mantra 2 Unique Feature #6) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#162F4D] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#2F699C]" />
              <span>Laboratory Research & Work Tracker</span>
            </h2>
            <p className="text-xs text-[#6F7478]">
              Monitor ongoing model evaluations, research activities, auto-calculated deadlines, and technician task progress.
            </p>
          </div>

          <button
            id="create-project-btn"
            onClick={() => setShowNewProjectModal(true)}
            className="bg-white hover:bg-[#E9F4FD] text-[#2F699C] border border-[#2F699C] px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work Item</span>
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const deadlineInfo = calculateDaysRemaining(proj.tentativeDeadline);

            return (
              <div
                key={proj.id}
                onClick={() => handleOpenDetail(proj)}
                className="bg-white rounded-lg border border-gray-200 hover:border-[#2F699C] shadow-xs hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header: Code and Auto-computed Days Remaining Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F6F7F7] text-[#234B70] border border-gray-200">
                      {proj.projectCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${deadlineInfo.badgeClass}`}
                    >
                      {deadlineInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-[#162F4D] group-hover:text-[#2F699C] transition-colors mt-3 leading-snug">
                    {proj.title}
                  </h3>

                  {/* Objective */}
                  <p className="text-xs text-[#6F7478] mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.objective}
                  </p>
                </div>

                {/* Progress Bar & Status */}
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#6F7478] font-medium">Completion Progress</span>
                    <span className="font-bold text-[#162F4D]">{proj.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2F699C] h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-[#6F7478]">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-[#1683C5]" />
                      <span className="truncate max-w-[130px]">{proj.assignedLead}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#2F699C] font-semibold group-hover:underline">
                      <span>View Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-Column Section: Recent Test Reports & Quick Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Completed Reports (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-sm text-[#162F4D]">Recent OIML R-76 Type Evaluation Reports</h2>
              <p className="text-xs text-[#6F7478]">Official reports with tamper-proof cryptographic hashes</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#2F699C] hover:underline flex items-center space-x-1"
            >
              <span>View All ({kpis.completedReports})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="py-3.5 flex items-center justify-between hover:bg-[#F6F7F7] px-2 rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-[#E9F4FD] text-[#2F699C] flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#162F4D] flex items-center space-x-2">
                      <span>{report.reportNumber}</span>
                      <span className="bg-emerald-50 text-[#1A7A4A] border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
                        {report.testSession.complianceStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6F7478] mt-0.5">
                      {report.testSession.instrument.manufacturer} — {report.testSession.instrument.model} (Class {report.testSession.instrument.accuracyClass})
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-medium text-[#234B70]">
                    {new Date(report.issuedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Token: {report.verificationToken}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Utility Tools (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
            <h3 className="font-bold text-xs text-[#162F4D] uppercase tracking-wider mb-3">
              Standard Testing Modules
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('wizard')}
                className="w-full text-left p-3 rounded-md bg-[#F6F7F7] hover:bg-[#E9F4FD] transition-colors flex items-center justify-between border border-gray-200/60"
              >
                <div>
                  <div className="font-semibold text-[#162F4D]">OIML R-76 Test Entry Wizard</div>
                  <div className="text-[11px] text-[#6F7478]">Record weighing, repeatability & eccentricity</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2F699C]" />
              </button>

              <button
                onClick={() => onNavigate('ml')}
                className="w-full text-left p-3 rounded-md bg-[#F6F7F7] hover:bg-[#E9F4FD] transition-colors flex items-center justify-between border border-gray-200/60"
              >
                <div>
                  <div className="font-semibold text-[#162F4D]">Multi-Sample ML Analytics</div>
                  <div className="text-[11px] text-[#6F7478]">Outlier detection, drift trends & report</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2F699C]" />
              </button>

              <button
                onClick={() => onNavigate('inventory')}
                className="w-full text-left p-3 rounded-md bg-[#F6F7F7] hover:bg-[#E9F4FD] transition-colors flex items-center justify-between border border-gray-200/60"
              >
                <div>
                  <div className="font-semibold text-[#162F4D]">Reference Weights & Chemicals</div>
                  <div className="text-[11px] text-[#6F7478]">Monitor E2/F1 sets and reagents</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#2F699C]" />
              </button>
            </div>
          </div>

          <div className="bg-[#162F4D] text-white rounded-lg p-4 shadow-xs text-xs">
            <div className="font-bold text-sm mb-1 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-[#1683C5]" />
              <span>Legal Metrology Act, 2009</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Every NAWI must conform to General Rules 2011 and OIML R-76 for verification before commercial deployment.
            </p>
          </div>
        </div>
      </div>

      {/* PROJECT DETAIL & TECHNICIAN/ADMIN EDIT MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#162F4D] text-white p-5 flex items-start justify-between border-b border-[#234B70]">
              <div>
                <span className="text-[10px] font-mono bg-[#2F699C] px-2 py-0.5 rounded text-white font-semibold">
                  {selectedProject.projectCode}
                </span>
                <h3 className="font-bold text-base mt-1 text-white">{selectedProject.title}</h3>
                <div className="text-xs text-gray-300 mt-0.5">
                  Assigned Lead: {selectedProject.assignedLead}
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-300 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Objective */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-[11px] mb-1">
                  Scope & Objective
                </h4>
                <p className="text-[#234B70] leading-relaxed bg-[#F6F7F7] p-3 rounded border border-gray-200">
                  {selectedProject.objective}
                </p>
              </div>

              {/* Deadline & Countdown Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#E9F4FD] p-3 rounded border border-blue-200">
                  <span className="text-[10px] text-[#6F7478]">Tentative Deadline</span>
                  <div className="font-bold text-[#162F4D] text-sm mt-0.5">
                    {selectedProject.tentativeDeadline}
                  </div>
                </div>

                <div className="bg-[#E9F4FD] p-3 rounded border border-blue-200">
                  <span className="text-[10px] text-[#6F7478]">Calculated Days Left</span>
                  <div className="font-bold text-[#162F4D] text-sm mt-0.5">
                    {calculateDaysRemaining(selectedProject.tentativeDeadline).label}
                  </div>
                </div>

                <div className="bg-[#E9F4FD] p-3 rounded border border-blue-200">
                  <span className="text-[10px] text-[#6F7478]">Current Work Status</span>
                  <div className="font-bold text-[#2F699C] text-sm mt-0.5">
                    {selectedProject.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Work Breakdown Tasks */}
              <div>
                <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-[11px] mb-2">
                  Key Evaluation Tasks & Milestone Checklist
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-md overflow-hidden">
                  {selectedProject.tasks.map((task) => (
                    <div key={task.id} className="p-2.5 flex items-center justify-between hover:bg-[#F6F7F7]">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          disabled={!isEditingProgress}
                          onChange={(e) => {
                            const updatedTasks = selectedProject.tasks.map((t) =>
                              t.id === task.id ? { ...t, completed: e.target.checked } : t
                            );
                            setSelectedProject({ ...selectedProject, tasks: updatedTasks });
                          }}
                          className="rounded text-[#2F699C] focus:ring-[#2F699C]"
                        />
                        <span className={task.completed ? 'line-through text-gray-400' : 'text-[#162F4D]'}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{task.assignedTo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress & Remaining Parts Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-[#162F4D] uppercase tracking-wider text-[11px]">
                    Remaining Work & Status Log
                  </h4>
                  {!isEditingProgress && (
                    <button
                      onClick={() => setIsEditingProgress(true)}
                      className="text-[#2F699C] font-semibold text-xs flex items-center space-x-1 hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>
                        {currentUser.role === 'ADMIN' ? 'Edit Deadline & Progress' : 'Update My Work Progress'}
                      </span>
                    </button>
                  )}
                </div>

                {isEditingProgress ? (
                  <div className="space-y-3 bg-[#F6F7F7] p-4 rounded-md border border-gray-200">
                    <div>
                      <label className="block font-semibold text-[#162F4D] mb-1">
                        Completion Percentage (%): {editPercentage}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editPercentage}
                        onChange={(e) => setEditPercentage(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {currentUser.role === 'ADMIN' && (
                      <div>
                        <label className="block font-semibold text-[#162F4D] mb-1">
                          Tentative Completion Deadline (Admin Only Override)
                        </label>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-[#162F4D]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-[#162F4D] mb-1">
                        Remaining Parts / Next Steps
                      </label>
                      <textarea
                        rows={2}
                        value={editRemainingSummary}
                        onChange={(e) => setEditRemainingSummary(e.target.value)}
                        placeholder="Log what portions of work are completed and what parts remain..."
                        className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-[#162F4D]"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setIsEditingProgress(false)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-[#6F7478] hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProjectUpdates}
                        className="px-4 py-1.5 bg-[#2F699C] hover:bg-[#162F4D] text-white rounded font-semibold"
                      >
                        Save Updates
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F6F7F7] p-3 rounded border border-gray-200">
                    <p className="text-[#234B70] leading-relaxed">
                      {selectedProject.remainingSummary || 'No remaining work summary logged yet.'}
                    </p>
                    <div className="text-[10px] text-[#6F7478] mt-2">
                      Last synchronized: {new Date(selectedProject.updatedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#F6F7F7] px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="bg-[#2F699C] hover:bg-[#162F4D] text-white px-4 py-1.5 rounded text-xs font-semibold transition-colors"
              >
                Close Project Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LAB WORK ITEM MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-lg">
            <div className="bg-[#162F4D] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Lab Research / Work Item</h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-gray-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#162F4D] mb-1">Project / Evaluation Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model Verification of Industrial Platform Scales"
                  className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#162F4D] mb-1">Scope & Technical Objective</label>
                <textarea
                  rows={2}
                  required
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Describe test scope per OIML R-76 requirements..."
                  className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#162F4D] mb-1">Tentative Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#162F4D] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full border border-gray-300 rounded p-2 text-[#162F4D]"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-[#6F7478]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2F699C] hover:bg-[#162F4D] text-white rounded font-semibold"
                >
                  Create Work Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
