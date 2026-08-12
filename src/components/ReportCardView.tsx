import React from 'react';
import { StudentReportCard } from '../types';
import { Printer, Download, Award, CheckCircle2, School } from 'lucide-react';

interface ReportCardViewProps {
  report: StudentReportCard;
  onClose?: () => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({ report }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
      {/* Header Bar Actions */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Official Student Academic Report Card</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report Card
          </button>
        </div>
      </div>

      {/* School Header */}
      <div className="text-center pb-6 border-b-2 border-slate-900">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden shrink-0">
            {report.school.logo ? (
              <img src={report.school.logo} alt={report.school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-10 h-10" />
            )}
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{report.school.name}</h1>
            <p className="text-xs font-semibold text-slate-600 italic">{report.school.motto}</p>
            <p className="text-xs text-slate-500 mt-0.5">{report.school.address} &bull; Phone: {report.school.phone} &bull; {report.school.email}</p>
          </div>
        </div>
        <div className="mt-4 bg-slate-100 py-1.5 px-4 rounded-lg inline-block border border-slate-300">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            ACADEMIC PERFORMANCE REPORT CARD &bull; {report.academicYear} ({report.term})
          </span>
        </div>
      </div>

      {/* Student Profile Info Grid */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 col-span-2">
          <img
            src={report.student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={report.student.fullName}
            className="w-14 h-14 rounded-lg object-cover border-2 border-blue-600 shadow-xs"
          />
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Student Name</div>
            <div className="text-sm font-bold text-slate-900">{report.student.fullName}</div>
            <div className="text-xs text-slate-500 font-mono">Admission No: {report.student.admissionNo}</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase text-slate-400">Class & Section</div>
          <div className="text-xs font-bold text-slate-900">{report.classRoom.name} ({report.classRoom.section})</div>
          <div className="text-[11px] text-slate-500">Gender: {report.student.gender}</div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase text-slate-400">Overall Rank & Average</div>
          <div className="text-xs font-bold text-blue-700">
            Position: <span className="text-sm">{report.position}</span> / {report.totalStudentsInClass}
          </div>
          <div className="text-[11px] font-bold text-slate-700">Average: {report.averageScore}%</div>
        </div>
      </div>

      {/* Subject Performance Breakdown Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Subject Performance Breakdown</h3>
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase">
              <th className="p-2.5 border border-slate-700">Subject Name</th>
              <th className="p-2.5 border border-slate-700 text-center">C.A. (30%)</th>
              <th className="p-2.5 border border-slate-700 text-center">Exam (70%)</th>
              <th className="p-2.5 border border-slate-700 text-center">Total (100%)</th>
              <th className="p-2.5 border border-slate-700 text-center">Grade</th>
              <th className="p-2.5 border border-slate-700">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {report.results.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50">
                <td className="p-2.5 border border-slate-200 font-semibold text-slate-900">{res.subjectName}</td>
                <td className="p-2.5 border border-slate-200 text-center font-mono">{res.caScore}</td>
                <td className="p-2.5 border border-slate-200 text-center font-mono">{res.examScore}</td>
                <td className="p-2.5 border border-slate-200 text-center font-bold text-blue-900">{res.totalScore}</td>
                <td className="p-2.5 border border-slate-200 text-center font-bold">
                  <span className={`px-2 py-0.5 rounded-sm ${
                    res.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                    res.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                    res.grade === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {res.grade}
                  </span>
                </td>
                <td className="p-2.5 border border-slate-200 text-slate-600 italic">{res.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Metrics & Comments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Attendance & Grading Key */}
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Attendance Record</h4>
            <p className="text-xs text-slate-800 font-semibold">
              Days Present: <span className="text-blue-600">{report.attendancePresent}</span> / {report.attendanceTotal} days ({Math.round((report.attendancePresent / report.attendanceTotal) * 100)}% attendance rate)
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 leading-normal">
            <span className="font-bold text-slate-800 uppercase block mb-0.5">Grading Scale System</span>
            80-100%: A (Excellent) &bull; 70-79%: B (Very Good) &bull; 60-69%: C (Good) &bull; 50-59%: D (Pass) &bull; 0-49%: F (Fail)
          </div>
        </div>

        {/* Teacher & Principal Remarks */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <h4 className="text-[11px] font-bold text-blue-900 uppercase">Class Teacher Comment</h4>
            <p className="text-xs text-slate-700 italic mt-0.5">&ldquo;{report.teacherComment}&rdquo;</p>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <h4 className="text-[11px] font-bold text-emerald-900 uppercase">Principal Recommendation</h4>
            <p className="text-xs text-slate-700 italic mt-0.5">&ldquo;{report.principalComment}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Official Signatures */}
      <div className="mt-10 pt-6 border-t border-slate-300 flex items-end justify-between text-xs">
        <div className="text-center">
          <div className="w-40 border-b border-slate-400 mb-1"></div>
          <span className="font-semibold text-slate-600">Class Teacher Signature</span>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-700 font-bold text-[10px] uppercase rotate-12 mx-auto mb-1">
            SEAL & APPROVED
          </div>
          <span className="font-bold text-slate-900">{report.school.principalName}</span>
          <div className="text-[10px] text-slate-500">Principal</div>
        </div>
      </div>
    </div>
  );
};
