import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell } from 'lucide-react';

interface CountdownTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CountdownTimerModal: React.FC<CountdownTimerModalProps> = ({ isOpen, onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(300); // Default 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, remainingSeconds]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.6); // C6
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      // Audio unsupported or blocked
    }
  };

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const togglePlay = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Đồng hồ đếm ngược lớp học">
      <div className="flex flex-col items-center justify-center p-4 space-y-6">
        {/* Preset Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: '1 phút', sec: 60 },
            { label: '3 phút', sec: 180 },
            { label: '5 phút', sec: 300 },
            { label: '10 phút', sec: 600 },
            { label: '15 phút', sec: 900 },
          ].map(p => (
            <button
              key={p.sec}
              onClick={() => handleSelectPreset(p.sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                totalSeconds === p.sec
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={remainingSeconds < 30 ? '#EF4444' : '#2563EB'}
              strokeWidth="8"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className={`text-5xl font-black tracking-tight tabular-nums ${
                remainingSeconds < 30 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
              {isRunning ? 'Đang chạy' : remainingSeconds === 0 ? 'Hết giờ!' : 'Tạm dừng'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Đặt lại"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isRunning ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt đầu</span>
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};
