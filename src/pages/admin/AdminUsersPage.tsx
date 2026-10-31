import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Role } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StorageService } from '../../services/storage';
import { useApp } from '../../contexts/AppContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Users2,
  Lock,
  Unlock,
  Plus,
  Edit,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { allUsers } = useAuth();
  const { showToast } = useApp();
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    StorageService.updateUser(user.id, { status: newStatus });
    setUsers(StorageService.getUsers());
    showToast('success', `Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${user.name}`);
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Họ và tên & Email',
      sortable: true,
      render: u => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={u.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <span className="font-bold text-slate-900 block">{u.name}</span>
            <span className="text-[11px] text-slate-400">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò (Role)',
      sortable: true,
      render: u => {
        const roleBadges: Record<Role, { label: string; color: string }> = {
          ADMIN: { label: 'Admin', color: 'bg-rose-100 text-rose-800' },
          TEACHER: { label: 'Giáo viên', color: 'bg-blue-100 text-blue-800' },
          STUDENT: { label: 'Học sinh', color: 'bg-emerald-100 text-emerald-800' },
          PARENT: { label: 'Phụ huynh', color: 'bg-amber-100 text-amber-800' },
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadges[u.role].color}`}>
            {roleBadges[u.role].label}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: u => <span className="text-xs text-slate-600 font-mono">{u.phone || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: u => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: u => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toggleUserStatus(u)}
            title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            className={`p-1.5 rounded-lg transition-colors ${
              u.status === 'ACTIVE'
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            Quản trị người dùng & Phân quyền tài khoản
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Quản lý tài khoản Giáo viên, Học sinh, Phụ huynh và Admin toàn hệ thống
          </p>
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={u => u.id}
        searchPlaceholder="Tìm kiếm tài khoản theo tên, email, SĐT..."
        searchableKeys={['name', 'email', 'phone']}
        filterComponent={
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Giáo viên</option>
            <option value="STUDENT">Học sinh</option>
            <option value="PARENT">Phụ huynh</option>
          </select>
        }
      />
    </div>
  );
};
