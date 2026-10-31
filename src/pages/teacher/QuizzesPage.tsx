import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Quiz, QuizQuestion } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  HelpCircle,
  Plus,
  Clock,
  Shuffle,
  Users,
  Award,
  Play,
  CheckCircle2,
  Trash2,
  BarChart2,
} from 'lucide-react';

export const QuizzesPage: React.FC = () => {
  const { quizzes, selectedClass, addQuiz, showToast } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuizForPreview, setSelectedQuizForPreview] = useState<Quiz | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [subject, setSubject] = useState('Toán học');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-1',
      question: 'Điều kiện xác định của biểu thức √(3x - 9) là gì?',
      type: 'SINGLE',
      options: ['x ≥ 3', 'x > 3', 'x ≤ 3', 'x < 3'],
      correctAnswer: 'x ≥ 3',
      explanation: '3x - 9 ≥ 0 <=> 3x ≥ 9 <=> x ≥ 3',
      points: 2.5,
    },
    {
      id: 'q-2',
      question: 'Phương trình x^2 - 4 = 0 có mấy nghiệm phân biệt?',
      type: 'SINGLE',
      options: ['1 nghiệm', '2 nghiệm (x = ±2)', 'Vô nghiệm', 'Vô số nghiệm'],
      correctAnswer: '2 nghiệm (x = ±2)',
      points: 2.5,
    },
  ]);

  const classQuizzes = quizzes.filter(q => q.classId === selectedClass?.id);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        question: 'Câu hỏi mới...',
        type: 'SINGLE',
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: 'Phương án A',
        points: 2.5,
      },
    ]);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addQuiz({
      title,
      classId: selectedClass?.id || 'cls-9a1',
      className: selectedClass?.name || 'Lớp 9A1',
      subject,
      durationMinutes,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      shuffleQuestions,
      shuffleOptions: true,
      questions,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      isPublished: true,
    });

    setIsCreateModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-purple-400" />
            Ngân hàng câu hỏi & Đề kiểm tra trực tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tạo đề kiểm tra 15 phút, 1 tiết, khảo sát nhanh và chấm điểm tự động
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/teacher/question-bank"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#071933] hover:bg-[#0b2447] text-cyan-300 border border-cyan-800/80 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Vào Ngân hàng câu hỏi số
          </a>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo bài kiểm tra mới
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classQuizzes.map(quiz => (
          <div
            key={quiz.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {quiz.subject}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {quiz.durationMinutes} phút
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 mt-2">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Số lượng: <strong className="text-slate-700">{quiz.questions.length} câu hỏi</strong> • Thang điểm: {quiz.totalPoints}đ
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>Đã làm: <strong className="text-slate-800">{quiz.attemptsCount}</strong> lượt</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQuizForPreview(quiz)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
                >
                  Xem đề & Đáp án
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE QUIZ MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="2xl"
        title="Tạo đề kiểm tra trực tuyến"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-xs"
            >
              Tạo và công bố đề
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài kiểm tra *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Kiểm tra 15 phút: Căn bậc hai và Hằng đẳng thức"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài (phút)</label>
              <input
                type="number"
                min={5}
                max={90}
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={e => setShuffleQuestions(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Tự động đảo thứ tự câu hỏi và phương án</span>
            </label>
          </div>

          {/* Questions list */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Danh sách câu hỏi ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Câu {idx + 1}:</span>
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={e => {
                    const updated = [...questions];
                    updated[idx].question = e.target.value;
                    setQuestions(updated);
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* PREVIEW QUIZ MODAL */}
      {selectedQuizForPreview && (
        <Modal
          isOpen={!!selectedQuizForPreview}
          onClose={() => setSelectedQuizForPreview(null)}
          maxWidth="2xl"
          title={selectedQuizForPreview.title}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-purple-50 text-purple-900 rounded-xl font-bold">
              <span>Thời gian: {selectedQuizForPreview.durationMinutes} phút</span>
              <span>Tổng số: {selectedQuizForPreview.questions.length} câu</span>
            </div>

            <div className="space-y-4">
              {selectedQuizForPreview.questions.map((q, i) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-bold text-slate-900">
                    Câu {i + 1}: {q.question}
                  </h4>
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs ${
                            opt === q.correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 italic pt-1">Giải thích: {q.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
