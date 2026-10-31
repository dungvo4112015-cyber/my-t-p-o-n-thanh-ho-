import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  BookOpen,
  FileText,
  HelpCircle,
  FolderArchive,
  Bot,
  CheckCircle2,
  GraduationCap,
  LineChart,
  Smile,
  Award,
  AlertTriangle,
  Dices,
  Bell,
  FileBarChart,
  ShieldCheck,
  UserCheck,
  Users2,
  Database,
  History,
  Settings,
  Mail,
  School,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { currentRole } = useAuth();
  const location = useLocation();

  // State to track which navigation group is collapsed: group title -> boolean
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const toggleAllGroups = (collapse: boolean) => {
    const updated: Record<string, boolean> = {};
    currentNav.forEach(g => {
      updated[g.title] = collapse;
    });
    setCollapsedGroups(updated);
  };

  const teacherNavGroups = [
    {
      title: 'Chính',
      items: [{ label: 'Tổng quan', path: '/teacher/dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'Quản lý lớp học',
      items: [
        { label: 'Lớp học', path: '/teacher/classes', icon: School },
        { label: 'Học sinh', path: '/teacher/students', icon: Users },
        { label: 'Thông tin phụ huynh', path: '/teacher/parents', icon: Users2 },
        { label: 'Điểm danh', path: '/teacher/attendance', icon: CheckSquare },
        { label: 'Thời khóa biểu', path: '/teacher/schedule', icon: Calendar },
      ],
    },
    {
      title: 'Dạy & Học',
      items: [
        { label: 'Ngân hàng câu hỏi', path: '/teacher/question-bank', icon: Database, badge: 'Mới' },
        { label: 'Giao bài tập', path: '/teacher/assignments', icon: FileText },
        { label: 'Chấm bài tự động', path: '/teacher/grading', icon: CheckCircle2, badge: 'Tự động' },
        { label: 'Tài liệu số', path: '/teacher/resources', icon: FolderArchive },
        { label: 'AI HỖ TRỢ', path: '/teacher/ai', icon: Bot, badge: 'Smart' },
      ],
    },
    {
      title: 'Theo dõi & Đánh giá',
      items: [
        { label: 'Sổ điểm trực tuyến', path: '/teacher/grades', icon: GraduationCap },
        { label: 'Thống kê chuyên cần', path: '/teacher/attendance-analytics', icon: LineChart },
        { label: 'Hành vi nề nếp', path: '/teacher/behavior', icon: Smile },
        { label: 'Thi đua & Huy hiệu', path: '/teacher/rewards', icon: Award },
        { label: 'Cảnh báo sớm', path: '/teacher/alerts', icon: AlertTriangle, badge: '3' },
      ],
    },
    {
      title: 'Tương tác & Khác',
      items: [
        { label: 'Công cụ lớp học', path: '/teacher/tools', icon: Dices },
        { label: 'Bản tin & Thông báo', path: '/teacher/announcements', icon: Bell },
        { label: 'Báo cáo & Xuất file', path: '/teacher/reports', icon: FileBarChart },
      ],
    },
  ];

  const studentNavGroups = [
    {
      title: 'Góc học tập',
      items: [
        { label: 'Bàn học tổng quan', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Lịch học tuần', path: '/student/schedule', icon: Calendar },
        { label: 'Nhiệm vụ & Bài tập', path: '/student/assignments', icon: FileText },
        { label: 'Kiểm tra trực tuyến', path: '/student/quizzes', icon: HelpCircle },
        { label: 'Học liệu môn học', path: '/student/resources', icon: FolderArchive },
      ],
    },
    {
      title: 'Kết quả của em',
      items: [
        { label: 'Bảng điểm cá nhân', path: '/student/grades', icon: GraduationCap },
        { label: 'Bộ sưu tập huy hiệu', path: '/student/achievements', icon: Award },
        { label: 'Thông báo lớp học', path: '/student/notifications', icon: Bell },
      ],
    },
  ];

  const parentNavGroups = [
    {
      title: 'Cổng thông tin phụ huynh',
      items: [
        { label: 'Tình hình học tập của con', path: '/parent/dashboard', icon: LayoutDashboard },
        { label: 'Hồ sơ 360° con', path: '/parent/children', icon: Users2 },
        { label: 'Gửi đơn xin nghỉ phép', path: '/parent/leave-request', icon: Calendar },
        { label: 'Trao đổi với giáo viên', path: '/parent/messages', icon: Mail },
        { label: 'Thông báo từ nhà trường', path: '/parent/notifications', icon: Bell },
      ],
    },
  ];

  const adminNavGroups = [
    {
      title: 'Quản trị hệ thống',
      items: [
        { label: 'Tổng quan Admin', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Trường & Lớp học', path: '/admin/classes', icon: School },
        { label: 'Quản lý người dùng', path: '/admin/users', icon: Users },
        { label: 'Phân quyền RBAC', path: '/admin/permissions', icon: ShieldCheck },
        { label: 'Báo cáo toàn trường', path: '/admin/reports', icon: FileBarChart },
        { label: 'Nhật ký hoạt động (Audit)', path: '/admin/audit-logs', icon: History },
        { label: 'Sao lưu & Phục hồi', path: '/admin/backup', icon: Database },
        { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  let currentNav = teacherNavGroups;
  if (currentRole === 'STUDENT') currentNav = studentNavGroups;
  else if (currentRole === 'PARENT') currentNav = parentNavGroups;
  else if (currentRole === 'ADMIN') currentNav = adminNavGroups;

  const allCollapsed = currentNav.length > 0 && currentNav.every(g => !!collapsedGroups[g.title]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'} border-r border-slate-800 shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/30 shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-black text-sm tracking-tight text-white block truncate">
                  THCS LÊ QUÝ ĐÔN
                </span>
                <p className="text-[10px] text-cyan-400 font-bold tracking-wider truncate">
                  LỚP HỌC THÔNG MINH 4.0
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse / Expand Toggle Button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCollapsed ? 'Mở rộng thanh menu (260px)' : 'Thu gọn thanh menu (72px)'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile Close Button */}
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Class Space Context Banner from screenshot */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 border-b border-slate-800/80 bg-[#071933]/70">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Không gian lớp</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0d2a4a] text-[#38bdf8] border border-[#1e4976]">
                31 HS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="font-extrabold text-white text-sm">Lớp 6A1</span>
            </div>
          </div>
        )}

        {/* Global Expand/Collapse Accordion Controls (when not collapsed) */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/20 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold">Nhóm module ({currentNav.length})</span>
            <button
              type="button"
              onClick={() => toggleAllGroups(!allCollapsed)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
              title={allCollapsed ? 'Mở rộng tất cả các nhóm' : 'Thu gọn tất cả các nhóm'}
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{allCollapsed ? 'Mở tất cả' : 'Đóng tất cả'}</span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {currentNav.map((group, idx) => {
            const isGroupCollapsed = !isCollapsed && !!collapsedGroups[group.title];

            return (
              <div key={idx} className="space-y-1">
                {/* Group Header with Click to Open/Close */}
                {!isCollapsed ? (
                  <div
                    onClick={() => toggleGroup(group.title)}
                    className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg cursor-pointer select-none transition-colors group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{group.title}</span>
                    <button
                      type="button"
                      className="text-slate-400 group-hover:text-slate-300 p-0.5"
                      title={isGroupCollapsed ? `Mở nhóm ${group.title}` : `Đóng nhóm ${group.title}`}
                    >
                      {isGroupCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="h-2" />
                )}

                {/* Sub-items (hidden when group is collapsed) */}
                {!isGroupCollapsed && (
                  <div className="space-y-1 animate-in fade-in duration-100">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          title={isCollapsed ? item.label : undefined}
                          className={`flex items-center ${
                            isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                          } rounded-xl text-xs font-semibold transition-all duration-150 group ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                              }`}
                            />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && item.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.badge === 'Smart'
                                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                                  : 'bg-rose-500 text-white'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          {!isCollapsed ? (
            <div>
              <p className="font-medium text-slate-400 truncate">Trường THCS Chu Văn An</p>
              <p className="text-[10px]">Học kỳ I • 2024-2025</p>
            </div>
          ) : (
            <div className="mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" title="Trực tuyến" />
            </div>
          )}
          {!isCollapsed && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Hệ thống trực tuyến" />
          )}
        </div>
      </aside>
    </>
  );
};
