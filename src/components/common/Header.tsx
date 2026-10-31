import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Search,
  Bell,
  Plus,
  BookOpen,
  UserPlus,
  CheckSquare,
  FileText,
  HelpCircle,
  Dices,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Users2,
  Menu,
  School,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchModal } from './SearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { Role } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleCollapse,
}) => {
  const { currentUser, currentRole, switchRole } = useAuth();
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedClass,
    unreadNotificationCount,
    setActiveTool,
    isDeleteEnabled,
    toggleDeleteMode,
  } = useApp();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roleLabels: Record<Role, { label: string; icon: any; color: string }> = {
    ADMIN: { label: 'Quản trị viên', icon: ShieldCheck, color: 'bg-rose-100 text-rose-800 border-rose-200' },
    TEACHER: { label: 'Giáo viên', icon: UserCheck, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    STUDENT: { label: 'Học sinh', icon: GraduationCap, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    PARENT: { label: 'Phụ huynh', icon: Users2, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  };

  const handleRoleSelect = (role: Role) => {
    switchRole(role);
    setIsRoleMenuOpen(false);
    if (role === 'TEACHER') navigate('/teacher/dashboard');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'PARENT') navigate('/parent/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#040d1a] border-b border-[#0f2d56] px-4 sm:px-6 flex items-center justify-between gap-4 text-slate-100">
        {/* Left: Mobile hamburger & Desktop collapse */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-[#071933] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Mở rộng thanh menu bên trái' : 'Thu gọn thanh menu bên trái'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Center: Global Search Bar as in screenshot */}
        <div className="flex-1 max-w-lg hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-[#071933] hover:bg-[#0c2448] border border-[#11315e] rounded-xl transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-slate-400 font-medium truncate">
                Tìm kiếm môn học, học sinh, lớp, thời khóa biểu...
              </span>
            </div>
            <kbd className="hidden sm:inline-block rounded-md border border-[#1c3e6f] bg-[#0c1f3b] px-2 py-0.5 text-[10px] font-mono text-cyan-400 font-bold">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role badge as in screenshot */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0d2a4a] text-[#38bdf8] border border-[#1e4976] select-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Vai trò: TEACHER</span>
          </div>

          {/* Quick Schedule Button as in screenshot */}
          <button
            onClick={() => navigate('/teacher/schedule')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Thời khóa biểu</span>
          </button>




          {/* Notification Button */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Quick Role Switcher - Essential for testing multi-role demo! */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                roleLabels[currentRole].color
              }`}
              title="Nhấn để đổi vai trò thử nghiệm"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-white"
              />
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ').slice(-2).join(' ')}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/70 font-extrabold tracking-wide">
                {roleLabels[currentRole].label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {isRoleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsRoleMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                </div>

                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chuyển vai trò thử nghiệm (Demo)
                </div>

                <button
                  onClick={() => handleRoleSelect('TEACHER')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 rounded-xl mx-auto max-w-[94%] ${
                    currentRole === 'TEACHER' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Giáo viên (Thầy An - 9A1)</span>
                  </div>
                  {currentRole === 'TEACHER' && <span className="text-blue-600 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleSelect('STUDENT')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 rounded-xl mx-auto max-w-[94%] ${
                    currentRole === 'STUDENT' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Học sinh (Lê Hải Đăng)</span>
                  </div>
                  {currentRole === 'STUDENT' && <span className="text-emerald-600 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleSelect('PARENT')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 rounded-xl mx-auto max-w-[94%] ${
                    currentRole === 'PARENT' ? 'bg-amber-50 text-amber-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-amber-600" />
                    <span>Phụ huynh (Trần Thị Mai)</span>
                  </div>
                  {currentRole === 'PARENT' && <span className="text-amber-600 font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 rounded-xl mx-auto max-w-[94%] ${
                    currentRole === 'ADMIN' ? 'bg-rose-50 text-rose-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Admin Hệ thống (Thanh Tùng)</span>
                  </div>
                  {currentRole === 'ADMIN' && <span className="text-rose-600 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Notification Center Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
