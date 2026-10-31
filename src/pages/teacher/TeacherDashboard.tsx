import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  GraduationCap,
  Clock,
  Plus,
  Dices,
  HelpCircle,
  FolderArchive,
  ArrowRight,
  TrendingUp,
  ChevronsUpDown,
  Bot,
  Sun,
  Sunset,
} from 'lucide-react';
import { CollapsibleCard } from '../../components/common/CollapsibleCard';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    students,
    selectedClass,
    attendance,
    assignments,
    submissions,
    alerts,
    grades,
    schedule,
    setActiveTool,
  } = useApp();
  const navigate = useNavigate();

  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  // Today's attendance stats
  const today = '2026-10-02';
  const todayAttendance = attendance.filter(a => a.classId === selectedClass?.id && a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = todayAttendance.filter(a => a.status === 'EXCUSED' || a.status === 'UNEXCUSED').length;
  const lateCount = todayAttendance.filter(a => a.status === 'LATE').length;

  // Assignments needing grading
  const pendingGradingCount = submissions.filter(s => s.status === 'SUBMITTED').length;

  // Active alerts
  const activeAlerts = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS');

  // GPA calculation
  const classGrades = grades.filter(g => g.classId === selectedClass?.id && g.average !== undefined);
  const classAvgGPA =
    classGrades.length > 0
      ? (classGrades.reduce((acc, g) => acc + (g.average || 0), 0) / classGrades.length).toFixed(1)
      : '8.4';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Học kỳ I • Niên khóa 2024-2025
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser.name}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Hôm nay bạn có 2 tiết giảng dạy tại <span className="font-bold underline">{selectedClass?.name || 'Lớp 9A1'}</span>. Đã có 35/38 học sinh có mặt đúng giờ.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Điểm danh ngay
            </button>
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              Giao bài tập
            </button>
            <button
              onClick={() => setActiveTool('wheel')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <Dices className="w-4 h-4" />
              Vòng quay gọi tên
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sĩ số học sinh"
          value={`${classStudents.length} HS`}
          subtitle={`Phòng ${selectedClass?.room || 'Phòng 402'}`}
          icon={Users}
          color="blue"
          onClick={() => navigate('/teacher/students')}
        />

        <StatCard
          title="Điểm danh hôm nay"
          value={`${presentCount || 36} / ${classStudents.length || 38}`}
          subtitle={`Vắng: ${absentCount || 1} • Đi trễ: ${lateCount || 1}`}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/teacher/attendance')}
        />

        <StatCard
          title="Bài cần chấm"
          value={`${pendingGradingCount} bài`}
          subtitle="Cần phản hồi trước thứ Hai"
          icon={FileText}
          color="amber"
          onClick={() => navigate('/teacher/assignments')}
        />

        <StatCard
          title="Điểm trung bình lớp"
          value={classAvgGPA}
          subtitle="Tăng 0.3 so với tháng trước"
          icon={GraduationCap}
          color="purple"
          trend={{ value: '0.3', isUp: true }}
          onClick={() => navigate('/teacher/grades')}
        />
      </div>

      {/* Main Content 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today Schedule & Early Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <CollapsibleCard
            title="Lịch dạy hôm nay (Thứ Sáu)"
            subtitle={`${schedule.filter(s => s.dayOfWeek === 6).length} tiết giảng dạy • Sáng & Chiều tại ${selectedClass?.name || 'Lớp 9A1'}`}
            icon={Calendar}
            badge={
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600" /> Sáng
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                  <Sunset className="w-3 h-3 text-indigo-600" /> Chiều
                </span>
              </div>
            }
            actions={
              <button
                type="button"
                onClick={() => navigate('/teacher/schedule')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mr-1"
              >
                Xem tuần <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-2.5">
              {schedule
                .filter(s => s.dayOfWeek === 6 && (s.classId === selectedClass?.id || s.classId === 'cls-9a1'))
                .map(item => {
                  const isMorning = item.session === 'MORNING' || item.period <= 5;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isMorning
                          ? 'bg-amber-50/50 border-amber-200/70'
                          : 'bg-indigo-50/50 border-indigo-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-2.5 py-1 rounded-lg text-white font-bold text-xs shrink-0 ${
                            isMorning ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                        >
                          Tiết {item.period} {isMorning ? 'Sáng' : 'Chiều'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.subject}</h4>
                          <p className="text-[11px] text-slate-500">
                            {item.timeSlot} • {item.room} • {item.teacherName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isMorning
                            ? 'text-amber-800 bg-amber-100'
                            : 'text-indigo-800 bg-indigo-100'
                        }`}
                      >
                        {isMorning ? '🌅 Sáng' : '🌇 Chiều'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CollapsibleCard>

          {/* Active System Alerts */}
          <CollapsibleCard
            title={`Cảnh báo sớm học sinh (${activeAlerts.length})`}
            subtitle="Các trường hợp cần lưu ý về chuyên cần và học lực"
            icon={AlertTriangle}
            actions={
              <button
                type="button"
                onClick={() => navigate('/teacher/alerts')}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 mr-1"
              >
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-2.5">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-rose-900">{alert.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-200 text-rose-800">
                        {alert.studentName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</p>
                  </div>
                  <button
                    onClick={() => navigate('/teacher/alerts')}
                    className="shrink-0 px-3 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Xử lý
                  </button>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        </div>

        {/* Right Column: Quick Tools & AI */}
        <div className="space-y-6">
          {/* Quick Classroom Tools Card */}
          <CollapsibleCard
            title="Tiện ích lớp học tức thì"
            subtitle="Công cụ tương tác trong giờ dạy"
            icon={Dices}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveTool('wheel')}
                className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-left transition-colors cursor-pointer"
              >
                <Dices className="w-5 h-5 text-purple-600 mb-1" />
                <span className="block font-bold text-xs">Vòng quay</span>
                <span className="text-[10px] text-purple-600">Gọi tên ngẫu nhiên</span>
              </button>

              <button
                onClick={() => setActiveTool('random')}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 text-left transition-colors cursor-pointer"
              >
                <Users className="w-5 h-5 text-blue-600 mb-1" />
                <span className="block font-bold text-xs">Bốc thăm</span>
                <span className="text-[10px] text-blue-600">Tránh gọi lặp</span>
              </button>

              <button
                onClick={() => setActiveTool('groups')}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-left transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="block font-bold text-xs">Chia nhóm</span>
                <span className="text-[10px] text-emerald-600">Cân bằng nam nữ</span>
              </button>

              <button
                onClick={() => setActiveTool('timer')}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-left transition-colors cursor-pointer"
              >
                <Clock className="w-5 h-5 text-amber-600 mb-1" />
                <span className="block font-bold text-xs">Hẹn giờ</span>
                <span className="text-[10px] text-amber-600">Chuông báo âm thanh</span>
              </button>
            </div>
          </CollapsibleCard>

          {/* AI Teaching Assistant Banner */}
          <CollapsibleCard
            title="Trợ lý AI Giáo viên"
            subtitle="Soạn đề & Giáo án nhanh chóng"
            icon={Bot}
            badge={
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-bold">
                GDPT 2018
              </span>
            }
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự động tạo câu hỏi trắc nghiệm, phiếu bài tập hoặc gợi ý nhận xét học sinh theo chuẩn Bộ GD&ĐT.
              </p>
              <button
                onClick={() => navigate('/teacher/ai')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Mở không gian AI Giáo viên
              </button>
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </div>
  );
};
