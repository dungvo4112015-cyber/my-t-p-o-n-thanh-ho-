import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Mail, Send, User, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

export const ParentMessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { messages, sendMessage } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    sendMessage(subject, message, 'u-teacher-1', 'Thầy Nguyễn Văn An');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Mail className="w-6 h-6 text-cyan-400" />
          Hộp thư trao đổi giữa Phụ huynh & Giáo viên
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Kênh liên lạc chính thống bảo mật giữa gia đình và nhà trường
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Send message box (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Gửi tin nhắn mới
          </h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gửi tới:</label>
              <input
                type="text"
                disabled
                value="Thầy Nguyễn Văn An (GVCN 9A1 - Môn Toán)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chủ đề trao đổi *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="VD: Trao đổi về tình hình học tập môn Toán..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nội dung tin nhắn *</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Nhập nội dung chia sẻ hoặc thắc mắc gửi thầy cô..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
            >
              <Send className="w-4 h-4" />
              Gửi tin nhắn cho Thầy An
            </button>
          </form>
        </div>

        {/* Message Threads (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Lịch sử các cuộc trao đổi ({messages.length})
          </h3>

          <div className="space-y-4">
            {messages.map(m => (
              <div key={m.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-sm text-slate-900">{m.subject}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                      m.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status === 'REPLIED' ? 'Đã có phản hồi' : 'Đang chờ thầy cô trả lời'}
                  </span>
                </div>

                {/* Parent's message */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  <p className="text-[11px] font-bold text-slate-400 mb-1">
                    Phụ huynh gửi • {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  {m.message}
                </div>

                {/* Teacher's reply */}
                {m.reply && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-950 leading-relaxed ml-4">
                    <p className="text-[11px] font-bold text-blue-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {m.teacherName} đã phản hồi • {m.repliedAt && new Date(m.repliedAt).toLocaleDateString('vi-VN')}
                    </p>
                    {m.reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
