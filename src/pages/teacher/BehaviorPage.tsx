import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BehaviorType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Smile, Plus, Frown, Award, Users, Trash2, Calendar } from 'lucide-react';

export const BehaviorPage: React.FC = () => {
  const { behaviors, students, selectedClass, addBehaviorRecord } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'POSITIVE' | 'NEEDS_IMPROVEMENT'>('all');

  // Form State
  const [studentId, setStudentId] = useState(classStudents[0]?.id || '');
  const [type, setType] = useState<BehaviorType>('POSITIVE');
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState(5);
  const [notes, setNotes] = useState('');

  const classBehaviors = behaviors.filter(b => b.classId === selectedClass?.id);
  const filtered = classBehaviors.filter(b => {
    if (filterType !== 'all' && b.type !== filterType) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = classStudents.find(s => s.id === studentId);
    if (!st || !title.trim()) return;

    addBehaviorRecord({
      studentId: st.id,
      studentName: st.fullName,
      classId: selectedClass?.id || 'cls-9a1',
      type,
      title,
      points: type === 'POSITIVE' ? Math.abs(points) : -Math.abs(points),
      notes,
      teacherName: 'Thầy Nguyễn Văn An',
    });

    setIsAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const positivePresets = [
    { title: 'Tích cực phát biểu xây dựng bài', points: 5 },
    { title: 'Giúp đỡ bạn cùng tiến bộ', points: 5 },
    { title: 'Hoàn thành xuất sắc nhiệm vụ được giao', points: 10 },
    { title: 'Có nhiều tiến bộ trong giờ học', points: 5 },
  ];

  const negativePresets = [
    { title: 'Nói chuyện riêng / mất trật tự', points: 2 },
    { title: 'Quên mang sách vở / bài tập', points: 3 },
    { title: 'Không làm bài tập về nhà', points: 5 },
    { title: 'Đi học muộn đầu giờ', points: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Smile className="w-6 h-6 text-emerald-400" />
            Nhật ký nề nếp & Hành vi học sinh: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ghi nhận các hành vi tích cực biểu dương và nhắc nhở nề nếp kỷ luật trên lớp
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
          Ghi nhận hành vi mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({classBehaviors.length})
        </button>
        <button
          onClick={() => setFilterType('POSITIVE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'POSITIVE' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tuyên dương / Tích cực ({classBehaviors.filter(b => b.type === 'POSITIVE').length})
        </button>
        <button
          onClick={() => setFilterType('NEEDS_IMPROVEMENT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'NEEDS_IMPROVEMENT' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cần nhắc nhở ({classBehaviors.filter(b => b.type === 'NEEDS_IMPROVEMENT').length})
        </button>
      </div>

      {/* Behaviors List */}
      <div className="space-y-3">
        {filtered.map(b => (
          <div
            key={b.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              b.type === 'POSITIVE'
                ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                : 'bg-rose-50/40 border-rose-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  b.type === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {b.type === 'POSITIVE' ? <Smile className="w-5 h-5" /> : <Frown className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{b.studentName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.type === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {b.type === 'POSITIVE' ? 'Tuyên dương' : 'Nhắc nhở'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-1">{b.title}</h4>
                {b.notes && <p className="text-xs text-slate-500 mt-0.5">{b.notes}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end text-xs">
              <span className="text-slate-400 font-medium">
                {new Date(b.date).toLocaleDateString('vi-VN')}
              </span>
              <span
                className={`px-3 py-1 rounded-xl font-black text-sm ${
                  b.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {b.points > 0 ? `+${b.points}` : b.points} đ
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* RECORD BEHAVIOR MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title="Ghi nhận hành vi nề nếp học sinh"
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
              Lưu ghi nhận
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn học sinh *</label>
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
            <label className="block font-bold text-slate-700 mb-1">Tính chất hành vi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('POSITIVE')}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                  type === 'POSITIVE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>Tuyên dương (+Điểm)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('NEEDS_IMPROVEMENT')}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                  type === 'NEEDS_IMPROVEMENT'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Frown className="w-4 h-4 text-rose-600" />
                <span>Nhắc nhở (-Điểm)</span>
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn nhanh mẫu hành vi phổ biến:</label>
            <div className="flex flex-wrap gap-1.5">
              {(type === 'POSITIVE' ? positivePresets : negativePresets).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTitle(p.title);
                    setPoints(p.points);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nội dung hành vi *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Hăng hái giải bài tập trên bảng..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mức điểm</label>
              <input
                type="number"
                min={1}
                max={20}
                value={points}
                onChange={e => setPoints(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
