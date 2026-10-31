import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  School,
  Users,
  UserCheck,
  GraduationCap,
  History,
  Database,
  Settings,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { classes, students, auditLogs } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-semibold text-blue-300 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Hệ thống Quản trị Toàn trường • THCS Chu Văn An
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Trung tâm Điều hành & Quản trị Hệ thống
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Kiến trúc đa trường học (Multi-tenant ready), giám sát phân quyền RBAC và theo dõi nhật ký hoạt động kiểm toán (Audit Logs) thời gian thực.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
            >
              <Users className="w-4 h-4" />
              Quản lý tài khoản
            </button>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <History className="w-4 h-4" />
              Nhật ký kiểm toán (Audit)
            </button>
            <button
              onClick={() => navigate('/admin/backup')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <Database className="w-4 h-4" />
              Sao lưu & Dữ liệu
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số lớp học"
          value={`${classes.length} Lớp`}
          subtitle="Khối 6, 7, 8, 9"
          icon={School}
          color="blue"
          onClick={() => navigate('/admin/classes')}
        />

        <StatCard
          title="Tổng số học sinh"
          value={`${students.length} HS`}
          subtitle="Tỷ lệ chuyên cần 98.2%"
          icon={GraduationCap}
          color="emerald"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Đội ngũ giáo viên"
          value="45 GV"
          subtitle="100% đạt chuẩn Bộ GD&ĐT"
          icon={UserCheck}
          color="purple"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Nhật ký Audit Log"
          value={`${auditLogs.length} sự kiện`}
          subtitle="Ghi nhận mọi thao tác nhạy cảm"
          icon={History}
          color="rose"
          onClick={() => navigate('/admin/audit-logs')}
        />
      </div>

      {/* Audit Log Preview & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Activities (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Hoạt động hệ thống mới nhất (Audit Trail)
            </h3>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem toàn bộ →
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900">{log.userName}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                      {log.userRole}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN')} • {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{log.details}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Module: {log.module}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture Specifications Card (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-purple-600" />
            Kiến trúc Hệ thống & An toàn
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Database & RLS</span>
              <p className="text-slate-600">PostgreSQL / Supabase Schema với Row Level Security phân lập quyền theo Role.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Kiểm soát truy cập (RBAC)</span>
              <p className="text-slate-600">Phân quyền module + action chi tiết cho Admin, Teacher, Student, Parent.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Bảo mật dữ liệu nhạy cảm</span>
              <p className="text-slate-600">Audit log ghi vết IP, thời gian và dữ liệu trước/sau khi sửa điểm hoặc điểm danh.</p>
            </div>

            <button
              onClick={() => navigate('/admin/backup')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors"
            >
              Sao lưu dữ liệu tức thì
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
