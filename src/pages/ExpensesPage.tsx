import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Expense } from '../types';
import { Receipt, Plus, DollarSign, Tag, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'SUPPLIES' as any,
    amount: 5000,
    paymentMethod: 'CASH',
    vendor: 'Banjul Stationers Ltd',
    notes: 'Exam paper reams and toner cartridges'
  });

  const loadExpenses = () => {
    api.getExpenses().then(res => setExpenses(res));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createExpense(form);
    setShowAddModal(false);
    setForm({
      title: '',
      category: 'SUPPLIES',
      amount: 5000,
      paymentMethod: 'CASH',
      vendor: 'Banjul Stationers Ltd',
      notes: ''
    });
    loadExpenses();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">School Expenses & Operating Outflow</h2>
          <p className="text-xs text-slate-500">Log staff salaries, utilities, maintenance, and educational supply purchases.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Log New Expense
        </button>
      </div>

      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs max-w-sm">
        <div className="text-xs font-bold text-slate-400 uppercase">Total Outflow Disbursed</div>
        <div className="text-2xl font-black text-rose-600 mt-1">GMD {totalExpenses.toLocaleString()}</div>
        <div className="text-[10px] text-slate-500 mt-1">Total operating expenditure</div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Ledger</h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {expenses.map(e => (
            <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
              <div>
                <div className="font-bold text-slate-900">{e.title}</div>
                <div className="text-[10px] text-slate-500">{e.category} &bull; Vendor: {e.vendor} &bull; Approved by {e.approvedBy}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-rose-600 font-mono">-GMD {e.amount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">{e.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Operating Expense">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. Science Lab Chemical Reagents"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="SALARIES">Salaries</option>
                <option value="ELECTRICITY">Electricity / Water</option>
                <option value="INTERNET">Internet & IT</option>
                <option value="SUPPLIES">Supplies & Stationery</option>
                <option value="MAINTENANCE">Maintenance & Repairs</option>
                <option value="RENT">Rent & Property</option>
                <option value="OTHER">Other Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (GMD) *</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
            <input
              type="text"
              value={form.vendor}
              onChange={e => setForm({ ...form, vendor: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. NAWEC / EcoBank"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Log Expense Entry
          </button>
        </form>
      </Modal>
    </div>
  );
};
