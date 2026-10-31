import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckSquare,
  CheckCircle2,
  Calendar,
  Clock,
  Save,
  RotateCcw,
  AlertCircle,
  History,
  Users,
} from 'lucide-react';
import { CollapsibleCard } from '../../components/common/CollapsibleCard';

export const AttendancePage: React.FC = () => {
  const { students, selectedClass, classes, attendance, saveAttendanceBatch, showToast } = useApp();
  const { currentUser } = useAuth();

  const [date, setDate] = useState<string>('2026-10-02');
  const [period, setPeriod] = useState<number>(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  // Local state for the current session
  const [records, setRecords] = useState<{ [studentId: string]: { status: AttendanceStatus; note: string } }>({});

  // Load existing records or default to PRESENT
  useEffect(() => {
    const existing = attendance.filter(
      a => a.classId === selectedClass?.id && a.date === date && a.period === period
    );

    const initialMap: { [studentId: string]: { status: AttendanceStatus; note: string } } = {};
    classStudents.forEach(st => {
      const match = existing.find(e => e.studentId === st.id);
      if (match) {
        initialMap[st.id] = { status: match.status, note: match.note || '' };
      } else {
        initialMap[st.id] = { status: 'PRESENT', note: '' };
      }
    });

    setRecords(initialMap);
    setHasUnsavedChanges(false);
  }, [selectedClass?.id, date, period, classStudents.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const markAllPresent = () => {
    const updated: { [studentId: string]: { status: AttendanceStatus; note: string } } = {};
    classStudents.forEach(st => {
      updated[st.id] = { status: 'PRESENT', note: '' };
    });
    setRecords(updated);
    setHasUnsavedChanges(true);
    showToast('info', 'Đã đánh dấu tất cả học sinh có mặt!');
  };

  const handleSave = () => {
    if (!selectedClass) return;

    const listToSave: AttendanceRecord[] = classStudents.map(st => {
      const rec = records[st.id] || { status: 'PRESENT', note: '' };
      return {
        id: `att-${selectedClass.id}-${st.id}-${date}-p${period}`,
        date,
        period,
        classId: selectedClass.id,
        studentId: st.id,
        studentName: st.fullName,
        status: rec.status,
        note: rec.note,
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString(),
      };
    });

    saveAttendanceBatch(listToSave);
    setHasUnsavedChanges(false);
  };

  // Quick stats
  const total = classStudents.length;
  const presentCount = Object.values(records).filter(r => r.status === 'PRESENT').length;
  const excusedCount = Object.values(records).filter(r => r.status === 'EXCUSED').length;
  const unexcusedCount = Object.values(records).filter(r => r.status === 'UNEXCUSED').length;
  const lateCount = Object.values(records).filter(r => r.status === 'LATE').length;
  const earlyCount = Object.values(records).filter(r => r.status === 'EARLY_LEAVE').length;

  const statusOptions: { value: AttendanceStatus; label: string; activeClass: string }[] = [
    { value: 'PRESENT', label: 'Có mặt', activeClass: 'bg-emerald-600 text-white shadow-xs' },
    { value: 'EXCUSED', label: 'Vắng phép', activeClass: 'bg-blue-600 text-white shadow-xs' },
    { value: 'UNEXCUSED', label: 'Không phép', activeClass: 'bg-rose-600 text-white shadow-xs' },
    { value: 'LATE', label: 'Đi trễ', activeClass: 'bg-amber-500 text-white shadow-xs' },
    { value: 'EARLY_LEAVE', label: 'Về sớm', activeClass: 'bg-purple-600 text-white shadow-xs' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            Điểm danh buổi học: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ghi nhận chuyên cần, đi trễ, vắng học có phép / không phép theo từng tiết
          </p>
        </div>

        <button
          onClick={markAllPresent}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Đánh dấu tất cả có mặt
        </button>
      </div>

      {/* Date & Period Picker Bar - Collapsible */}
      <CollapsibleCard
        title={`Thiết lập buổi học: ${date} • Tiết ${period}`}
        subtitle={`Sĩ số lớp: ${classStudents.length} học sinh • ${selectedClass?.name}`}
        icon={Calendar}
        defaultOpen={true}
        badge={
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Có mặt {presentCount}/{classStudents.length}
          </span>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Ngày học:</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Tiết học:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      period === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick summary badges */}
          <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Có mặt: {presentCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              Có phép: {excusedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              K.Phép: {unexcusedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              Trễ: {lateCount}
            </span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Student Attendance List (Mobile-first large rows) */}
      <div className="space-y-3">
        {classStudents.map((st, idx) => {
          const rec = records[st.id] || { status: 'PRESENT', note: '' };
          const isAbnormal = rec.status !== 'PRESENT';

          return (
            <div
              key={st.id}
              className={`p-4 rounded-2xl bg-white border transition-all duration-200 ${
                isAbnormal ? 'border-amber-300 shadow-sm bg-amber-50/20' : 'border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Student info */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                  <img
                    src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={st.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{st.fullName}</h4>
                    <p className="text-xs text-slate-500">{st.studentCode} • {st.gender}</p>
                  </div>
                </div>

                {/* Center: Big touch-friendly status buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {statusOptions.map(opt => {
                    const isSelected = rec.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleStatusChange(st.id, opt.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center ${
                          isSelected
                            ? opt.activeClass
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Note input for reason */}
                <div className="w-full md:w-64">
                  <input
                    type="text"
                    value={rec.note}
                    onChange={e => handleNoteChange(st.id, e.target.value)}
                    placeholder={rec.status === 'PRESENT' ? 'Ghi chú (tùy chọn)' : 'Nhập lý do vắng / đi muộn...'}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isAbnormal ? 'border-amber-300 bg-amber-50/50 text-slate-800' : 'border-slate-200 bg-slate-50'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Có thay đổi chưa lưu
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dữ liệu đã được lưu an toàn
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            Lưu sổ điểm danh
          </button>
        </div>
      </div>
    </div>
  );
};
