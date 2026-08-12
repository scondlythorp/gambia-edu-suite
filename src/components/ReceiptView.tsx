import React from 'react';
import { Payment, School } from '../types';
import { Printer, CheckCircle2, Building2 } from 'lucide-react';

interface ReceiptViewProps {
  payment: Payment;
  school: School;
  onClose?: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ payment, school }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 max-w-lg mx-auto font-sans print:shadow-none print:border-none print:p-0">
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
        <h3 className="text-sm font-bold text-slate-900">Official Payment Receipt</h3>
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Receipt
        </button>
      </div>

      {/* Receipt Header */}
      <div className="text-center pb-6 border-b border-dashed border-slate-300">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden shrink-0">
            {school.logo ? (
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-900 uppercase">{school.name}</h2>
            <p className="text-[10px] text-slate-500">{school.address} &bull; {school.phone}</p>
          </div>
        </div>

        <div className="mt-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
            OFFICIAL FEE RECEIPT
          </span>
        </div>
      </div>

      {/* Details Table */}
      <div className="my-6 space-y-3 text-xs">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Receipt No:</span>
          <span className="font-mono font-bold text-slate-900">{payment.receiptNo}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Date Paid:</span>
          <span className="font-semibold text-slate-800">{payment.paymentDate}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Student Name:</span>
          <span className="font-bold text-slate-900">{payment.studentName}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Admission No:</span>
          <span className="font-mono text-slate-800">{payment.admissionNo}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Fee Description:</span>
          <span className="font-semibold text-slate-800">{payment.feeTitle}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Payment Method:</span>
          <span className="font-semibold text-slate-800">{payment.paymentMethod.replace('_', ' ')}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">Transaction Ref:</span>
          <span className="font-mono text-slate-700">{payment.referenceNo}</span>
        </div>

        {/* Highlighted Amount */}
        <div className="mt-4 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Amount Received</div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Fully Credited
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            GMD {payment.amountPaid.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Signature & Cashier Info */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>Issued By: </span>
          <span className="font-semibold text-slate-800">{payment.receivedBy}</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          EduManage Verified
        </div>
      </div>
    </div>
  );
};
