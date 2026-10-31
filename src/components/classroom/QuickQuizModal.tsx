import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { HelpCircle, Play, CheckCircle2, RotateCcw, BarChart3, Clock } from 'lucide-react';

interface QuickQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({ isOpen, onClose }) => {
  const { selectedClass } = useApp();

  const [question, setQuestion] = useState('Nghiệm của phương trình 2x - 6 = 0 là bao nhiêu?');
  const [options, setOptions] = useState(['x = 3', 'x = -3', 'x = 6', 'x = 0']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [duration, setDuration] = useState(30); // 30s
  const [remainingTime, setRemainingTime] = useState(30);

  const [state, setState] = useState<'SETUP' | 'RUNNING' | 'RESULTS'>('SETUP');
  const [votes, setVotes] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    let timer: any;
    if (state === 'RUNNING' && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(t => {
          if (t <= 1) {
            clearInterval(timer);
            setState('RESULTS');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, remainingTime]);

  const handleStart = () => {
    setRemainingTime(duration);
    setState('RUNNING');

    // Simulate realistic live votes from 35 students in real time
    const simulatedVotes = [0, 0, 0, 0];
    const totalStudents = 35;
    for (let i = 0; i < totalStudents; i++) {
      // 70% chance to pick correct
      const isRight = Math.random() < 0.75;
      if (isRight) {
        simulatedVotes[correctIndex]++;
      } else {
        const wrongIdx = (correctIndex + 1 + Math.floor(Math.random() * 3)) % 4;
        simulatedVotes[wrongIdx]++;
      }
    }
    setVotes(simulatedVotes);
  };

  const handleReset = () => {
    setState('SETUP');
    setRemainingTime(duration);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0) || 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" title="Khảo sát & Câu hỏi nhanh tức thời trên lớp">
      <div className="space-y-5">
        {state === 'SETUP' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi nhanh:</label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nhập câu hỏi thảo luận hoặc kiểm tra nhanh..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Các phương án đáp án (chọn radio để đặt đáp án đúng):</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="w-6 text-xs font-bold text-slate-500">{String.fromCharCode(65 + i)}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-bold text-slate-700">Thời gian trả lời:</label>
              <select
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value={15}>15 giây</option>
                <option value={30}>30 giây</option>
                <option value={60}>60 giây</option>
                <option value={90}>90 giây</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Bắt đầu khảo sát lớp
              </button>
            </div>
          </div>
        )}

        {state === 'RUNNING' && (
          <div className="p-6 text-center space-y-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-lg animate-pulse">
              <Clock className="w-5 h-5" />
              <span>Thời gian còn lại: {remainingTime}s</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 leading-snug">{question}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-800 shadow-xs"
                >
                  <span className="text-blue-600 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setState('RESULTS')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Kết thúc sớm & Xem kết quả
              </button>
            </div>
          </div>
        )}

        {state === 'RESULTS' && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Câu hỏi:</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">{question}</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Đáp án chính xác: <span className="font-bold">{String.fromCharCode(65 + correctIndex)}. {options[correctIndex]}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phân bố câu trả lời của học sinh:</h5>
              {options.map((opt, i) => {
                const count = votes[i];
                const pct = Math.round((count / totalVotes) * 100);
                const isCorrect = i === correctIndex;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {String.fromCharCode(65 + i)}. {opt} {isCorrect && '✓ (Đúng)'}
                      </span>
                      <span className="text-slate-500">
                        {count} lượt ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCorrect ? 'bg-emerald-500' : 'bg-blue-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Tạo câu hỏi mới
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
