import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Student } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { StatusChip } from '../common/StatusChip';
import { EditParentModal } from './EditParentModal';
import {
  User,
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  Phone,
  MapPin,
  Mail,
  Smile,
  FileText,
  Clock,
  CheckCircle2,
  Users2,
  Briefcase,
  ShieldCheck,
  MessageCircle,
  Pencil,
} from 'lucide-react';

interface Student360ModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Student360Modal: React.FC<Student360ModalProps> = ({ student, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'behaviors' | 'assignments' | 'parents'>('overview');
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const { students, grades, attendance, behaviors, rewards, alerts, submissions, assignments } = useApp();

  if (!student) return null;

  const currentStudent = students.find(s => s.id === student.id) || student;
  const studentGrade = grades.find(g => g.studentId === currentStudent.id);
  const studentAttendance = attendance.filter(a => a.studentId === currentStudent.id);
  const studentBehaviors = behaviors.filter(b => b.studentId === currentStudent.id);
  const studentRewards = rewards.filter(r => r.studentId === currentStudent.id);
  const studentAlerts = alerts.filter(a => a.studentId === currentStudent.id);
  const studentSubs = submissions.filter(s => s.studentId === currentStudent.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={student.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{student.fullName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {student.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">{student.className} • Ngày sinh: {new Date(student.dob).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Hồ sơ tổng quan', icon: User },
            { id: 'parents', label: 'Thông tin phụ huynh', icon: Users2 },
            { id: 'grades', label: 'Học tập & Điểm số', icon: GraduationCap },
            { id: 'attendance', label: 'Chuyên cần', icon: Calendar },
            { id: 'behaviors', label: 'Nề nếp & Thi đua', icon: Smile },
            { id: 'assignments', label: 'Bài tập', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-blue-700 uppercase">Điểm TB</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{currentStudent.gpa.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase">Chuyên cần</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{currentStudent.attendanceRate}%</p>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-purple-700 uppercase">Điểm thi đua</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">+{currentStudent.rewardPoints}</p>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
                <span className="text-[11px] font-semibold text-amber-700 uppercase">Hạnh kiểm</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{currentStudent.conduct}</p>
              </div>
            </div>

            {/* Contact & Family Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Thông tin liên lạc học sinh</h5>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>SĐT liên hệ: <strong className="text-slate-800 font-mono">{currentStudent.parentPhone}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email: {currentStudent.email || 'Chưa cung cấp'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Địa chỉ: {currentStudent.address}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">Phụ huynh học sinh</h5>
                  <button
                    onClick={() => setIsEditParentOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold bg-white px-2 py-0.5 rounded-md border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Sửa
                  </button>
                </div>
                <div className="text-slate-800 font-extrabold text-sm flex items-center justify-between">
                  <span>{currentStudent.parentName}</span>
                  <a
                    href={`tel:${currentStudent.parentPhone}`}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors font-mono font-bold"
                  >
                    <Phone className="w-3 h-3" /> {currentStudent.parentPhone}
                  </a>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Người giám hộ chính • {currentStudent.fatherName && currentStudent.motherName ? 'Đã có hồ sơ cả Bố và Mẹ' : 'Sổ liên lạc gia đình'}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentStudent.parentLinked !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentStudent.parentLinked !== false ? '✓ Đã liên kết ứng dụng' : 'Chưa liên kết app'}
                  </span>
                  <button
                    onClick={() => setActiveTab('parents')}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    Xem chi tiết phụ huynh →
                  </button>
                </div>
              </div>
            </div>

            {/* Teacher Notes */}
            {student.notes && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                <span className="font-bold">Nhận xét của Giáo viên chủ nhiệm: </span>
                {student.notes}
              </div>
            )}

            {/* Active alerts if any */}
            {studentAlerts.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cảnh báo cần lưu ý ({studentAlerts.length})</span>
                </div>
                {studentAlerts.map(a => (
                  <p key={a.id} className="text-xs text-rose-700 pl-5">
                    • {a.title}: {a.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Grades */}
        {activeTab === 'grades' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Môn học</th>
                    <th className="p-3 text-center">Miệng 1</th>
                    <th className="p-3 text-center">Miệng 2</th>
                    <th className="p-3 text-center">15 phút 1</th>
                    <th className="p-3 text-center">15 phút 2</th>
                    <th className="p-3 text-center">Giữa kỳ</th>
                    <th className="p-3 text-center">Cuối kỳ</th>
                    <th className="p-3 text-center font-extrabold text-blue-700">ĐTB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentGrade ? (
                    <tr>
                      <td className="p-3 font-bold text-slate-800">{studentGrade.subject}</td>
                      <td className="p-3 text-center">{studentGrade.oral1 ?? '-'}</td>
                      <td className="p-3 text-center">{studentGrade.oral2 ?? '-'}</td>
                      <td className="p-3 text-center">{studentGrade.test15m1 ?? '-'}</td>
                      <td className="p-3 text-center">{studentGrade.test15m2 ?? '-'}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{studentGrade.midTerm ?? '-'}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{studentGrade.finalTerm ?? '-'}</td>
                      <td className="p-3 text-center font-extrabold text-blue-600 text-sm">{studentGrade.average ?? '-'}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400">
                        Chưa có dữ liệu điểm môn học
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Lịch sử các buổi điểm danh gần nhất:</span>
              <span className="font-semibold text-emerald-700">Tỷ lệ: {student.attendanceRate}%</span>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
              {studentAttendance.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">Chưa có bản ghi điểm danh cá nhân</p>
              ) : (
                studentAttendance.map(att => (
                  <div key={att.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {new Date(att.date).toLocaleDateString('vi-VN')} (Tiết {att.period})
                      </span>
                      {att.note && <span className="text-slate-500 italic">- "{att.note}"</span>}
                    </div>
                    <StatusChip status={att.status} type="attendance" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Behaviors & Rewards */}
        {activeTab === 'behaviors' && (
          <div className="space-y-4">
            {/* Rewards Badges */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Huy hiệu & Khen thưởng ({studentRewards.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {studentRewards.map(rew => (
                  <div key={rew.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <span className="text-2xl">{rew.icon}</span>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{rew.title}</p>
                      <p className="text-slate-600 mt-0.5">{rew.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(rew.awardedDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavior Log */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">Nhật ký nề nếp trên lớp:</h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {studentBehaviors.map(beh => (
                  <div
                    key={beh.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      beh.type === 'POSITIVE'
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{beh.title}</span>
                      {beh.notes && <span className="text-slate-600 ml-1">({beh.notes})</span>}
                    </div>
                    <span className="font-black">
                      {beh.points > 0 ? `+${beh.points}` : beh.points} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700">Các bài tập đã hoàn thành:</h5>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {studentSubs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Chưa có bài tập nào được nộp</p>
              ) : (
                studentSubs.map(sub => {
                  const asg = assignments.find(a => a.id === sub.assignmentId);
                  return (
                    <div key={sub.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">{asg?.title || 'Bài tập'}</span>
                        <StatusChip status={sub.status} type="submission" />
                      </div>
                      <p className="text-slate-600 line-clamp-1">{sub.content}</p>
                      {sub.score !== undefined && (
                        <div className="flex items-center gap-2 pt-1 font-semibold text-emerald-700">
                          <span>Điểm: {sub.score}/10</span>
                          {sub.feedback && <span className="text-slate-500 italic">- "{sub.feedback}"</span>}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Parents Info */}
        {activeTab === 'parents' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Action Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    Người đại diện chính: {currentStudent.parentName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {currentStudent.primaryContact === 'father' ? 'Bố' : currentStudent.primaryContact === 'guardian' ? 'Người giám hộ' : 'Mẹ'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số điện thoại ưu tiên: <strong className="text-blue-700 font-mono">{currentStudent.parentPhone}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${currentStudent.parentPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Gọi điện</span>
                </a>
                <a
                  href={`sms:${currentStudent.parentPhone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Nhắn tin</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditParentOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sửa thông tin</span>
                </button>
              </div>
            </div>

            {/* 2 Cards: Bố và Mẹ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thẻ Bố */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                      B
                    </span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                        Thông tin Bố (Cha)
                      </h5>
                      <span className="text-[10px] text-slate-400">Quan hệ gia đình</span>
                    </div>
                  </div>
                  {currentStudent.primaryContact === 'father' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Liên hệ chính
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Họ và tên:</span>
                    <strong className="text-slate-900 text-right">
                      {currentStudent.fatherName || 'Chưa cập nhật'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    {currentStudent.fatherPhone ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{currentStudent.fatherPhone}</span>
                        <a
                          href={`tel:${currentStudent.fatherPhone}`}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Gọi cho Bố"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có SĐT</span>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Nghề nghiệp / Đơn vị:</span>
                    <span className="text-slate-700 text-right font-medium">
                      {currentStudent.fatherJob || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thẻ Mẹ */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-xs">
                      M
                    </span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                        Thông tin Mẹ
                      </h5>
                      <span className="text-[10px] text-slate-400">Quan hệ gia đình</span>
                    </div>
                  </div>
                  {currentStudent.primaryContact !== 'father' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
                      Liên hệ chính
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Họ và tên:</span>
                    <strong className="text-slate-900 text-right">
                      {currentStudent.motherName || currentStudent.parentName || 'Chưa cập nhật'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    {currentStudent.motherPhone || currentStudent.parentPhone ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">
                          {currentStudent.motherPhone || currentStudent.parentPhone}
                        </span>
                        <a
                          href={`tel:${currentStudent.motherPhone || currentStudent.parentPhone}`}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Gọi cho Mẹ"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có SĐT</span>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Nghề nghiệp / Đơn vị:</span>
                    <span className="text-slate-700 text-right font-medium">
                      {currentStudent.motherJob || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ gia đình & ứng dụng */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h6 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Địa chỉ & Liên lạc</h6>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Địa chỉ thường trú: <strong>{currentStudent.address}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Email phụ huynh: <strong>{currentStudent.parentEmail || currentStudent.email || 'Chưa đăng ký'}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Tài khoản Sổ liên lạc</h6>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700">Trạng thái: </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentStudent.parentLinked !== false
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentStudent.parentLinked !== false ? '✓ Đã kích hoạt Sổ liên lạc điện tử' : 'Chưa kích hoạt'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Phụ huynh nhận được điểm số, chuyên cần và thông báo từ nhà trường qua ứng dụng phụ huynh.
                </p>
              </div>
            </div>

            {/* Ghi chú & Dặn dò từ phụ huynh */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Ghi chú / Lưu ý riêng từ phụ huynh gửi đến thầy cô:</span>
              </div>
              <p className="text-amber-800 leading-relaxed pl-6">
                {currentStudent.parentNotes || 'Chưa có ghi chú đặc biệt từ phụ huynh cho học sinh này.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Parent Modal */}
      <EditParentModal
        isOpen={isEditParentOpen}
        onClose={() => setIsEditParentOpen(false)}
        student={currentStudent}
      />
    </Modal>
  );
};
