import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Award, Sparkles, Trophy, Star, CheckCircle2 } from 'lucide-react';

export const StudentAchievementsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { rewards, students } = useApp();

  const studentId = currentUser.studentId || 'hs-1';
  const myRewards = rewards.filter(r => r.studentId === studentId);
  const myInfo = students.find(s => s.id === studentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-400" />
          Bộ sưu tập huy hiệu & Vinh danh học tập
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Ghi nhận những dấu mốc tiến bộ, nỗ lực và thành tích rực rỡ của em trong năm học
        </p>
      </div>

      {/* Points Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            ⭐
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-100 font-bold">Điểm rèn luyện tích lũy</span>
            <h2 className="text-3xl font-black">{myInfo?.rewardPoints ?? 125} Điểm</h2>
            <p className="text-xs text-amber-100 mt-0.5">Xếp hạng gương mẫu: Hạng A+</p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <span className="text-xs text-amber-100">Đã mở khóa:</span>
          <p className="text-xl font-extrabold">{myRewards.length} / 5 Huy hiệu</p>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {myRewards.map(rew => (
          <div
            key={rew.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-100 to-orange-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-md">
              {rew.icon}
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {rew.category}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mt-2">{rew.title}</h3>
              <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">"{rew.reason}"</p>
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              Trao ngày: {new Date(rew.awardedDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
