import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Teacher } from '../types';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Plus, Mail, Phone, BookOpen } from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+220 ',
    qualification: 'M.Sc Physics & B.Ed',
    specialization: 'Mathematics & Science',
    gender: 'FEMALE' as 'MALE' | 'FEMALE'
  });

  const loadTeachers = () => {
    setLoading(true);
    api.getTeachers()
      .then(res => setTeachers(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTeacher(formData);
      setShowAddModal(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '+220 ',
        qualification: 'M.Sc Physics & B.Ed',
        specialization: 'Mathematics & Science',
        gender: 'FEMALE'
      });
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to create teacher');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Teacher Name & ID',
      accessor: (t: Teacher) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
            {t.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{t.fullName}</div>
            <div className="text-[10px] text-slate-400 font-mono">{t.teacherCode} &bull; {t.qualification}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Specialization',
      accessor: (t: Teacher) => (
        <span className="font-semibold text-slate-800">{t.specialization}</span>
      )
    },
    {
      header: 'Assigned Classes',
      accessor: (t: Teacher) => (
        <div className="flex flex-wrap gap-1">
          {t.assignedClassNames && t.assignedClassNames.length > 0 ? (
            t.assignedClassNames.map((name, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-[10px] rounded-md border border-indigo-200">
                {name}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic font-medium">Grade 10 Science A</span>
          )}
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (t: Teacher) => (
        <div>
          <div className="text-xs text-slate-800 flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-600" /> {t.phone}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500" /> {t.email}</div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Teachers & Academic Staff</h2>
          <p className="text-xs text-slate-500">Manage teaching staff qualifications, specializations, and class assignments.</p>
        </div>

        {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Teacher
          </button>
        )}
      </div>

      <Table
        data={filteredTeachers}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search teacher name, specialization, or email..."
        onSearchChange={setSearch}
        searchValue={search}
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Teacher"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Fatou Jammeh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="teacher@gia.edu.gm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="+220 3123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="e.g. M.Sc Physics & B.Ed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="e.g. Mathematics & Science"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
            >
              Register Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
