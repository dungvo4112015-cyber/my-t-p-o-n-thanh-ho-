import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { Shuffle, Users, Check, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RandomPickerModal: React.FC<RandomPickerModalProps> = ({ isOpen, onClose }) => {
  const { students, selectedClass } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  const [countToPick, setCountToPick] = useState(1);
  const [avoidRepeats, setAvoidRepeats] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = () => {
    if (classStudents.length === 0) return;
    setIsPicking(true);

    let pool = classStudents.map(s => s.fullName);
    if (avoidRepeats && history.length < pool.length) {
      pool = pool.filter(name => !history.includes(name));
      if (pool.length === 0) pool = classStudents.map(s => s.fullName);
    }

    setTimeout(() => {
      // Shuffle
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, Math.min(countToPick, shuffled.length));

      setSelectedStudents(picked);
      setHistory(prev => [...picked, ...prev]);
      setIsPicking(false);

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
      });
    }, 400);
  };

  const handleResetHistory = () => {
    setHistory([]);
    setSelectedStudents([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg" title="Bốc thăm chọn học sinh ngẫu nhiên">
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Số lượng học sinh cần chọn:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setCountToPick(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    countToPick === n
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={avoidRepeats}
              onChange={e => setAvoidRepeats(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Tránh gọi lặp lại</span>
          </label>
        </div>

        {/* Display selected */}
        <div className="min-h-36 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-tr from-slate-50 to-blue-50/50 border border-blue-100 text-center">
          {isPicking ? (
            <div className="text-blue-600 font-bold animate-pulse text-base">Đang bốc thăm ngẫu nhiên...</div>
          ) : selectedStudents.length > 0 ? (
            <div className="space-y-3 w-full">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Học sinh được gọi</span>
              <div className="flex flex-wrap justify-center gap-2.5">
                {selectedStudents.map((st, i) => (
                  <div
                    key={i}
                    className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-slate-900 font-extrabold text-base shadow-sm animate-in zoom-in-95 duration-150 flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              Chọn số lượng và bấm <span className="font-semibold text-blue-600">"Bốc thăm"</span> để chọn học sinh
            </div>
          )}
        </div>

        {/* History of calls */}
        {history.length > 0 && (
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Đã gọi {history.length} lượt</span>
              <button
                onClick={handleResetHistory}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa lịch sử
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {history.map((name, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handlePick}
            disabled={isPicking || classStudents.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Shuffle className="w-4 h-4" />
            Bốc thăm ngay
          </button>
        </div>
      </div>
    </Modal>
  );
};
