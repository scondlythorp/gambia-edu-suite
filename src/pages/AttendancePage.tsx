import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, ClassRoom, AttendanceRecord, AttendanceStatus } from '../types';
import { CalendarCheck, Save, Check, X, Clock, AlertCircle } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.getClasses().then(res => {
      setClasses(res);
      if (res.length > 0) setSelectedClassId(res[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      api.getStudents({ classId: selectedClassId }).then(stRes => {
        setStudents(stRes);
        // Load existing attendance for this date
        api.getAttendance({ classId: selectedClassId, date: selectedDate }).then(attRes => {
          const map: Record<string, AttendanceStatus> = {};
          stRes.forEach(st => {
            const existing = attRes.find(a => a.studentId === st.id);
            map[st.id] = existing ? existing.status : 'PRESENT';
          });
          setAttendanceMap(map);
        });
      });
    }
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveRegister = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const cls = classes.find(c => c.id === selectedClassId);
      const records = students.map(st => ({
        studentId: st.id,
        studentName: st.fullName,
        classId: selectedClassId,
        className: cls ? `${cls.name} (${cls.section})` : 'Grade 10',
        date: selectedDate,
        status: attendanceMap[st.id] || 'PRESENT',
        term: 'Term 1'
      }));

      await api.saveBulkAttendance(records);
      setSuccessMsg(`Successfully saved attendance register for ${records.length} students on ${selectedDate}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'PRESENT').length;
  const lateCount = Object.values(attendanceMap).filter(s => s === 'LATE').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Attendance Register</h2>
          <p className="text-xs text-slate-500">Mark and log student presence, tardiness, and authorized leaves.</p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Class</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Attendance Summary Pill Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Present</div>
          <div className="text-lg font-black text-emerald-900">{presentCount}</div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-[10px] font-bold text-amber-700 uppercase">Late</div>
          <div className="text-lg font-black text-amber-900">{lateCount}</div>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-[10px] font-bold text-rose-700 uppercase">Absent</div>
          <div className="text-lg font-black text-rose-900">{absentCount}</div>
        </div>
      </div>

      {/* Attendance Marking Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Class Student Roll Call
          </h3>
          <button
            onClick={handleSaveRegister}
            disabled={saving || students.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Register'}
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No students enrolled in this class yet.
            </div>
          ) : (
            students.map(st => {
              const currentStatus = attendanceMap[st.id] || 'PRESENT';
              return (
                <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={st.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{st.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.admissionNo}</div>
                    </div>
                  </div>

                  {/* Radio buttons for status */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(st.id, 'PRESENT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        currentStatus === 'PRESENT'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Present
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(st.id, 'LATE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        currentStatus === 'LATE'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Late
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(st.id, 'ABSENT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        currentStatus === 'ABSENT'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Absent
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(st.id, 'EXCUSED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        currentStatus === 'EXCUSED'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Excused
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
