import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Volume2, VolumeX, Maximize2, Trash2, Award } from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ isOpen, onClose }) => {
  const { students, selectedClass } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  // Pool of students for wheel
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [spinDuration, setSpinDuration] = useState(5); // seconds
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize pool from selected class students
  useEffect(() => {
    if (classStudents.length > 0) {
      setCandidates(classStudents.map(s => s.fullName));
    } else {
      setCandidates(['Lê Hải Đăng', 'Trần Mai Anh', 'Nguyễn Minh Khang', 'Hoàng Thùy Linh', 'Vũ Đức Anh', 'Đặng Thu Thảo', 'Phan Gia Huy', 'Bùi Ngọc Diệp']);
    }
  }, [selectedClass?.id, classStudents.length]);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6',
    '#6366F1', '#F97316', '#84CC16', '#0EA5E9'
  ];

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;
    const count = candidates.length;

    ctx.clearRect(0, 0, width, height);

    if (count === 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đã hết học sinh trong danh sách quay', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / count;

    // Slices
    for (let i = 0; i < count; i++) {
      const angle = rotation + i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = count > 15 ? 'bold 12px sans-serif' : 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      // Truncate name if too long
      const name = candidates[i].length > 14 ? candidates[i].substring(0, 12) + '...' : candidates[i];
      ctx.fillText(name, radius - 20, 5);
      ctx.restore();
    }

    // Center Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QUAY', centerX, centerY + 4);
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [candidates]);

  const spin = () => {
    if (isSpinning || candidates.length === 0) return;
    setIsSpinning(true);
    setSelectedWinner(null);

    const count = candidates.length;
    const sliceAngle = (2 * Math.PI) / count;

    // Choose random winner
    const winningIndex = Math.floor(Math.random() * count);

    // Calculate target angle to point the top arrow to the winner
    // Arrow is at the top: angle 3*PI/2 (270 deg)
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const startRotation = rotationRef.current % (2 * Math.PI);
    const targetSliceCenter = (3 * Math.PI) / 2 - (winningIndex * sliceAngle + sliceAngle / 2);
    const totalRotationNeeded = extraSpins * 2 * Math.PI + (targetSliceCenter - startRotation);

    const startTime = performance.now();
    const duration = spinDuration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startRotation + totalRotationNeeded * easeOut;
      rotationRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winner = candidates[winningIndex];
        setSelectedWinner(winner);
        setHistory(prev => [winner, ...prev]);

        // Celebration Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Web Audio beep sound if enabled
        if (soundEnabled) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch (e) {
            // AudioContext not allowed or unsupported
          }
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const removeWinnerFromPool = () => {
    if (!selectedWinner) return;
    setCandidates(prev => prev.filter(c => c !== selectedWinner));
    setSelectedWinner(null);
  };

  const resetPool = () => {
    if (classStudents.length > 0) {
      setCandidates(classStudents.map(s => s.fullName));
    }
    setSelectedWinner(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" title="Vòng quay may mắn - Gọi tên học sinh">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Canvas Wheel & Pointer */}
        <div className="md:col-span-2 flex flex-col items-center justify-center relative">
          {/* Arrow Pointer */}
          <div className="z-10 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-rose-600 -mb-2 filter drop-shadow" />

          <div className="relative p-2 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full shadow-inner border border-slate-300">
            <canvas ref={canvasRef} width={360} height={360} className="rounded-full shadow-lg" />
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={spin}
              disabled={isSpinning || candidates.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
            </button>

            <button
              onClick={resetPool}
              disabled={isSpinning}
              title="Khôi phục danh sách đầy đủ"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Right: Winner Card & Pool Controls */}
        <div className="space-y-4">
          {/* Winner display */}
          {selectedWinner ? (
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 text-center animate-in zoom-in-95 duration-200 shadow-sm">
              <div className="inline-flex p-2.5 rounded-full bg-amber-500 text-white shadow-md mb-2">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Chúc mừng học sinh</p>
              <h4 className="text-xl font-extrabold text-slate-900 mt-1">{selectedWinner}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedClass?.name || 'Lớp 9A1'}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={removeWinnerFromPool}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Loại khỏi lượt tiếp
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Bấm <span className="font-bold text-blue-600">"QUAY NGAY"</span> để chọn học sinh ngẫu nhiên lên bảng hoặc trả lời câu hỏi
            </div>
          )}

          {/* Candidates count & settings */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Danh sách tham gia ({candidates.length})</span>
              <span className="text-[11px] text-slate-400">{selectedClass?.name}</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
              {candidates.map((name, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 text-slate-700">
                  <span>{name}</span>
                  <button
                    onClick={() => setCandidates(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-500 text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Call history */}
          {history.length > 0 && (
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Lịch sử lượt gọi gần đây: </span>
              {history.slice(0, 4).join(', ')}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
