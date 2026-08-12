import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Parent } from '../types';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Plus, Phone, Mail, MapPin } from 'lucide-react';

export const ParentsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+220 ',
    email: '',
    address: 'Banjul, The Gambia',
    occupation: 'Business Executive',
    relationship: 'Father'
  });

  const loadParents = () => {
    setLoading(true);
    api.getParents()
      .then(res => setParents(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParents();
  }, []);

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createParent(formData);
      setShowAddModal(false);
      setFormData({
        fullName: '',
        phone: '+220 ',
        email: '',
        address: 'Banjul, The Gambia',
        occupation: 'Business Executive',
        relationship: 'Father'
      });
      loadParents();
    } catch (err: any) {
      alert(err.message || 'Failed to create parent');
    }
  };

  const filteredParents = parents.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Parent Full Name',
      accessor: (p: Parent) => (
        <div>
          <div className="font-bold text-slate-900">{p.fullName}</div>
          <div className="text-[10px] text-slate-400">{p.relationship} &bull; {p.occupation}</div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: (p: Parent) => (
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-600" /> {p.phone}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Mail className="w-3 h-3 text-blue-500" /> {p.email}
          </div>
        </div>
      )
    },
    {
      header: 'Linked Children',
      accessor: (p: Parent) => (
        <div className="flex flex-wrap gap-1">
          {p.childrenNames && p.childrenNames.length > 0 ? (
            p.childrenNames.map((name, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-[10px] rounded-md border border-indigo-200">
                {name}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No linked child</span>
          )}
        </div>
      )
    },
    {
      header: 'Address',
      accessor: (p: Parent) => (
        <span className="text-slate-600 truncate max-w-[150px] block">{p.address}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Parents & Guardians Directory</h2>
          <p className="text-xs text-slate-500">Contact list of registered parents linked to active students.</p>
        </div>

        {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'RECEPTIONIST') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Parent Record
          </button>
        )}
      </div>

      <Table
        data={filteredParents}
        columns={columns}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Search parent name, phone number, or email..."
        onSearchChange={setSearch}
        searchValue={search}
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Parent / Guardian Record"
      >
        <form onSubmit={handleCreateParent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Alhagie Touray"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="+220 7712345"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="parent@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
              <select
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Legal Guardian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                placeholder="e.g. Accountant / Merchant"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Kairaba Avenue, Fajara"
            />
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
              Save Parent Info
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
