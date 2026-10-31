import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Role } from '../../types';
import { ShieldCheck, Check, X, Save, AlertCircle } from 'lucide-react';

interface PermissionItem {
  module: string;
  action: string;
  description: string;
  roles: Record<Role, boolean>;
}

export const AdminPermissionsPage: React.FC = () => {
  const { showToast } = useApp();

  const [permissions, setPermissions] = useState<PermissionItem[]>([
    // Classes
    { module: 'classes', action: 'create', description: 'Tạo lớp học mới', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'classes', action: 'update', description: 'Chỉnh sửa thông tin lớp', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'classes', action: 'delete', description: 'Xóa hoặc lưu trữ lớp', roles: { ADMIN: true, TEACHER: false, STUDENT: false, PARENT: false } },

    // Students
    { module: 'students', action: 'view_all', description: 'Xem danh sách toàn trường', roles: { ADMIN: true, TEACHER: false, STUDENT: false, PARENT: false } },
    { module: 'students', action: 'view_class', description: 'Xem học sinh lớp phụ trách', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'students', action: 'import', description: 'Import Excel danh sách HS', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'students', action: '360_profile', description: 'Xem hồ sơ 360° học sinh', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },

    // Attendance
    { module: 'attendance', action: 'mark', description: 'Điểm danh buổi học', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'attendance', action: 'view', description: 'Xem lịch sử chuyên cần', roles: { ADMIN: true, TEACHER: true, STUDENT: true, PARENT: true } },

    // Grades
    { module: 'grades', action: 'update', description: 'Nhập & sửa điểm số học sinh', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'grades', action: 'view', description: 'Xem bảng điểm', roles: { ADMIN: true, TEACHER: true, STUDENT: true, PARENT: true } },

    // Assignments
    { module: 'assignments', action: 'create', description: 'Giao bài tập mới', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'assignments', action: 'grade', description: 'Chấm điểm và phản hồi bài làm', roles: { ADMIN: true, TEACHER: true, STUDENT: false, PARENT: false } },
    { module: 'assignments', action: 'submit', description: 'Nộp bài tập học sinh', roles: { ADMIN: false, TEACHER: false, STUDENT: true, PARENT: false } },

    // System
    { module: 'audit_logs', action: 'view', description: 'Xem nhật ký kiểm toán hệ thống', roles: { ADMIN: true, TEACHER: false, STUDENT: false, PARENT: false } },
    { module: 'system_settings', action: 'manage', description: 'Cấu hình hệ thống & Sao lưu', roles: { ADMIN: true, TEACHER: false, STUDENT: false, PARENT: false } },
  ]);

  const togglePermission = (index: number, role: Role) => {
    if (role === 'ADMIN') {
      showToast('warning', 'Quyền Quản trị viên (Super Admin) là cố định!');
      return;
    }

    setPermissions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        roles: {
          ...updated[index].roles,
          [role]: !updated[index].roles[role],
        },
      };
      return updated;
    });
  };

  const handleSaveMatrix = () => {
    showToast('success', 'Đã lưu cấu hình ma trận phân quyền RBAC thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            Ma trận phân quyền vai trò (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Kiểm soát quyền truy cập chi tiết theo từng Module và Hành vi (Action)
          </p>
        </div>

        <button
          onClick={handleSaveMatrix}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          Lưu cấu hình quyền
        </button>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-700">
                <th className="p-3.5 min-w-[220px]">Module & Hành động</th>
                <th className="p-3.5 text-center w-28 bg-rose-50/70 text-rose-900">ADMIN</th>
                <th className="p-3.5 text-center w-28 bg-blue-50/70 text-blue-900">TEACHER</th>
                <th className="p-3.5 text-center w-28 bg-emerald-50/70 text-emerald-900">STUDENT</th>
                <th className="p-3.5 text-center w-28 bg-amber-50/70 text-amber-900">PARENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {permissions.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{perm.description}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {perm.module}.{perm.action}
                    </span>
                  </td>

                  {/* Admin */}
                  <td className="p-3.5 text-center bg-rose-50/20">
                    <span className="inline-flex p-1 rounded-lg bg-emerald-100 text-emerald-800">
                      <Check className="w-4 h-4" />
                    </span>
                  </td>

                  {/* Teacher */}
                  <td className="p-3.5 text-center bg-blue-50/20">
                    <button
                      onClick={() => togglePermission(idx, 'TEACHER')}
                      className={`p-1 rounded-lg transition-colors ${
                        perm.roles.TEACHER
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {perm.roles.TEACHER ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Student */}
                  <td className="p-3.5 text-center bg-emerald-50/20">
                    <button
                      onClick={() => togglePermission(idx, 'STUDENT')}
                      className={`p-1 rounded-lg transition-colors ${
                        perm.roles.STUDENT
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {perm.roles.STUDENT ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Parent */}
                  <td className="p-3.5 text-center bg-amber-50/20">
                    <button
                      onClick={() => togglePermission(idx, 'PARENT')}
                      className={`p-1 rounded-lg transition-colors ${
                        perm.roles.PARENT
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {perm.roles.PARENT ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
