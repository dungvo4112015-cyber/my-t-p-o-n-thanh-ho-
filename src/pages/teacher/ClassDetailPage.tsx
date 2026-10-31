import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { AddStudentModal } from '../../components/student/AddStudentModal';
import { Student360Modal } from '../../components/student/Student360Modal';
import { Modal } from '../../components/common/Modal';
import { Student } from '../../types';
import { EditParentModal } from '../../components/student/EditParentModal';
import {
  School,
  ArrowLeft,
  Users,
  CheckSquare,
  GraduationCap,
  DoorOpen,
  QrCode,
  Pencil,
  UserPlus,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Eye,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users2,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { classes, students, assignments, updateClass, showToast, setSelectedClassId } = useApp();
  const navigate = useNavigate();

  const currentClass = classes.find(c => c.id === id) || classes[0];
  const classStudents = students.filter(s => s.classId === currentClass?.id);
  const classAssignments = assignments.filter(a => a.classId === currentClass?.id);

  // States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentFor360, setSelectedStudentFor360] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newName, setNewName] = useState(currentClass?.name || '');
  const [newRoom, setNewRoom] = useState(currentClass?.room || '');
  const [newSubject, setNewSubject] = useState(currentClass?.subject || '');
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isRosterOpen, setIsRosterOpen] = useState(true);
  const [rosterTab, setRosterTab] = useState<'students' | 'parents'>('students');
  const [editingParentStudent, setEditingParentStudent] = useState<Student | null>(null);

  if (!currentClass) {
    return (
      <div className="py-16 text-center text-slate-500 space-y-3">
        <School className="w-12 h-12 mx-auto text-slate-300" />
        <p className="text-sm font-semibold">Không tìm thấy thông tin lớp học.</p>
        <button
          onClick={() => navigate('/teacher/classes')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Quay lại danh sách lớp
        </button>
      </div>
    );
  }

  const handleOpenRename = () => {
    setNewName(currentClass.name);
    setNewRoom(currentClass.room);
    setNewSubject(currentClass.subject || '');
    setIsRenameModalOpen(true);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('error', 'Tên lớp học không được để trống!');
      return;
    }
    updateClass(currentClass.id, {
      name: newName.trim(),
      room: newRoom.trim(),
      subject: newSubject.trim(),
    });
    showToast('success', `Đã đổi tên lớp thành "${newName.trim()}"!`);
    setIsRenameModalOpen(false);
  };

  const filteredStudents = classStudents.filter(st => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return st.fullName.toLowerCase().includes(q) || st.studentCode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <button
          onClick={() => navigate('/teacher/classes')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp học
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-blue-500/20 shrink-0">
              {currentClass.name.replace('Lớp ', '').slice(0, 4)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentClass.name}
                </h1>
                <button
                  type="button"
                  onClick={handleOpenRename}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Đổi tên lớp học"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Đổi tên lớp</span>
                </button>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  Niên khóa {currentClass.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>📍 {currentClass.room || 'Chưa xếp phòng'}</span>
                <span>• GVCN: {currentClass.homeroomTeacherName}</span>
                <span>• {currentClass.subject || 'Toán học & Chủ nhiệm'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm học sinh vào lớp</span>
            </button>
            <button
              onClick={() => {
                setSelectedClassId(currentClass.id);
                navigate('/teacher/attendance');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Điểm danh</span>
            </button>
            <button
              onClick={() => {
                setSelectedClassId(currentClass.id);
                navigate('/teacher/grades');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Sổ điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Statistics Grid (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">Thống kê tổng quan lớp học</span>
          </div>
          <button
            type="button"
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <span>{isStatsOpen ? 'Thu gọn' : 'Mở rộng'}</span>
            {isStatsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isStatsOpen && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-150">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Sĩ số học sinh</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{classStudents.length} / {currentClass.maxStudents} HS</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Bài tập đã giao</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{classAssignments.length} bài</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Mã tham gia</span>
              <p className="text-2xl font-black text-blue-600 font-mono mt-1">{currentClass.joinCode}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Trạng thái</span>
              <p className="text-base font-extrabold text-emerald-600 mt-1 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Đang hoạt động
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Student List in Class with Search (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900">
                Thành viên lớp {currentClass.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                {classStudents.length} học sinh
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu hồ sơ học sinh, điểm số và thông tin liên lạc phụ huynh trong lớp
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Roster Tab: Học sinh vs Phụ huynh */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setRosterTab('students')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rosterTab === 'students'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Học sinh</span>
              </button>

              <button
                type="button"
                onClick={() => setRosterTab('parents')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  rosterTab === 'parents'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Thông tin phụ huynh</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRosterOpen(!isRosterOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <span>{isRosterOpen ? 'Thu gọn' : 'Mở rộng'}</span>
              {isRosterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isRosterOpen && (
          <div className="p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Tìm tên, mã học sinh, tên phụ huynh..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {rosterTab === 'students' && (
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm mới</span>
                </button>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  {studentSearch ? 'Không tìm thấy thông tin phù hợp với từ khóa' : 'Lớp học chưa có học sinh nào'}
                </p>
                {rosterTab === 'students' && (
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Thêm học sinh đầu tiên
                  </button>
                )}
              </div>
            ) : rosterTab === 'students' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredStudents.map(st => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentFor360(st)}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 flex items-center justify-between gap-3 transition-all cursor-pointer group hover:border-blue-300"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={st.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 group-hover:border-blue-400 shrink-0"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors block">
                          {st.fullName}
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {st.studentCode} • {st.gender}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          ĐTB: <strong className="text-blue-600">{st.gpa}</strong> • {st.conduct}
                        </p>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-100/50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Roster Tab: Thông tin phụ huynh lớp */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
                {filteredStudents.map(st => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:border-blue-300 transition-all space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                          alt={st.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <strong className="text-xs text-slate-900 block font-bold">{st.fullName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{st.studentCode}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.parentLinked !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {st.parentLinked !== false ? '✓ App' : 'Chưa app'}
                      </span>
                    </div>

                    {/* Primary contact */}
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase block">
                          {st.primaryContact === 'father' ? 'Bố' : 'Mẹ'}: {st.parentName}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">{st.parentPhone}</span>
                      </div>
                      <a
                        href={`tel:${st.parentPhone}`}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors"
                        title="Gọi điện cho phụ huynh"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Parents summary */}
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {st.fatherName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Bố:</span>
                          <span className="font-medium text-slate-700">{st.fatherName} ({st.fatherPhone || 'N/A'})</span>
                        </div>
                      )}
                      {st.motherName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Mẹ:</span>
                          <span className="font-medium text-slate-700">{st.motherName} ({st.motherPhone || 'N/A'})</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentFor360(st)}
                        title="Xem chi tiết"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingParentStudent(st)}
                        title="Chỉnh sửa"
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RENAME CLASS MODAL */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            <span>Đổi tên & Thông tin lớp học</span>
          </div>
        }
      >
        <form onSubmit={handleSaveRename} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-slate-800 mb-1">
              Tên lớp học mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="VD: Lớp 9A1, Lớp 9A1 Chuyên Toán..."
                className="w-full pl-9 pr-3 py-2.5 bg-blue-50/40 border border-blue-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tên lớp sẽ được cập nhật tức thì trên toàn bộ hệ thống (danh sách học sinh, điểm số, thời khóa biểu).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phòng học</label>
              <input
                type="text"
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                placeholder="VD: Phòng 405"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="VD: Toán học & Chủ nhiệm"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsRenameModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        defaultClassId={currentClass.id}
      />

      {/* STUDENT 360 MODAL */}
      <Student360Modal
        student={selectedStudentFor360}
        isOpen={!!selectedStudentFor360}
        onClose={() => setSelectedStudentFor360(null)}
      />

      {/* EDIT PARENT MODAL */}
      <EditParentModal
        isOpen={!!editingParentStudent}
        onClose={() => setEditingParentStudent(null)}
        student={editingParentStudent}
      />
    </div>
  );
};
