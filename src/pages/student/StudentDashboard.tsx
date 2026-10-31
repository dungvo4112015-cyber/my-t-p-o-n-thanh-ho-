import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  FileText,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Sun,
  Sunset,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { assignments, submissions, quizzes, grades, rewards, schedule } = useApp();
  const navigate = useNavigate();

  const studentId = currentUser.studentId || 'hs-1';
  const myGrade = grades.find(g => g.studentId === studentId);
  const myRewards = rewards.filter(r => r.studentId === studentId);
  const mySubmissions = submissions.filter(s => s.studentId === studentId);

  // Assignments needing submission
  const pendingAssignments = assignments.filter(a => {
    if (a.isDraft) return false;
    const hasSubmitted = mySubmissions.some(s => s.assignmentId === a.id);
    return !hasSubmitted;
  });

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 mb-3">
            Học sinh lớp 9A1 • Năm học 2024-2025
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Chào mừng {currentUser.name}! 📚
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 leading-relaxed">
            Hôm nay em có 2 bài tập cần hoàn thành trước Chủ nhật. Hãy xem lại bài giảng và nộp bài đúng hạn nhé!
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/student/assignments')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Làm bài tập ({pendingAssignments.length})
            </button>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Luyện tập Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Điểm TB môn Toán"
          value={myGrade?.average ? `${myGrade.average}` : '9.1'}
          subtitle="Xếp loại: Xuất sắc"
          icon={GraduationCap}
          color="blue"
          onClick={() => navigate('/student/grades')}
        />

        <StatCard
          title="Bài tập cần làm"
          value={`${pendingAssignments.length} bài`}
          subtitle="Hạn chót gần nhất: 06/10"
          icon={FileText}
          color="amber"
          onClick={() => navigate('/student/assignments')}
        />

        <StatCard
          title="Chuyên cần học kỳ"
          value="98.5%"
          subtitle="Đúng giờ 100% các tiết sáng"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Huy hiệu đạt được"
          value={`${myRewards.length} danh hiệu`}
          subtitle="⭐ Ngôi sao tuần 4"
          icon={Award}
          color="purple"
          onClick={() => navigate('/student/achievements')}
        />
      </div>

      {/* 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Nhiệm vụ & Bài tập cần hoàn thành
              </h3>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="space-y-3">
              {assignments
                .filter(a => !a.isDraft)
                .slice(0, 3)
                .map(asg => {
                  const sub = mySubmissions.find(s => s.assignmentId === asg.id);
                  const isDone = !!sub;

                  return (
                    <div
                      key={asg.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{asg.title}</span>
                          {isDone ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {sub.status === 'GRADED' ? `Đã chấm: ${sub.score}đ` : 'Đã nộp bài'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              Chưa làm
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{asg.description}</p>
                      </div>

                      <button
                        onClick={() => navigate('/student/assignments')}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-blue-600 hover:bg-blue-50 shrink-0"
                      >
                        {isDone ? 'Xem bài làm' : 'Làm bài'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Schedule */}
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Huy hiệu vinh danh gần nhất
            </h3>

            {myRewards.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có huy hiệu nào</p>
            ) : (
              myRewards.map(rew => (
                <div key={rew.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">{rew.icon}</span>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">{rew.title}</p>
                    <p className="text-slate-500">{rew.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Today's Schedule Card (Morning & Afternoon) */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Lịch học hôm nay (Thứ Sáu)
              </h3>
              <button
                type="button"
                onClick={() => navigate('/student/schedule')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Cả tuần <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {schedule
                .filter(s => s.dayOfWeek === 6 && (s.classId === 'cls-9a1'))
                .slice(0, 4)
                .map(item => {
                  const isMorning = item.session === 'MORNING' || item.period <= 5;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isMorning ? 'bg-amber-50/50 border-amber-200/70' : 'bg-indigo-50/50 border-indigo-200/70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              isMorning ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                            }`}
                          >
                            Tiết {item.period} {isMorning ? 'Sáng' : 'Chiều'}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{item.subject}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {item.timeSlot} • {item.room}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[90px]">
                        {item.teacherName}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
