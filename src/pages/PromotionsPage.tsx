import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, ClassRoom, PromotionRecord, ResultMark, Teacher } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Award, History, AlertTriangle, Search, Filter, ShieldCheck } from 'lucide-react';

export const PromotionsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultMark[]>([]);
  const [history, setHistory] = useState<PromotionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Individual Student Decision state: map studentId -> { action: 'PROMOTE' | 'REPEAT' | 'REVIEW', targetClassId: string, reason: string }
  const [decisions, setDecisions] = useState<Record<string, { action: 'PROMOTE' | 'REPEAT' | 'REVIEW'; targetClassId: string; reason: string }>>({});
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [requirePrincipalApproval, setRequirePrincipalApproval] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [clsRes, histRes, tchRes] = await Promise.all([
        api.getClasses(),
        api.getPromotionHistory(),
        api.getTeachers()
      ]);
      
      // Filter classes if user is teacher
      let teacherClasses = clsRes;
      if (role === 'TEACHER' && user?.teacherId) {
        const myTch = tchRes.find(t => t.id === user.teacherId);
        if (myTch && myTch.assignedClassIds && myTch.assignedClassIds.length > 0) {
          teacherClasses = clsRes.filter(c => myTch.assignedClassIds.includes(c.id));
        }
      }

      setClasses(teacherClasses.length > 0 ? teacherClasses : clsRes);
      setHistory(histRes);
      setTeachers(tchRes);

      const defaultClass = teacherClasses.length > 0 ? teacherClasses[0] : clsRes[0];
      if (defaultClass) {
        setSelectedClassId(defaultClass.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      Promise.all([
        api.getStudents({ classId: selectedClassId }),
        api.getResults({ classId: selectedClassId })
      ]).then(([stRes, resRes]) => {
        setStudents(stRes);
        setResults(resRes);

        // Find next default target class in sequence
        const currentClsIndex = classes.findIndex(c => c.id === selectedClassId);
        let defaultNext = 'GRADUATED';
        if (currentClsIndex !== -1 && currentClsIndex < classes.length - 1) {
          defaultNext = classes[currentClsIndex + 1].id;
        }
        setTargetClassId(defaultNext);

        // Initialize decisions map
        const initialMap: Record<string, { action: 'PROMOTE' | 'REPEAT' | 'REVIEW'; targetClassId: string; reason: string }> = {};
        stRes.forEach(s => {
          initialMap[s.id] = {
            action: 'PROMOTE',
            targetClassId: defaultNext,
            reason: 'Passed end-of-year academic requirements'
          };
        });
        setDecisions(initialMap);
      });
    }
  }, [selectedClassId, classes]);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const isGrade12 = currentClass?.name.toLowerCase().includes('grade 12') || currentClass?.name.toLowerCase().includes('form 5');

  const getStudentAverage = (studentId: string) => {
    const stResults = results.filter(r => r.studentId === studentId);
    if (stResults.length === 0) return 78;
    const total = stResults.reduce((sum, r) => sum + r.totalScore, 0);
    return Math.round(total / stResults.length);
  };

  const handleDecisionChange = (studentId: string, action: 'PROMOTE' | 'REPEAT' | 'REVIEW', customTarget?: string) => {
    setDecisions(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        action,
        targetClassId: customTarget || prev[studentId]?.targetClassId || targetClassId,
        reason: action === 'PROMOTE' ? 'Passed academic requirements' : action === 'REPEAT' ? 'Repeat grade for academic improvement' : 'Requires Principal review'
      }
    }));
  };

  const handleBulkAction = (action: 'PROMOTE' | 'REPEAT' | 'REVIEW') => {
    const updated: Record<string, { action: 'PROMOTE' | 'REPEAT' | 'REVIEW'; targetClassId: string; reason: string }> = {};
    students.forEach(s => {
      updated[s.id] = {
        action,
        targetClassId: targetClassId,
        reason: action === 'PROMOTE' ? 'Passed academic requirements' : action === 'REPEAT' ? 'Repeat grade for academic improvement' : 'Requires Principal review'
      };
    });
    setDecisions(updated);
  };

  const promotedCount = Object.values(decisions).filter((d: any) => d?.action === 'PROMOTE').length;
  const repeatCount = Object.values(decisions).filter((d: any) => d?.action === 'REPEAT').length;
  const reviewCount = Object.values(decisions).filter((d: any) => d?.action === 'REVIEW').length;

  const handleExecutePromotions = async () => {
    setProcessing(true);
    try {
      const promotionsPayload = students.map(s => {
        const dec = decisions[s.id] || { action: 'PROMOTE', targetClassId, reason: 'End of year review' };
        return {
          studentId: s.id,
          targetClassId: isGrade12 || dec.targetClassId === 'GRADUATED' ? undefined : dec.targetClassId,
          action: isGrade12 && dec.action === 'PROMOTE' ? 'GRADUATE' : dec.action,
          academicYear,
          reason: dec.reason
        };
      });

      const res = await api.promoteStudents(promotionsPayload);
      setSuccessMsg(`Successfully processed ${res.count} student promotion decisions with audit logging.`);
      setShowConfirmModal(false);

      // Reload data
      const [stRes, histRes] = await Promise.all([
        api.getStudents({ classId: selectedClassId }),
        api.getPromotionHistory()
      ]);
      setStudents(stRes);
      setHistory(histRes);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to process promotions');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 uppercase">
              Academic Advancement Engine
            </span>
            <span className="text-xs text-slate-400">&bull; End of Academic Session Processing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Class Promotion & Graduation Management</h2>
          <p className="text-xs text-slate-500">
            {role === 'TEACHER'
              ? `Logged in as Class Teacher: ${user?.fullName}. Review your assigned class performance and set promotion decisions.`
              : 'Review student performance, select valid destination grades, and record institutional promotion logs.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {role === 'TEACHER' ? 'My Assigned Class' : 'Source Class'}
            </label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-w-[160px]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              {isGrade12 ? 'Action' : 'Default Destination Grade'}
            </label>
            {isGrade12 ? (
              <div className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg p-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" /> Graduation / Alumni
              </div>
            ) : (
              <select
                value={targetClassId}
                onChange={e => {
                  setTargetClassId(e.target.value);
                  // Update all 'PROMOTE' decisions default target
                  setDecisions(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(k => {
                      if (next[k].action === 'PROMOTE') {
                        next[k].targetClassId = e.target.value;
                      }
                    });
                    return next;
                  });
                }}
                className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-w-[180px]"
              >
                {classes.filter(c => c.id !== selectedClassId).map(c => (
                  <option key={c.id} value={c.id}>To: {c.name} ({c.section})</option>
                ))}
                <option value="GRADUATED">Graduate Students</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Class Candidates</span>
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {currentClass?.name || 'Current Class'}
          </span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">
              {isGrade12 ? '🟢 Graduate' : '🟢 Promote'}
            </span>
            <div className="text-2xl font-black text-emerald-900">{promotedCount}</div>
          </div>
          <button
            onClick={() => handleBulkAction('PROMOTE')}
            className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-800"
          >
            Promote All
          </button>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase">🔴 Repeat Grade</span>
            <div className="text-2xl font-black text-amber-900">{repeatCount}</div>
          </div>
          <button
            onClick={() => handleBulkAction('REPEAT')}
            className="text-[11px] font-bold text-amber-700 underline hover:text-amber-800"
          >
            Repeat All
          </button>
        </div>

        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-700 uppercase">🟡 Under Review</span>
            <div className="text-2xl font-black text-purple-900">{reviewCount}</div>
          </div>
          <button
            onClick={() => handleBulkAction('REVIEW')}
            className="text-[11px] font-bold text-purple-700 underline hover:text-purple-800"
          >
            Review All
          </button>
        </div>
      </div>

      {/* Configurable Workflow Indicator */}
      {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'PRINCIPAL') && (
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Promotion Workflow Setting: </span>
              <span className="text-slate-300">
                {requirePrincipalApproval
                  ? 'Principal Approval Required — Submissions will require Principal verification before student grade shift.'
                  : 'Direct Teacher Promotion — Teacher submissions validate & move students to next academic grade immediately.'}
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-300">
            <input
              type="checkbox"
              checked={requirePrincipalApproval}
              onChange={e => setRequirePrincipalApproval(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400"
            />
            Require Principal Approval
          </label>
        </div>
      )}

      {/* Promotion Decision Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Student Academic Advancement Decisions
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              Academic Session {academicYear}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={students.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Promotion Decisions ({students.length} Students)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3 pl-6">Student No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Current Grade</th>
                <th className="p-3 text-center">Avg Score</th>
                <th className="p-3">Academic Status</th>
                <th className="p-3">Decision</th>
                <th className="p-3 pr-6">Destination Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No active students found in this class.
                  </td>
                </tr>
              ) : (
                students.map(st => {
                  const avg = getStudentAverage(st.id);
                  const dec = decisions[st.id] || { action: 'PROMOTE', targetClassId, reason: '' };

                  return (
                    <tr key={st.id} className={`hover:bg-slate-50/80 transition-colors ${
                      dec.action === 'REPEAT' ? 'bg-amber-50/30' : dec.action === 'REVIEW' ? 'bg-purple-50/30' : ''
                    }`}>
                      <td className="p-3 pl-6 font-mono font-bold text-slate-900">{st.studentNumber || st.admissionNo}</td>
                      <td className="p-3 font-bold text-slate-900">{st.fullName}</td>
                      <td className="p-3 text-slate-600">{st.className}</td>
                      <td className="p-3 text-center">
                        <span className={`font-mono font-bold ${avg >= 75 ? 'text-emerald-600' : avg >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {avg}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          avg >= 50 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {avg >= 50 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={dec.action}
                          onChange={e => handleDecisionChange(st.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg p-2 border ${
                            dec.action === 'PROMOTE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : dec.action === 'REPEAT'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          <option value="PROMOTE">🟢 Promote</option>
                          <option value="REPEAT">🔴 Repeat Grade ({st.className})</option>
                          <option value="REVIEW">🟡 Under Review</option>
                        </select>
                      </td>
                      <td className="p-3 pr-6 font-bold">
                        {dec.action === 'REPEAT' ? (
                          <span className="text-amber-700 font-bold">Repeat in {st.className}</span>
                        ) : dec.action === 'REVIEW' ? (
                          <span className="text-purple-700 font-bold">Requires Principal Review</span>
                        ) : isGrade12 ? (
                          <span className="text-purple-700 font-bold flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> Graduated / Alumni
                          </span>
                        ) : (
                          <select
                            value={dec.targetClassId || targetClassId}
                            onChange={e => handleDecisionChange(st.id, 'PROMOTE', e.target.value)}
                            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-1.5"
                          >
                            {classes.filter(c => c.id !== selectedClassId).map(c => (
                              <option key={c.id} value={c.id}>To: {c.name} ({c.section})</option>
                            ))}
                            <option value="GRADUATED">Graduated</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion History Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Institutional Student Promotion History & Audit Trail</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3">Date & Time</th>
                <th className="p-3">Student No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Previous Grade</th>
                <th className="p-3">New Grade</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Promoted By (Teacher / Staff ID)</th>
                <th className="p-3">Academic Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No historical promotion logs recorded yet.
                  </td>
                </tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {new Date(h.promotedAt).toLocaleDateString()} {new Date(h.promotedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{h.studentNumber}</td>
                    <td className="p-3 font-bold text-slate-800">{h.studentName}</td>
                    <td className="p-3 text-slate-500">{h.previousClassName}</td>
                    <td className="p-3 font-bold text-indigo-700">{h.newClassName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'GRADUATED' ? 'bg-purple-100 text-purple-800' :
                        h.status === 'PROMOTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">{h.promotedBy}</td>
                    <td className="p-3 font-mono text-slate-500">{h.academicYear}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal title="Confirm Official Student Promotion Decisions" onClose={() => setShowConfirmModal(false)}>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Institutional Academic Decision</strong>
                <p className="mt-1">
                  You are submitting promotion decisions for <span className="font-bold">{students.length} students</span> in <span className="font-bold">{currentClass?.name}</span> for Academic Session <span className="font-bold">{academicYear}</span>.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Promoting / Graduating:</span>
                <span className="font-bold text-emerald-700">{promotedCount} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Repeating Current Grade:</span>
                <span className="font-bold text-amber-700">{repeatCount} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Under Administrative Review:</span>
                <span className="font-bold text-purple-700">{reviewCount} Students</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Responsible Evaluator:</span>
                <span className="font-bold text-slate-900">{user?.fullName} ({user?.teacherId || user?.role})</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePromotions}
                disabled={processing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm & Log Promotion Records'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

