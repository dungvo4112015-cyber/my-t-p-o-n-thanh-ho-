import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';
import { EditParentModal } from '../../components/student/EditParentModal';
import {
  Users2,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle2,
  Mail,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Pencil,
  ShieldCheck,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { students, grades, attendance, submissions, assignments, leaveRequests } = useApp();
  const navigate = useNavigate();
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);

  // Active child context (Lê Hải Đăng)
  const childId = 'hs-1';
  const child = students.find(s => s.id === childId) || students[0];
  const childGrade = grades.find(g => g.studentId === childId);
  const childSubs = submissions.filter(s => s.studentId === childId);
  const childLeaves = leaveRequests.filter(l => l.studentId === childId);

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-100 mb-3">
            Sổ liên lạc điện tử • Cổng phụ huynh
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kính chào quý phụ huynh {currentUser.name}! 👨‍👩‍👧
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100 leading-relaxed">
            Đang theo dõi học sinh: <span className="font-extrabold underline">{child?.fullName}</span> (Lớp {child?.className}). Hôm nay con đã có mặt đầy đủ đúng giờ tại trường.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/parent/leave-request')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-amber-800 font-bold text-xs hover:bg-amber-50 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              Gửi đơn xin nghỉ phép
            </button>
            <button
              onClick={() => navigate('/parent/messages')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700/80 hover:bg-amber-700 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              Nhắn tin cho Thầy An (GVCN)
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Chuyên cần tháng 10"
          value={`${child?.attendanceRate ?? 98.5}%`}
          subtitle="Có mặt đúng giờ 100%"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Điểm TB học tập"
          value={`${childGrade?.average ?? 9.1}`}
          subtitle="Môn Toán: Xuất sắc"
          icon={GraduationCap}
          color="blue"
        />

        <StatCard
          title="Điểm thi đua nề nếp"
          value={`+${child?.rewardPoints ?? 125} đ`}
          subtitle="Hạnh kiểm: Tốt"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Bài tập hoàn thành"
          value={`${childSubs.length} bài`}
          subtitle="Đều được thầy cô khen ngợi"
          icon={FileText}
          color="amber"
        />
      </div>

      {/* 2 Columns: Recent feedback & leave requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Teacher Feedback on Assignments */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award className="w-4 h-4 text-emerald-600" />
            Nhận xét bài làm gần nhất của Thầy/Cô
          </h3>

          <div className="space-y-3">
            {childSubs.slice(0, 2).map(sub => {
              const asg = assignments.find(a => a.id === sub.assignmentId);
              return (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{asg?.title || 'Bài tập'}</span>
                    <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {sub.score} / 10 điểm
                    </span>
                  </div>
                  {sub.feedback && (
                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                      "{sub.feedback}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 text-right">Giáo viên: {sub.gradedBy}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Requests Status */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Đơn xin nghỉ học ({childLeaves.length})
            </h3>
            <button
              onClick={() => navigate('/parent/leave-request')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Gửi đơn mới →
            </button>
          </div>

          <div className="space-y-3">
            {childLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có đơn xin nghỉ phép nào</p>
            ) : (
              childLeaves.map(lr => (
                <div key={lr.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">
                      Nghỉ từ {new Date(lr.fromDate).toLocaleDateString('vi-VN')} đến {new Date(lr.toDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        lr.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lr.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lr.status === 'APPROVED' ? 'Đã duyệt' : lr.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">Lý do: {lr.reason}</p>
                  {lr.responseNote && (
                    <p className="text-[11px] text-emerald-700 italic">Thầy phản hồi: "{lr.responseNote}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Thông tin phụ huynh & gia đình */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-amber-600" />
              Thông tin liên hệ phụ huynh & Gia đình
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hồ sơ liên lạc chính thức dùng để nhận thông báo, điểm số và liên lạc khẩn cấp từ nhà trường
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditParentOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors border border-amber-200/70 cursor-pointer self-start sm:self-auto"
          >
            <Pencil className="w-3.5 h-3.5" />
            Cập nhật thông tin gia đình
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Thông tin Bố */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-blue-200/50">
              <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">Thông tin Bố (Cha)</span>
              {child?.primaryContact === 'father' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-900">
                  Liên hệ chính
                </span>
              )}
            </div>
            <p className="font-bold text-slate-800 text-sm">{child?.fatherName || 'Chưa cập nhật'}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{child?.fatherPhone || 'Chưa có SĐT'}</span>
            </p>
            <p className="text-slate-500 text-[11px]">{child?.fatherJob || 'Nghề nghiệp: Chưa cập nhật'}</p>
          </div>

          {/* Thông tin Mẹ */}
          <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-pink-200/50">
              <span className="font-bold text-pink-900 uppercase tracking-wider text-[11px]">Thông tin Mẹ</span>
              {child?.primaryContact !== 'father' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-200 text-pink-900">
                  Liên hệ chính
                </span>
              )}
            </div>
            <p className="font-bold text-slate-800 text-sm">{child?.motherName || child?.parentName || 'Chưa cập nhật'}</p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{child?.motherPhone || child?.parentPhone || 'Chưa có SĐT'}</span>
            </p>
            <p className="text-slate-500 text-[11px]">{child?.motherJob || 'Nghề nghiệp: Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Địa chỉ thường trú: <strong>{child?.address}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Email phụ huynh: <strong>{child?.parentEmail || child?.email || 'Chưa đăng ký'}</strong></span>
          </div>
        </div>

        {child?.parentNotes && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <strong className="block mb-0.5">Ghi chú & Dặn dò của gia đình gửi nhà trường:</strong>
            <p className="italic">{child.parentNotes}</p>
          </div>
        )}
      </div>

      {/* Edit Parent Modal */}
      <EditParentModal
        isOpen={isEditParentOpen}
        onClose={() => setIsEditParentOpen(false)}
        student={child}
      />
    </div>
  );
};
