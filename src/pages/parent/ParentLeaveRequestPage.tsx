import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Calendar, Plus, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const ParentLeaveRequestPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, addLeaveRequest, showToast } = useApp();

  const [fromDate, setFromDate] = useState('2026-10-10');
  const [toDate, setToDate] = useState('2026-10-10');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState(currentUser.phone || '0933221100');

  const myRequests = leaveRequests.filter(l => l.studentName === 'Lê Hải Đăng');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('error', 'Vui lòng nhập lý do xin phép nghỉ học!');
      return;
    }

    addLeaveRequest({
      studentId: 'hs-1',
      studentName: 'Lê Hải Đăng',
      className: 'Lớp 9A1',
      parentName: currentUser.name,
      parentPhone,
      fromDate,
      toDate,
      reason,
    });

    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Calendar className="w-6 h-6 text-amber-400" />
          Đơn xin phép nghỉ học trực tuyến
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Gửi đơn xin phép nghỉ ốm hoặc việc gia đình tới Giáo viên chủ nhiệm lớp 9A1
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Send Request (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-600" />
            Soạn đơn xin nghỉ học
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Học sinh:</label>
              <input
                type="text"
                disabled
                value="Lê Hải Đăng (Lớp 9A1)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nghỉ từ ngày:</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đến ngày:</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ khẩn cấp *</label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lý do xin nghỉ học chi tiết *</label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="VD: Cháu bị sốt cao cần theo dõi tại bệnh viện, gia đình có việc hiếu..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
            >
              <Send className="w-4 h-4" />
              Gửi đơn cho Thầy chủ nhiệm
            </button>
          </form>
        </div>

        {/* History List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Lịch sử các đơn đã gửi ({myRequests.length})
          </h3>

          <div className="space-y-3">
            {myRequests.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">
                    Nghỉ: {new Date(r.fromDate).toLocaleDateString('vi-VN')} → {new Date(r.toDate).toLocaleDateString('vi-VN')}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Chờ giáo viên duyệt'}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">"{r.reason}"</p>

                {r.responseNote && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                    <strong>Thầy An phản hồi: </strong>
                    <span>{r.responseNote}</span>
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
