import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OnlineApplication, ClassRoom } from '../types';
import { FileText, CheckCircle2, UserPlus, Clock, XCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<OnlineApplication[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showNewAppModal, setShowNewAppModal] = useState(false);

  const [publicForm, setPublicForm] = useState({
    studentFirstName: 'Modou',
    studentLastName: 'Jatta',
    dateOfBirth: '2011-03-10',
    gender: 'MALE' as any,
    requestedClassId: '',
    parentName: 'Ebrima Jatta',
    parentEmail: 'ebrima.jatta@gmail.com',
    parentPhone: '+220 7901122',
    previousSchool: 'Marina International Lower Basic'
  });

  const loadData = () => {
    Promise.all([
      api.getApplications(),
      api.getClasses()
    ]).then(([appRes, clRes]) => {
      setApplications(appRes);
      setClasses(clRes);
      if (clRes.length > 0 && !publicForm.requestedClassId) {
        setPublicForm(prev => ({ ...prev, requestedClassId: clRes[0].id }));
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await api.updateApplicationStatus(id, status);
    alert(status === 'ENROLLED' ? 'Application approved! Student officially enrolled into directory.' : `Status updated to ${status}`);
    loadData();
  };

  const handleSubmitPublicApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === publicForm.requestedClassId);
    await api.submitPublicApplication({
      ...publicForm,
      requestedClassName: cls ? `${cls.name} (${cls.section})` : 'Grade 7'
    });
    setShowNewAppModal(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Online Admissions Portal</h2>
          <p className="text-xs text-slate-500">Review prospective student applications and convert approved applicants to active students.</p>
        </div>

        <button
          onClick={() => setShowNewAppModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Submit Application
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admissions Review Queue</h3>
          <span className="text-xs font-bold text-slate-400">{applications.length} Applications</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {applications.map(app => (
            <div key={app.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{app.studentFirstName} {app.studentLastName}</span>
                  <span className="font-mono text-[10px] text-slate-400">({app.applicationNo})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    app.status === 'ENROLLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    app.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Requested: <span className="font-semibold text-slate-800">{app.requestedClassName}</span> &bull; Parent: {app.parentName} ({app.parentPhone}) &bull; DOB: {app.dateOfBirth}
                </div>
              </div>

              {app.status !== 'ENROLLED' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'ENROLLED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Enroll Student
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold rounded-lg text-xs"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showNewAppModal} onClose={() => setShowNewAppModal(false)} title="Submit Admission Application">
        <form onSubmit={handleSubmitPublicApplication} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student First Name *</label>
              <input
                type="text"
                required
                value={publicForm.studentFirstName}
                onChange={e => setPublicForm({ ...publicForm, studentFirstName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Last Name *</label>
              <input
                type="text"
                required
                value={publicForm.studentLastName}
                onChange={e => setPublicForm({ ...publicForm, studentLastName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Requested Grade/Class *</label>
              <select
                value={publicForm.requestedClassId}
                onChange={e => setPublicForm({ ...publicForm, requestedClassId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={publicForm.dateOfBirth}
                onChange={e => setPublicForm({ ...publicForm, dateOfBirth: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Full Name *</label>
              <input
                type="text"
                required
                value={publicForm.parentName}
                onChange={e => setPublicForm({ ...publicForm, parentName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone *</label>
              <input
                type="text"
                required
                value={publicForm.parentPhone}
                onChange={e => setPublicForm({ ...publicForm, parentPhone: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Submit Online Admission Form
          </button>
        </form>
      </Modal>
    </div>
  );
};
