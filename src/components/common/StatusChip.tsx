import React from 'react';
import { AttendanceStatus, SubmissionStatus, AlertSeverity, AlertStatus } from '../../types';

interface StatusChipProps {
  status: string;
  type?: 'attendance' | 'submission' | 'alertSeverity' | 'alertStatus' | 'gender';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'attendance', className = '' }) => {
  if (type === 'attendance') {
    const s = status as AttendanceStatus;
    switch (s) {
      case 'PRESENT':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ${className}`}>Có mặt</span>;
      case 'EXCUSED':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 ${className}`}>Vắng phép</span>;
      case 'UNEXCUSED':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 ${className}`}>Vắng không phép</span>;
      case 'LATE':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ${className}`}>Đi trễ</span>;
      case 'EARLY_LEAVE':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 ${className}`}>Về sớm</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  }

  if (type === 'submission') {
    const s = status as SubmissionStatus;
    switch (s) {
      case 'PENDING':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 ${className}`}>Chưa làm</span>;
      case 'SUBMITTED':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 ${className}`}>Đã nộp</span>;
      case 'LATE':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ${className}`}>Nộp muộn</span>;
      case 'GRADED':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ${className}`}>Đã chấm</span>;
      case 'REDO_REQUIRED':
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 ${className}`}>Làm lại</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  }

  if (type === 'alertSeverity') {
    const s = status as AlertSeverity;
    switch (s) {
      case 'CRITICAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Cao</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Trung bình</span>;
      case 'LOW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Thấp</span>;
    }
  }

  if (type === 'alertStatus') {
    const s = status as AlertStatus;
    switch (s) {
      case 'NEW':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Mới</span>;
      case 'REVIEWED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Đã xem</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Đang xử lý</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Đã giải quyết</span>;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 ${className}`}>
      {status}
    </span>
  );
};
