import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { Users2, Shuffle, Copy, Check } from 'lucide-react';

interface GroupMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupMakerModal: React.FC<GroupMakerModalProps> = ({ isOpen, onClose }) => {
  const { students, selectedClass, showToast } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  const [mode, setMode] = useState<'byGroupCount' | 'byMemberCount'>('byGroupCount');
  const [value, setValue] = useState(4);
  const [balanceGender, setBalanceGender] = useState(true);
  const [groups, setGroups] = useState<{ id: number; name: string; members: typeof classStudents }[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = () => {
    if (classStudents.length === 0) return;

    let pool = [...classStudents];

    // Simple gender balance if enabled
    if (balanceGender) {
      const males = pool.filter(s => s.gender === 'Nam').sort(() => 0.5 - Math.random());
      const females = pool.filter(s => s.gender === 'Nữ').sort(() => 0.5 - Math.random());
      pool = [];
      const maxLen = Math.max(males.length, females.length);
      for (let i = 0; i < maxLen; i++) {
        if (males[i]) pool.push(males[i]);
        if (females[i]) pool.push(females[i]);
      }
    } else {
      pool.sort(() => 0.5 - Math.random());
    }

    let numGroups = 4;
    if (mode === 'byGroupCount') {
      numGroups = Math.max(1, value);
    } else {
      numGroups = Math.max(1, Math.ceil(pool.length / Math.max(1, value)));
    }

    const result: { id: number; name: string; members: typeof classStudents }[] = Array.from(
      { length: numGroups },
      (_, i) => ({
        id: i + 1,
        name: `Nhóm ${i + 1}`,
        members: [],
      })
    );

    pool.forEach((student, index) => {
      const targetGroup = result[index % numGroups];
      targetGroup.members.push(student);
    });

    setGroups(result);
  };

  const copyToClipboard = () => {
    if (groups.length === 0) return;
    const text = groups
      .map(g => `${g.name} (${g.members.length} HS):\n` + g.members.map(m => ` - ${m.fullName}`).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('success', 'Đã sao chép danh sách nhóm vào bộ nhớ tạm!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" title="Chia nhóm học tập ngẫu nhiên">
      <div className="space-y-5">
        {/* Settings Bar */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Chia theo:</label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="byGroupCount">Số lượng nhóm</option>
                <option value="byMemberCount">Số người mỗi nhóm</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">
                {mode === 'byGroupCount' ? 'Số nhóm:' : 'Học sinh/nhóm:'}
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={value}
                onChange={e => setValue(parseInt(e.target.value) || 2)}
                className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={balanceGender}
                onChange={e => setBalanceGender(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Cân bằng Nam/Nữ</span>
            </label>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Tạo nhóm
            </button>
          </div>
        </div>

        {/* Groups Output */}
        {groups.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <Users2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">
              Thiết lập số nhóm mong muốn và bấm <span className="font-semibold text-blue-600">"Tạo nhóm"</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Kết quả: {groups.length} nhóm ({classStudents.length} học sinh)
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Đã sao chép' : 'Sao chép danh sách'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1">
              {groups.map(group => (
                <div key={group.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                    <span className="font-bold text-xs text-blue-700">{group.name}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{group.members.length} bạn</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {group.members.map((m, idx) => (
                      <li key={m.id} className="flex items-center justify-between">
                        <span>
                          {idx + 1}. {m.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400">({m.gender})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
