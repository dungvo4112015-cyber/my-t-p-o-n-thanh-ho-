import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Announcement } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Bell, Plus, Send, Clock, Users, AlertCircle } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, selectedClass, addAnnouncement } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<Announcement['targetRole']>('ALL');
  const [priority, setPriority] = useState<Announcement['priority']>('NORMAL');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title,
      content,
      senderName: 'Thầy Nguyễn Văn An',
      senderRole: 'TEACHER',
      targetRole,
      classId: selectedClass?.id,
      className: selectedClass?.name,
      priority,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setContent('');
  };

  const getPriorityBadge = (p: Announcement['priority']) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Quan trọng</span>;
      case 'NORMAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">Thông thường</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">Bản tin</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-cyan-400" />
            Bản tin & Thông báo lớp học: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Gửi thông báo tới Học sinh và Phụ huynh về lịch thi, họp lớp và các sự kiện
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo thông báo mới
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(anc => (
          <div
            key={anc.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getPriorityBadge(anc.priority)}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Gửi tới: {anc.targetRole === 'ALL' ? 'Toàn bộ Lớp & Phụ huynh' : anc.targetRole === 'PARENTS' ? 'Chỉ Phụ huynh' : 'Chỉ Học sinh'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(anc.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">{anc.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">{anc.content}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Người phát: <strong>{anc.senderName}</strong></span>
              <span>Đã xem: {anc.readCount} / {anc.totalRecipients} người nhận</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title="Phát thông báo mới"
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
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Phát thông báo ngay
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Lịch thi giữa kỳ I & Nhắc nhở đồng phục"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đối tượng nhận tin</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="ALL">Toàn bộ Lớp & Phụ huynh</option>
                <option value="PARENTS">Chỉ gửi Phụ huynh</option>
                <option value="STUDENTS">Chỉ gửi Học sinh</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="NORMAL">Thông thường</option>
                <option value="HIGH">Quan trọng</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Soạn thảo thông điệp thông báo..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
