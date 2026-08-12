import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, ClassRoom, Parent } from '../types';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, User, Eye, Edit, Archive, Printer, CheckCircle2, Search } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dateOfBirth: '2010-05-15',
    address: 'Banjul, The Gambia',
    nationality: 'Gambian',
    classId: '',
    parentId: ''
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getStudents({ search, classId: selectedClass }),
      api.getClasses(),
      api.getParents()
    ]).then(([stRes, clRes, parRes]) => {
      setStudents(stRes);
      setClasses(clRes);
      setParents(parRes);
      if (clRes.length > 0 && !formData.classId) {
        setFormData(prev => ({ ...prev, classId: clRes[0].id }));
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search, selectedClass]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cls = classes.find(c => c.id === formData.classId);
      const par = parents.find(p => p.id === formData.parentId) || parents[0];

      await api.createStudent({
        ...formData,
        className: cls ? `${cls.name} (${cls.section})` : 'Grade 10 Science A',
        section: cls?.section || 'A',
        parentId: par?.id || 'PAR-001',
        parentName: par?.fullName || 'Alhagie Touray',
        parentPhone: par?.phone || '+220 7712345'
      });

      setShowAddModal(false);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: 'MALE',
        dateOfBirth: '2010-05-15',
        address: 'Banjul, The Gambia',
        nationality: 'Gambian',
        classId: classes[0]?.id || '',
        parentId: parents[0]?.id || ''
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create student');
    }
  };

  const handleArchiveStudent = async (id: string) => {
    if (confirm('Are you sure you want to archive/withdraw this student record?')) {
      await api.archiveStudent(id);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Student # & Name',
      accessor: (st: Student) => (
        <div className="flex items-center gap-3">
          <img
            src={st.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={st.fullName}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-bold text-slate-900">{st.fullName}</div>
            <div className="text-[10px] text-slate-500 font-mono font-bold">
              ID: {st.studentNumber || st.admissionNo} &bull; <span className="text-slate-400">{st.gender}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Class & Section',
      accessor: (st: Student) => (
        <span className="font-semibold text-slate-800">{st.className}</span>
      )
    },
    {
      header: 'Parent / Guardian',
      accessor: (st: Student) => (
        <div>
          <div className="font-medium text-slate-800">{st.parentName}</div>
          <div className="text-[10px] text-slate-400">{st.parentPhone}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (st: Student) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          st.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {st.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory</h2>
          <p className="text-xs text-slate-500">Manage student admissions, profiles, and academic class assignments.</p>
        </div>

        {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'RECEPTIONIST') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Admit New Student
          </button>
        )}
      </div>

      {/* Class Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Filter Class:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        data={students}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search student name or admission number..."
        onSearchChange={setSearch}
        searchValue={search}
        actions={(st) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setSelectedStudent(st)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Profile ID Card"
            >
              <Eye className="w-4 h-4" />
            </button>
            {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN') && (
              <button
                onClick={() => handleArchiveStudent(st.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Archive Student"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Admit New Student"
        subtitle="Register a new student record into the school database"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Lamin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Kebba"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Touray"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Class *</label>
              <select
                required
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Link Parent / Guardian</label>
              <select
                value={formData.parentId}
                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-xs"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Card Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Student Profile Card"
        >
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
            <img
              src={selectedStudent.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={selectedStudent.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 mx-auto shadow-md"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selectedStudent.fullName}</h3>
              <p className="text-xs text-blue-600 font-mono font-bold">{selectedStudent.admissionNo}</p>
            </div>

            <div className="text-xs text-left bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Class:</span> <span className="font-bold text-slate-800">{selectedStudent.className}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Gender:</span> <span className="font-semibold text-slate-800">{selectedStudent.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Date of Birth:</span> <span className="font-semibold text-slate-800">{selectedStudent.dateOfBirth}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Parent/Guardian:</span> <span className="font-semibold text-slate-800">{selectedStudent.parentName} ({selectedStudent.parentPhone})</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Admission Date:</span> <span className="font-semibold text-slate-800">{selectedStudent.admissionDate}</span></div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print Student ID Badge
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
