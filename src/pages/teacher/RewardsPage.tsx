import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { RewardBadge } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Award, Plus, Sparkles, Star, Trophy, Rocket, ShieldCheck, HeartHandshake } from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { rewards, students, selectedClass, addRewardBadge, showToast } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState(classStudents[0]?.id || '');
  const [category, setCategory] = useState<RewardBadge['category']>('Ngôi sao tuần');
  const [title, setTitle] = useState('Ngôi sao tuần 5');
  const [reason, setReason] = useState('Có nhiều tiến bộ vượt bậc và đạt kết quả cao trong tuần học');

  const badgeIcons = {
    'Ngôi sao tuần': '⭐',
    'Chăm chỉ': '🐝',
    'Tiến bộ vượt bậc': '🚀',
    'Chuyên cần vàng': '🏆',
    'Thiện nguyện': '🤝',
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = classStudents.find(s => s.id === studentId);
    if (!st) return;

    addRewardBadge({
      title,
      category,
      icon: badgeIcons[category],
      studentId: st.id,
      studentName: st.fullName,
      className: selectedClass?.name || 'Lớp 9A1',
      reason,
      awardedBy: 'Thầy Nguyễn Văn An',
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            Thi đua & Vinh danh khen thưởng: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Biểu dương thành tích, vinh danh nỗ lực và trao tặng huy hiệu động viên học sinh
          </p>
        </div>

        <button
          onClick={() => {
            setStudentId(classStudents[0]?.id || '');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Trao tặng huy hiệu mới
        </button>
      </div>

      {/* Philosophy banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Định hướng sư phạm EdTech:</strong> Hệ thống ưu tiên biểu dương sự tiến bộ và nỗ lực cá nhân của từng học sinh để lan tỏa năng lượng tích cực, hạn chế tạo áp lực thứ hạng.
        </span>
      </div>

      {/* Rewards Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rewards.map(rew => (
          <div
            key={rew.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {rew.icon}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {rew.category}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{rew.title}</h3>
                <p className="text-xs font-bold text-blue-700 mt-0.5">{rew.studentName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{rew.reason}"
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Người trao: {rew.awardedBy}</span>
              <span>{new Date(rew.awardedDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AWARD BADGE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        title="Trao tặng huy hiệu vinh danh"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-xs"
            >
              Vinh danh học sinh
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn học sinh được vinh danh *</label>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              {classStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hạng mục vinh danh</label>
            <select
              value={category}
              onChange={e => {
                const cat = e.target.value as RewardBadge['category'];
                setCategory(cat);
                setTitle(`${cat} - Tháng ${new Date().getMonth() + 1}`);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="Ngôi sao tuần">⭐ Ngôi sao tuần</option>
              <option value="Chăm chỉ">🐝 Chăm chỉ cần mẫn</option>
              <option value="Tiến bộ vượt bậc">🚀 Tiến bộ vượt bậc</option>
              <option value="Chuyên cần vàng">🏆 Chuyên cần vàng</option>
              <option value="Thiện nguyện">🤝 Giúp đỡ bạn bè / Thiện nguyện</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Danh hiệu hiển thị *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lý do tuyên dương & Lời khen</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="VD: Luôn năng nổ phát biểu, kiên trì giải bài tập khó..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
