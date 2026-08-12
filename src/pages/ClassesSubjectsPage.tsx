import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClassRoom, Subject } from '../types';
import { BookOpen, Plus, Users, Award, Layers } from 'lucide-react';
import { Modal } from '../components/Modal';

export const ClassesSubjectsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const [classForm, setClassForm] = useState({ name: '', section: 'Section A', capacity: 35 });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', maxMarks: 100, passMarks: 50 });

  const loadData = () => {
    Promise.all([api.getClasses(), api.getSubjects()])
      .then(([clRes, subRes]) => {
        setClasses(clRes);
        setSubjects(subRes);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createClass(classForm);
    setShowAddClassModal(false);
    setClassForm({ name: '', section: 'Section A', capacity: 35 });
    loadData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSubject(subjectForm);
    setShowAddSubjectModal(false);
    setSubjectForm({ name: '', code: '', maxMarks: 100, passMarks: 50 });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Classes & Academic Subjects</h2>
          <p className="text-xs text-slate-500">Configure grade levels, class sections, and curriculum subjects.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Class Rooms ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subjects' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Subjects ({subjects.length})
          </button>
        </div>
      </div>

      {activeTab === 'classes' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Class Rooms</h3>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Class Room
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-slate-900">{c.name}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-200">
                    {c.section}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Class Teacher: <span className="font-semibold text-slate-800">{c.classTeacherName || 'Fatou Jammeh'}</span></p>
                  <p>Student Capacity: <span className="font-semibold text-slate-800">{c.capacity} Students</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Curriculum Subjects</h3>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{s.name}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                    {s.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1 mt-2 pt-2 border-t border-slate-100">
                  <p>Max Score: <span className="font-bold text-slate-900">{s.maxMarks}</span> &bull; Pass Score: <span className="font-bold text-emerald-600">{s.passMarks}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Class */}
      <Modal isOpen={showAddClassModal} onClose={() => setShowAddClassModal(false)} title="Add Class Room">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              value={classForm.name}
              onChange={e => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Grade 10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
            <input
              type="text"
              value={classForm.section}
              onChange={e => setClassForm({ ...classForm, section: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Science A"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Create Class
          </button>
        </form>
      </Modal>

      {/* Modal Add Subject */}
      <Modal isOpen={showAddSubjectModal} onClose={() => setShowAddSubjectModal(false)} title="Add Curriculum Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectForm.name}
              onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Further Mathematics"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
            <input
              type="text"
              value={subjectForm.code}
              onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. FMATH201"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Create Subject
          </button>
        </form>
      </Modal>
    </div>
  );
};
