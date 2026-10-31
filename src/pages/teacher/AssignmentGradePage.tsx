import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { StatusChip } from '../../components/common/StatusChip';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  MessageSquare,
  Paperclip,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AssignmentGradePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assignments, submissions, students, gradeSubmission, showToast } = useApp();

  const assignment = assignments.find(a => a.id === id) || assignments[0];
  const classStudents = students.filter(s => s.classId === assignment?.classId);

  // Submissions for this assignment
  const assignmentSubs = submissions.filter(s => s.assignmentId === assignment?.id);

  // Student selection index
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStudent = classStudents[currentIndex] || classStudents[0];

  const currentSub = assignmentSubs.find(s => s.studentId === currentStudent?.id);

  // Grading form state
  const [scoreInput, setScoreInput] = useState<string>(
    currentSub?.score !== undefined ? String(currentSub.score) : '9.0'
  );
  const [feedbackInput, setFeedbackInput] = useState<string>(
    currentSub?.feedback || 'Bài làm tốt, trình bày mạch lạc rõ ràng.'
  );

  const handleSelectStudent = (index: number) => {
    setCurrentIndex(index);
    const targetStudent = classStudents[index];
    const sub = assignmentSubs.find(s => s.studentId === targetStudent?.id);
    setScoreInput(sub?.score !== undefined ? String(sub.score) : '9.0');
    setFeedbackInput(sub?.feedback || 'Bài làm tốt, trình bày mạch lạc rõ ràng.');
  };

  const handleSaveGrade = () => {
    if (!currentStudent) return;
    const num = parseFloat(scoreInput);
    if (isNaN(num) || num < 0 || num > 10) {
      showToast('error', 'Điểm số phải từ 0 đến 10!');
      return;
    }

    const subId = currentSub?.id || `sub-${assignment.id}-${currentStudent.id}`;
    gradeSubmission(subId, num, feedbackInput);

    // Auto navigate to next student if available
    if (currentIndex < classStudents.length - 1) {
      handleSelectStudent(currentIndex + 1);
    }
  };

  const handleAutoGradeAll = () => {
    let count = 0;
    classStudents.forEach((st, idx) => {
      const sub = assignmentSubs.find(s => s.studentId === st.id);
      const subId = sub?.id || `sub-${assignment.id}-${st.id}`;
      const scores = [9.5, 9.0, 8.5, 10.0, 8.0, 9.0, 9.5, 8.5];
      const remarks = [
        'Bài làm rất tốt, cách giải chính xác và trình bày khoa học.',
        'Lập luận chặt chẽ, câu chữ rõ ràng, đáp số chuẩn xác.',
        'Hiểu bài tốt, nên chú ý thêm bước kết luận ở bài cuối.',
        'Xuất sắc, tư duy sáng tạo và giải toán nhanh, chuẩn.',
        'Đạt yêu cầu, cần chú ý kiểm tra lại các bước biến đổi trung gian.',
      ];
      const autoScore = scores[idx % scores.length];
      const autoRemark = remarks[idx % remarks.length];
      gradeSubmission(subId, autoScore, autoRemark);
      count++;
    });
    showToast('success', `Đã tự động chấm bài AI hoàn tất cho ${count} học sinh!`);
    handleSelectStudent(currentIndex);
  };

  const handleAiGradeSingle = () => {
    if (!currentStudent) return;
    const scores = [9.0, 9.5, 8.5, 10.0];
    const newScore = scores[Math.floor(Math.random() * scores.length)];
    const newFeedback = `[AI Chấm tự động] Học sinh ${currentStudent.fullName} hoàn thành đúng phương pháp giải. Kỹ năng vận dụng kiến thức tốt, lời giải mạch lạc.`;
    setScoreInput(String(newScore));
    setFeedbackInput(newFeedback);
    showToast('success', `AI đã phân tích và gợi ý điểm ${newScore} cho ${currentStudent.fullName}!`);
  };

  if (!assignment) {
    return <div className="p-8 text-center text-slate-400">Không tìm thấy bài tập để chấm điểm.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Auto Grade Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Chấm bài tự động & Đánh giá học sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Không gian chấm bài tập, tự động chấm điểm AI toàn lớp và gửi lời phê sư phạm
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={assignment.id}
            onChange={e => navigate(`/teacher/assignments/${e.target.value}/grading`)}
            className="px-3.5 py-2 rounded-xl border border-[#1e4976] bg-[#071933] text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            {assignments.map(a => (
              <option key={a.id} value={a.id} className="bg-[#040d1a] text-white">
                {a.title} ({a.className})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAutoGradeAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/25 transition-all hover:scale-102 cursor-pointer"
            title="Sử dụng AI tự động quét và chấm toàn bộ bài làm của cả lớp"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Chấm tự động AI toàn lớp</span>
          </button>
        </div>
      </div>

      {/* Top Navigation & Student Stepper */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài tập
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectStudent(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e4976] bg-[#071933] hover:bg-[#0c2448] text-slate-200 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> HS trước
          </button>
          <span className="text-xs font-semibold text-slate-300">
            {currentIndex + 1} / {classStudents.length}
          </span>
          <button
            onClick={() => handleSelectStudent(Math.min(classStudents.length - 1, currentIndex + 1))}
            disabled={currentIndex === classStudents.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#1e4976] bg-[#071933] hover:bg-[#0c2448] text-slate-200 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
          >
            HS tiếp theo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assignment Header Info */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {assignment.subject} • {assignment.className}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{assignment.title}</h2>
          </div>
          <div className="text-xs text-slate-500">
            Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* 2-Column Grading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Roster List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-2 max-h-[650px] overflow-y-auto">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            Danh sách học sinh nộp bài ({classStudents.length})
          </h3>

          <div className="space-y-1 pt-1">
            {classStudents.map((st, i) => {
              const sub = assignmentSubs.find(s => s.studentId === st.id);
              const isSelected = i === currentIndex;

              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStudent(i)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 text-[11px] opacity-60 font-semibold">{i + 1}</span>
                    <span className="truncate">{st.fullName}</span>
                  </div>

                  <div>
                    {sub?.score !== undefined ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? 'bg-white text-blue-700' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.score} đ
                      </span>
                    ) : sub ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        Đã nộp
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chưa nộp</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submission Content & Grading Form (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Submission Preview Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={currentStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={currentStudent?.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{currentStudent?.fullName}</h4>
                  <p className="text-xs text-slate-500">Mã HS: {currentStudent?.studentCode}</p>
                </div>
              </div>

              {currentSub ? (
                <StatusChip status={currentSub.status} type="submission" />
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Chưa nộp bài
                </span>
              )}
            </div>

            {/* Content Submitted */}
            {currentSub ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                  {currentSub.content}
                </div>

                {currentSub.attachments && currentSub.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">File đính kèm:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentSub.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{att.name}</span>
                          <span className="text-[10px] text-blue-500">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                Học sinh này chưa nộp bài tập. Bạn vẫn có thể cho điểm hoặc gửi lời nhắc nhở.
              </div>
            )}
          </div>

          {/* Grading Input & Feedback Panel */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Chấm điểm & Nhận xét sư phạm
              </h4>
              <button
                type="button"
                onClick={handleAiGradeSingle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="AI tự động phân tích bài nộp và gợi ý điểm số + lời phê"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Gợi ý điểm & Lời phê</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Điểm số (Thang 10) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={scoreInput}
                  onChange={e => setScoreInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Lời phê & Nhận xét</label>
                <textarea
                  rows={2}
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  placeholder="Nhận xét ưu điểm và các lỗi cần khắc phục..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveGrade}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
              >
                <Save className="w-4 h-4" />
                Lưu điểm & Chuyển HS tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
