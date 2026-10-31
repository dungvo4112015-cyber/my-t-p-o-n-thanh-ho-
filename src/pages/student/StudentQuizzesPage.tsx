import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Quiz, QuizQuestion } from '../../types';
import { Modal } from '../../components/common/Modal';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  Play,
  CheckCircle2,
  Award,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const StudentQuizzesPage: React.FC = () => {
  const { quizzes, showToast } = useApp();

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; correctCount: number } | null>(null);

  useEffect(() => {
    let timer: any;
    if (activeQuiz && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, isSubmitted, timeLeft]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setTimeLeft(quiz.durationMinutes * 60);
    setUserAnswers({});
    setIsSubmitted(false);
    setQuizResult(null);
  };

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    let correctCount = 0;

    activeQuiz.questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === q.correctAnswer) {
        score += q.points;
        correctCount++;
      }
    });

    setQuizResult({
      score: Number(score.toFixed(1)),
      total: activeQuiz.totalPoints,
      correctCount,
    });
    setIsSubmitted(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast('success', `Đã nộp bài kiểm tra! Kết quả của bạn: ${score.toFixed(1)} / ${activeQuiz.totalPoints} điểm.`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-purple-400" />
          Bài kiểm tra & Khảo sát trực tuyến
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Luyện tập trắc nghiệm củng cố kiến thức, bấm giờ tự động và chấm điểm tức thời
        </p>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzes.map(quiz => (
          <div
            key={quiz.id}
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {quiz.subject}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> {quiz.durationMinutes} phút
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 mt-2">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {quiz.questions.length} câu hỏi • Thang điểm {quiz.totalPoints} điểm
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Đã mở cho lớp 9A1</span>
              <button
                onClick={() => handleStartQuiz(quiz)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-102"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Vào làm bài
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QUIZ TAKING MODAL */}
      {activeQuiz && (
        <Modal
          isOpen={!!activeQuiz}
          onClose={() => {
            if (!isSubmitted && !confirm('Bạn đang làm bài kiểm tra, rời đi sẽ hủy kết quả?')) return;
            setActiveQuiz(null);
          }}
          maxWidth="3xl"
          title={
            <div className="flex items-center justify-between w-full pr-8">
              <span className="truncate max-w-md">{activeQuiz.title}</span>
              {!isSubmitted && (
                <span className="text-xs font-mono font-bold px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          }
          footer={
            !isSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4" />
                Nộp bài & Xem kết quả
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            )
          }
        >
          <div className="space-y-6 text-xs">
            {/* If Submitted, show score summary card */}
            {isSubmitted && quizResult && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Hoàn thành bài kiểm tra!</h3>
                <p className="text-2xl font-black text-emerald-600">
                  {quizResult.score} / {quizResult.total} điểm
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  Trả lời đúng {quizResult.correctCount} / {activeQuiz.questions.length} câu hỏi
                </p>
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, idx) => {
                const answer = userAnswers[q.id];
                const isCorrect = isSubmitted && answer === q.correctAnswer;
                const isWrong = isSubmitted && answer && answer !== q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-rose-300 bg-rose-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        Câu {idx + 1}: {q.question}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">({q.points} điểm)</span>
                    </div>

                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = answer === opt;
                          const isRightOption = isSubmitted && opt === q.correctAnswer;

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectAnswer(q.id, opt)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${
                                isRightOption
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                  : isOptionSelected && isWrong
                                  ? 'bg-rose-100 border-rose-400 text-rose-950'
                                  : isOptionSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'FILL_BLANK' && (
                      <div className="pt-2">
                        <input
                          type="text"
                          disabled={isSubmitted}
                          value={answer || ''}
                          onChange={e => handleSelectAnswer(q.id, e.target.value)}
                          placeholder="Nhập đáp án số hoặc chữ..."
                          className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    )}

                    {isSubmitted && q.explanation && (
                      <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                        <strong className="text-slate-800">Giải thích: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
