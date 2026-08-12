import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FeeStructure, Payment, Student, ClassRoom } from '../types';
import { Wallet, Plus, Receipt, Printer, CheckCircle2, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ReceiptView } from '../components/ReceiptView';
import { useAuth } from '../context/AuthContext';

export const FeesPaymentsPage: React.FC = () => {
  const { user, school } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    feeStructureId: '',
    amountPaid: 15000,
    paymentMethod: 'CASH' as any,
    referenceNo: 'REF-CASH-101',
    notes: 'Paid at bursar counter'
  });

  const loadData = () => {
    Promise.all([
      api.getFees(),
      api.getPayments(),
      api.getStudents(),
      api.getClasses()
    ]).then(([fRes, pRes, stRes, clRes]) => {
      setFees(fRes);
      setPayments(pRes);
      setStudents(stRes);
      setClasses(clRes);

      if (stRes.length > 0 && !paymentForm.studentId) {
        setPaymentForm(prev => ({ ...prev, studentId: stRes[0].id }));
      }
      if (fRes.length > 0 && !paymentForm.feeStructureId) {
        setPaymentForm(prev => ({ ...prev, feeStructureId: fRes[0].id }));
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPay = await api.recordPayment(paymentForm);
      setShowPaymentModal(false);
      setSelectedReceiptPayment(newPay);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">School Fees & Payment Bursary</h2>
          <p className="text-xs text-slate-500">Track fee structures, record payments, manage balances, and generate receipts.</p>
        </div>

        {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'ACCOUNTANT' || role === 'RECEPTIONIST') && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Record Payment & Issue Receipt
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue Collected</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">GMD {totalCollected.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Cleared bursary accounts</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Receipts Issued</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{payments.length} Receipts</div>
          <div className="text-[10px] text-slate-500 mt-1">Digital payment audit logs</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Standard Term Tuition</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">GMD 21,000</div>
          <div className="text-[10px] text-slate-500 mt-1">Grade 10 Senior Secondary</div>
        </div>
      </div>

      {/* Payments Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fee Payments Ledger
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {payments.length} Payments Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="p-3">Receipt #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Fee Title</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-blue-600">{p.receiptNo}</td>
                  <td className="p-3 font-bold text-slate-900">{p.studentName}</td>
                  <td className="p-3 text-slate-700">{p.feeTitle}</td>
                  <td className="p-3 text-slate-600">{p.paymentMethod}</td>
                  <td className="p-3 text-slate-500">{p.paymentDate}</td>
                  <td className="p-3 text-right font-black text-emerald-600 font-mono">
                    GMD {p.amountPaid.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Fee Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              value={paymentForm.studentId}
              onChange={e => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              {students.map(st => (
                <option key={st.id} value={st.id}>{st.fullName} ({st.admissionNo})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fee Item *</label>
            <select
              value={paymentForm.feeStructureId}
              onChange={e => setPaymentForm({ ...paymentForm, feeStructureId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              {fees.map(f => (
                <option key={f.id} value={f.id}>{f.title} (GMD {f.amount})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (GMD) *</label>
              <input
                type="number"
                required
                value={paymentForm.amountPaid}
                onChange={e => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money (Africell/Wave/QMoney)</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Ref / Cheque #</label>
            <input
              type="text"
              value={paymentForm.referenceNo}
              onChange={e => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              placeholder="e.g. TRF-GTB-90214"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
            Generate Official Receipt
          </button>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      {selectedReceiptPayment && (
        <Modal
          isOpen={!!selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
          title="Printable Official Receipt"
        >
          <ReceiptView payment={selectedReceiptPayment} school={school || ({} as any)} />
        </Modal>
      )}
    </div>
  );
};
