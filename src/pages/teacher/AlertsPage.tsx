import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SystemAlert } from '../../types';
import { StatusChip } from '../../components/common/StatusChip';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  PhoneCall,
  Mail,
  User,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, selectedClass, updateAlertStatus, showToast } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const classAlerts = alerts.filter(a => a.classId === selectedClass?.id);

  const filtered = classAlerts.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  const handleStatusChange = (id: string, newStatus: SystemAlert['status']) => {
    updateAlertStatus(id, newStatus);
    showToast('success', 'Đã cập nhật trạng thái xử lý cảnh báo!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Hệ thống cảnh báo sớm học sinh: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tự động phát hiện nguy cơ vắng học nhiều, điểm số sa sút hoặc chưa nộp nhiều bài tập
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 font-bold border border-rose-200">
            {classAlerts.filter(a => a.status === 'NEW').length} cảnh báo mới cần xử lý
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Lọc theo:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="NEW">Mới phát hiện</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã giải quyết</option>
          </select>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="HIGH">Mức độ Cao</option>
            <option value="MEDIUM">Mức độ Trung bình</option>
            <option value="LOW">Mức độ Thấp</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Lớp học hiện tại không có cảnh báo nào</p>
            <p className="text-xs text-slate-400 mt-1">Tất cả học sinh đều duy trì chuyên cần và nộp bài đều đặn</p>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.status === 'RESOLVED'
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : alert.severity === 'HIGH'
                  ? 'bg-rose-50/60 border-rose-200 shadow-sm'
                  : 'bg-amber-50/60 border-amber-200 shadow-sm'
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <StatusChip status={alert.severity} type="alertSeverity" />
                  <StatusChip status={alert.status} type="alertStatus" />
                  <span className="font-extrabold text-sm text-slate-900">{alert.studentName}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {alert.status !== 'IN_PROGRESS' && alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'IN_PROGRESS')}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                  >
                    Đánh dấu đang xử lý
                  </button>
                )}

                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'RESOLVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã giải quyết xong
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
