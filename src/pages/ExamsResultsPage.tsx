import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exam, ResultMark, ClassRoom, Subject, Student } from '../types';
import { Award, Plus, CheckCircle2, FileText, Save, Eye, Upload, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ReportCardView } from '../components/ReportCardView';
import { useAuth } from '../context/AuthContext';

export const ExamsResultsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'SCHOOL_ADMIN';

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultMark[]>([]);

  // Selected filters
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Modals
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [reportCardModalStudent, setReportCardModalStudent] = useState<any>(null);

  const handleProcessCsvText = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const parsed: any[] = [];

    // Skip header line if present
    const startIndex = lines[0].toLowerCase().includes('student') || lines[0].toLowerCase().includes('ca') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 3) {
        const stdNo = cols[0];
        const student = students.find(s => s.studentNumber === stdNo || s.admissionNo === stdNo || s.fullName.toLowerCase().includes(stdNo.toLowerCase()));
        const caScore = Math.min(30, Math.max(0, Number(cols[1] || cols[2]) || 0));
        const examScore = Math.min(70, Math.max(0, Number(cols[2] || cols[3]) || 0));

        parsed.push({
          studentNumber: stdNo,
          studentName: student ? student.fullName : cols[1] || 'Unknown Student',
          matchedStudentId: student?.id,
          caScore,
          examScore,
          isValid: !!student,
          validationMsg: student ? 'Valid' : 'Student Number not found in current class'
        });
      }
    }
    setCsvPreview(parsed);
  };

  const handleApplyCsvMarks = async () => {
    let appliedCount = 0;
    for (const row of csvPreview) {
      if (row.matchedStudentId) {
        handleScoreChange(row.matchedStudentId, 'ca', row.caScore);
        handleScoreChange(row.matchedStudentId, 'exam', row.examScore);
        appliedCount++;
      }
    }
    alert(`Applied ${appliedCount} marks to the current sheet! Remember to click Save.`);
    setShowCsvModal(false);
    setCsvPreview([]);
  };

  // Mark entry form map: studentId -> { ca, exam }
  const [scoresMap, setScoresMap] = useState<Record<string, { ca: number; exam: number }>>({});

  const [examForm, setExamForm] = useState({
    name: 'Term 1 Mid-Term Examination',
    type: 'CONTINUOUS_ASSESSMENT' as any,
    classId: '',
    startDate: '2026-08-20',
    endDate: '2026-08-28'
  });

  useEffect(() => {
    Promise.all([
      api.getExams(),
      api.getClasses(),
      api.getSubjects()
    ]).then(([exRes, clRes, subRes]) => {
      setExams(exRes);
      setClasses(clRes);
      setSubjects(subRes);
      if (exRes.length > 0) setSelectedExamId(exRes[0].id);
      if (clRes.length > 0) {
        setSelectedClassId(clRes[0].id);
        setExamForm(prev => ({ ...prev, classId: clRes[0].id }));
      }
      if (subRes.length > 0) setSelectedSubjectId(subRes[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      api.getStudents({ classId: selectedClassId }).then(stRes => {
        setStudents(stRes);
        if (selectedExamId && selectedSubjectId) {
          api.getResults({ classId: selectedClassId, examId: selectedExamId, subjectId: selectedSubjectId }).then(resRes => {
            setResults(resRes);
            const map: Record<string, { ca: number; exam: number }> = {};
            stRes.forEach(st => {
              const match = resRes.find(r => r.studentId === st.id);
              map[st.id] = {
                ca: match ? match.caScore : 25,
                exam: match ? match.examScore : 60
              };
            });
            setScoresMap(map);
          });
        }
      });
    }
  }, [selectedClassId, selectedExamId, selectedSubjectId]);

  const handleScoreChange = (studentId: string, field: 'ca' | 'exam', val: number) => {
    setScoresMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Math.max(0, val)
      }
    }));
  };

  const handleSaveMarks = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const subject = subjects.find(s => s.id === selectedSubjectId);
    const scores = scoresMap[studentId] || { ca: 25, exam: 60 };

    try {
      await api.saveResultMark({
        examId: selectedExamId || 'EXM-002',
        studentId,
        studentName: student?.fullName || 'Student',
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        subjectName: subject?.name || 'Mathematics',
        caScore: scores.ca,
        examScore: scores.exam
      });
      alert(`Score saved for ${student?.fullName}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to save score');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === examForm.classId);
    await api.createExam({
      ...examForm,
      className: cls ? `${cls.name} (${cls.section})` : 'Grade 10'
    });
    setShowAddExamModal(false);
    const ex = await api.getExams();
    setExams(ex);
  };

  const handleApproveResults = async () => {
    await api.approveResults(selectedClassId, selectedExamId);
    alert('Results for this examination have been officially finalized and approved!');
  };

  const handleViewReportCard = async (studentId: string) => {
    const reportData = await api.getReportCard(studentId);
    setReportCardModalStudent(reportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Examinations & Mark Entries</h2>
          <p className="text-xs text-slate-500">Manage exam schedules, enter student marks, approve results, and generate report cards.</p>
        </div>

        {(role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN' || role === 'PRINCIPAL' || role === 'TEACHER') && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCsvModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Upload CSV Marks
            </button>
            <button
              onClick={() => setShowAddExamModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Schedule Exam
            </button>
            <button
              onClick={handleApproveResults}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> Finalize & Approve Class Results
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Examination</label>
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.className})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mark Entry Table Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Student Marks Entry Sheet
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            C.A. Score (Max 30) &bull; Exam Score (Max 70) = Total 100
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="p-3">Student #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">C.A. (Max 30)</th>
                <th className="p-3 text-center">Exam (Max 70)</th>
                <th className="p-3 text-center">Total Score</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(st => {
                const sc = scoresMap[st.id] || { ca: 25, exam: 60 };
                const total = (Number(sc.ca) || 0) + (Number(sc.exam) || 0);
                const grade = total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F';

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{st.studentNumber || st.admissionNo}</td>
                    <td className="p-3 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        max={30}
                        min={0}
                        value={sc.ca}
                        onChange={e => handleScoreChange(st.id, 'ca', Number(e.target.value))}
                        className="w-16 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-1"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        max={70}
                        min={0}
                        value={sc.exam}
                        onChange={e => handleScoreChange(st.id, 'exam', Number(e.target.value))}
                        className="w-16 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-1"
                      />
                    </td>
                    <td className="p-3 text-center font-black text-blue-900">{total} / 100</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                        grade === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {grade}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleSaveMarks(st.id)}
                        className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        title="Save Score"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => handleViewReportCard(st.id)}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        title="View Official Report Card"
                      >
                        <FileText className="w-3.5 h-3.5" /> Report Card
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Exam */}
      <Modal isOpen={showAddExamModal} onClose={() => setShowAddExamModal(false)} title="Schedule New Examination">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Exam Name *</label>
            <input
              type="text"
              required
              value={examForm.name}
              onChange={e => setExamForm({ ...examForm, name: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Class</label>
            <select
              value={examForm.classId}
              onChange={e => setExamForm({ ...examForm, classId: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Create Exam Schedule
          </button>
        </form>
      </Modal>

      {/* CSV Upload Modal */}
      <Modal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} title="Upload Marks via CSV Spreadsheet" maxWidth="2xl">
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-xs text-indigo-900">
            <h4 className="font-bold flex items-center gap-1.5 mb-1 text-indigo-950">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Expected CSV Format
            </h4>
            <p>Paste or upload raw CSV data in the following layout:</p>
            <code className="block bg-white p-2 rounded border border-indigo-200 mt-2 font-mono text-[11px] text-slate-800">
              Student Number, CA Score (0-30), Exam Score (0-70)<br />
              STU-2026-0001, 28, 62<br />
              STU-2026-0002, 25, 58
            </code>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Paste CSV Contents or Upload File</label>
            <textarea
              rows={5}
              placeholder="Paste raw CSV lines here..."
              onChange={e => handleProcessCsvText(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {csvPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Validation Preview ({csvPreview.length} Rows)</span>
                <span className="text-[10px] font-bold text-emerald-700">
                  {csvPreview.filter(r => r.isValid).length} Valid Row(s)
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-2 pl-3">Student #</th>
                      <th className="p-2">Name</th>
                      <th className="p-2 text-center">CA (30)</th>
                      <th className="p-2 text-center">Exam (70)</th>
                      <th className="p-2 pr-3">Validation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {csvPreview.map((r, i) => (
                      <tr key={i} className={r.isValid ? 'bg-white' : 'bg-rose-50/50'}>
                        <td className="p-2 pl-3 font-mono font-bold text-slate-900">{r.studentNumber}</td>
                        <td className="p-2 text-slate-800">{r.studentName}</td>
                        <td className="p-2 text-center font-mono font-bold">{r.caScore}</td>
                        <td className="p-2 text-center font-mono font-bold">{r.examScore}</td>
                        <td className="p-2 pr-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.validationMsg}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCsvModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCsvMarks}
              disabled={csvPreview.filter(r => r.isValid).length === 0}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs disabled:opacity-50"
            >
              Apply Valid Marks
            </button>
          </div>
        </div>
      </Modal>

      {/* Official Report Card View Modal */}
      {reportCardModalStudent && (
        <Modal
          isOpen={!!reportCardModalStudent}
          onClose={() => setReportCardModalStudent(null)}
          title="Printable Academic Report Card"
          maxWidth="4xl"
        >
          <ReportCardView report={reportCardModalStudent} />
        </Modal>
      )}
    </div>
  );
};
