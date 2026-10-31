import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SchoolClass } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  School,
  Plus,
  PlusCircle,
  Search,
  QrCode,
  Lock,
  Unlock,
  Archive,
  Copy,
  Users,
  DoorOpen,
  ArrowRight,
  Trash2,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Edit3,
  Pencil,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    archiveClass,
    deleteClass,
    setSelectedClassId,
    showToast,
    isDeleteEnabled,
    toggleDeleteMode,
  } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state: 'my-classes' | 'create'
  const activeTab = searchParams.get('tab') === 'create' ? 'create' : 'my-classes';

  const setActiveTab = (tab: 'my-classes' | 'create') => {
    setSearchParams({ tab });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // Modals
  const [qrClass, setQrClass] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    gradeLevel: 9,
    academicYear: '2024-2025',
    room: '',
    subject: 'Toán học & Chủ nhiệm',
    description: '',
    maxStudents: 40,
    joinCode: '',
    homeroomTeacherName: 'Thầy Nguyễn Văn An',
    isJoinLocked: false,
  });

  const openEditModal = (cls: SchoolClass) => {
    setEditingClass(cls);
    setEditFormData({
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      academicYear: cls.academicYear,
      room: cls.room,
      subject: cls.subject || 'Toán học & Chủ nhiệm',
      description: cls.description || '',
      maxStudents: cls.maxStudents,
      joinCode: cls.joinCode,
      homeroomTeacherName: cls.homeroomTeacherName,
      isJoinLocked: cls.isJoinLocked,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (!editFormData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên lớp học!');
      return;
    }
    updateClass(editingClass.id, {
      name: editFormData.name.trim(),
      gradeLevel: editFormData.gradeLevel,
      academicYear: editFormData.academicYear.trim(),
      room: editFormData.room.trim(),
      subject: editFormData.subject.trim(),
      description: editFormData.description.trim(),
      maxStudents: editFormData.maxStudents,
      joinCode: editFormData.joinCode.trim(),
      homeroomTeacherName: editFormData.homeroomTeacherName.trim(),
      isJoinLocked: editFormData.isJoinLocked,
    });
    showToast('success', `Đã cập nhật tên lớp thành "${editFormData.name.trim()}"!`);
    setEditingClass(null);
  };

  // Form State for creating class
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: 9,
    academicYear: '2024-2025',
    room: '',
    subject: 'Toán học & Chủ nhiệm',
    description: '',
    maxStudents: 40,
    joinCode: '',
    homeroomTeacherName: 'Thầy Nguyễn Văn An',
    homeroomTeacherId: 'u-teacher-1',
    isJoinLocked: false,
    isArchived: false,
  });

  const filteredClasses = classes.filter(c => {
    if (!showArchived && c.isArchived) return false;
    if (showArchived && !c.isArchived) return false;
    if (gradeFilter !== 'all' && c.gradeLevel.toString() !== gradeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.room && c.room.toLowerCase().includes(q)) ||
        (c.subject && c.subject.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên lớp học!');
      return;
    }

    const autoCode = formData.joinCode.trim() || `${formData.name.replace(/\s+/g, '').toUpperCase()}-2025`;

    addClass({
      ...formData,
      joinCode: autoCode,
    });

    // Reset form
    setFormData({
      name: '',
      gradeLevel: 9,
      academicYear: '2024-2025',
      room: '',
      subject: 'Toán học & Chủ nhiệm',
      description: '',
      maxStudents: 40,
      joinCode: '',
      homeroomTeacherName: 'Thầy Nguyễn Văn An',
      homeroomTeacherId: 'u-teacher-1',
      isJoinLocked: false,
      isArchived: false,
    });

    // Automatically navigate back to 'my-classes' tab
    setActiveTab('my-classes');
  };

  const handleCopyClass = (cls: SchoolClass) => {
    addClass({
      name: `${cls.name} (Năm mới)`,
      gradeLevel: cls.gradeLevel,
      academicYear: '2025-2026',
      room: cls.room,
      subject: cls.subject,
      description: `Bản sao lưu chuyển từ ${cls.academicYear}`,
      maxStudents: cls.maxStudents,
      joinCode: `${cls.name.replace(/\s+/g, '').toUpperCase()}-2026`,
      homeroomTeacherName: cls.homeroomTeacherName,
      homeroomTeacherId: cls.homeroomTeacherId,
      isJoinLocked: false,
      isArchived: false,
    });
  };

  const activeClassesCount = classes.filter(c => !c.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <School className="w-6 h-6 text-cyan-400" />
            Quản lý lớp học
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Quản lý danh sách các lớp chủ nhiệm, lớp bộ môn và khởi tạo lớp học mới
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút BẬT / TẮT XÓA */}
          <button
            type="button"
            onClick={toggleDeleteMode}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDeleteEnabled
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={
              isDeleteEnabled
                ? 'Chế độ xóa đang BẬT: Bạn có thể xóa lớp học. Nhấn để TẮT (Chế độ an toàn)'
                : 'Chế độ xóa đang TẮT: Dữ liệu lớp học được bảo vệ. Nhấn để BẬT xóa'
            }
          >
            {isDeleteEnabled ? (
              <>
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa: BẬT</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xóa: TẮT</span>
              </>
            )}
          </button>

          {activeTab === 'my-classes' ? (
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm mới lớp
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('my-classes')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <School className="w-4 h-4" />
              Xem lớp của tôi
            </button>
          )}
        </div>
      </div>

      {/* 2 TABS NAVIGATION: LỚP CỦA TÔI & THÊM MỚI LỚP */}
      <div className="flex items-center gap-2 border-b border-[#0f2d56] pb-0">
        <button
          type="button"
          onClick={() => setActiveTab('my-classes')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'my-classes'
              ? 'border-cyan-400 text-cyan-400 bg-[#071933] rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          <School className={`w-4 h-4 ${activeTab === 'my-classes' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Lớp của tôi</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'my-classes'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#0f2d56] text-slate-300'
            }`}
          >
            {activeClassesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'border-cyan-400 text-cyan-400 bg-[#071933] rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'create' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>Thêm mới lớp</span>
          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
            Mới
          </span>
        </button>
      </div>

      {/* ===================== TAB 1: LỚP CỦA TÔI ===================== */}
      {activeTab === 'my-classes' && (
        <div className="space-y-6">
          {/* Collapsible Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Bộ lọc & Công cụ tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <span>{isFilterOpen ? 'Thu gọn' : 'Mở rộng'}</span>
                {isFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isFilterOpen && (
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên lớp, phòng học, môn..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <select
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Tất cả các khối</option>
                    <option value="9">Khối 9</option>
                    <option value="8">Khối 8</option>
                    <option value="7">Khối 7</option>
                    <option value="6">Khối 6</option>
                  </select>

                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showArchived
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {showArchived ? 'Đang xem kho lưu trữ' : 'Kho lưu trữ'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                <School className="w-12 h-12 mx-auto text-slate-300 mb-1" />
                <p className="text-sm font-semibold text-slate-600">Không tìm thấy lớp học nào phù hợp</p>
                <p className="text-xs text-slate-400">
                  Thử thay đổi bộ lọc tìm kiếm hoặc tạo một lớp học mới ngay bây giờ
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Chuyển sang Thêm mới lớp
                </button>
              </div>
            ) : (
              filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Card Header Top Banner */}
                  <div className="p-5 border-b border-slate-100 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                          Khối {cls.gradeLevel} • {cls.academicYear}
                        </span>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cls.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => openEditModal(cls)}
                            title="Đổi tên / Chỉnh sửa lớp học"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* QR and Lock badges */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQrClass(cls)}
                          title="Mã & QR tham gia lớp"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateClass(cls.id, { isJoinLocked: !cls.isJoinLocked })}
                          title={cls.isJoinLocked ? 'Lớp đang khóa tham gia' : 'Lớp đang mở tham gia'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            cls.isJoinLocked ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
                          }`}
                        >
                          {cls.isJoinLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-1">{cls.description || 'Chưa có mô tả'}</p>
                  </div>

                  {/* Card Body Info */}
                  <div className="p-5 space-y-3 bg-slate-50/50 flex-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <DoorOpen className="w-3.5 h-3.5" /> Phòng học:
                      </span>
                      <span className="font-bold text-slate-800">{cls.room}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5" /> Sĩ số hiện tại:
                      </span>
                      <span className="font-bold text-slate-800">
                        {cls.studentCount} / {cls.maxStudents} học sinh
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Giáo viên CN:</span>
                      <span className="font-bold text-slate-800">{cls.homeroomTeacherName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mã tham gia:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {cls.joinCode}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(cls)}
                        title="Đổi tên & Sửa thông tin lớp"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Đổi tên / Sửa</span>
                      </button>
                      <button
                        onClick={() => handleCopyClass(cls)}
                        title="Sao chép lớp sang năm học mới"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => archiveClass(cls.id)}
                        title={cls.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ lớp'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      {isDeleteEnabled ? (
                        <button
                          onClick={() => setClassToDelete(cls)}
                          title="Xóa lớp học"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      ) : (
                        <span
                          title="Chức năng xóa lớp học đang TẮT (Chế độ an toàn chống xóa nhầm)"
                          className="p-1.5 text-slate-300 cursor-not-allowed inline-flex items-center"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        navigate(`/teacher/classes/${cls.id}`);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all cursor-pointer"
                    >
                      Vào lớp học <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: THÊM MỚI LỚP ===================== */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Khởi tạo dữ liệu lớp</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                Biểu mẫu thiết lập lớp học mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập đầy đủ thông tin để hệ thống tạo danh sách lớp, cấp mã tham gia và liên kết với năm học.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs">
              {/* Section 1: Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  1. Thông tin cơ bản của lớp
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tên lớp học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Lớp 9A3, Lớp 8B2..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khối học</label>
                    <select
                      value={formData.gradeLevel}
                      onChange={e => setFormData({ ...formData, gradeLevel: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    >
                      <option value={9}>Khối 9 (THCS)</option>
                      <option value={8}>Khối 8 (THCS)</option>
                      <option value={7}>Khối 7 (THCS)</option>
                      <option value={6}>Khối 6 (THCS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="2024-2025"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phòng học được bố trí</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      placeholder="VD: Phòng 405 - Nhà B"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Chuyên môn & Quy mô */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  2. Chuyên môn & Phụ trách
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bộ môn giảng dạy</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="VD: Toán học & Chủ nhiệm"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm phụ trách</label>
                    <input
                      type="text"
                      value={formData.homeroomTeacherName}
                      onChange={e => setFormData({ ...formData, homeroomTeacherName: e.target.value })}
                      placeholder="VD: Thầy Nguyễn Văn An"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sĩ số tối đa</label>
                    <input
                      type="number"
                      min={10}
                      max={60}
                      value={formData.maxStudents}
                      onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 40 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã tham gia lớp (Để trống sẽ tự tạo)</label>
                    <input
                      type="text"
                      value={formData.joinCode}
                      onChange={e => setFormData({ ...formData, joinCode: e.target.value.toUpperCase() })}
                      placeholder="VD: 9A3-2025"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Mô tả & Tùy chọn */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  3. Mô tả & Thiết lập nâng cao
                </h3>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mô tả / Mục tiêu lớp học</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả thông tin định hướng, mục tiêu học tập năm học..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={formData.isJoinLocked}
                      onChange={e => setFormData({ ...formData, isJoinLocked: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Khóa mã tham gia (Học sinh chỉ có thể vào lớp khi giáo viên duyệt)</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-classes')}
                  className="px-5 py-2.5 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy & Quay lại
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-102"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-3xl border border-blue-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Xem trước thẻ lớp học
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                    Live Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                    className="p-1 rounded-md text-blue-700 hover:bg-blue-200/60 transition-colors cursor-pointer"
                    title={isPreviewOpen ? 'Thu gọn xem trước' : 'Mở rộng xem trước'}
                  >
                    {isPreviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isPreviewOpen && (
                <>
                  {/* Previewing how it renders in the grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between animate-in fade-in duration-150">
                    <div className="p-5 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Khối {formData.gradeLevel} • {formData.academicYear || '2024-2025'}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-1">
                        {formData.name.trim() || 'Tên lớp học mới'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {formData.description.trim() || 'Mô tả lớp học sẽ hiển thị tại đây...'}
                      </p>
                    </div>

                    <div className="p-4 space-y-2 bg-slate-50/60 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5" /> Phòng học:
                        </span>
                        <span className="font-bold text-slate-800">{formData.room.trim() || 'Chưa xếp phòng'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Sĩ số:
                        </span>
                        <span className="font-bold text-slate-800">0 / {formData.maxStudents} HS</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Giáo viên CN:</span>
                        <span className="font-bold text-slate-800">{formData.homeroomTeacherName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Mã tham gia:</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {formData.joinCode.trim() || `${(formData.name || 'LOP').replace(/\s+/g, '').toUpperCase()}-2025`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Helpful Tips */}
                  <div className="p-3.5 rounded-2xl bg-white/80 border border-blue-100 text-[11px] text-slate-600 space-y-1.5 leading-relaxed animate-in fade-in duration-150">
                    <p className="font-bold text-slate-800">💡 Hướng dẫn nhanh:</p>
                    <p>• Học sinh có thể dùng mã tham gia lớp để tự đăng ký qua cổng học sinh.</p>
                    <p>• Sau khi tạo lớp, bạn có thể vào tab <strong>"Học sinh"</strong> để Import danh sách từ file Excel/CSV mẫu.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrClass && (
        <Modal isOpen={!!qrClass} onClose={() => setQrClass(null)} maxWidth="sm" title="Mã & QR tham gia lớp">
          <div className="text-center p-4 space-y-4">
            <h4 className="font-bold text-base text-slate-900">{qrClass.name}</h4>
            <div className="w-48 h-48 mx-auto bg-white p-3 border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
              {/* Simulated QR Code SVG */}
              <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100">
                <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="currentColor" />
                <rect x="73" y="18" width="9" height="9" fill="currentColor" />
                <rect x="18" y="73" width="9" height="9" fill="currentColor" />
                <rect x="42" y="20" width="16" height="6" fill="currentColor" />
                <rect x="42" y="40" width="24" height="20" fill="currentColor" />
                <rect x="42" y="70" width="16" height="14" fill="currentColor" />
                <rect x="70" y="50" width="14" height="20" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500">Mã lớp học (Nhập trên app học sinh):</span>
              <p className="text-2xl font-mono font-black text-blue-700 tracking-wider mt-1">{qrClass.joinCode}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={() => {
          if (classToDelete) deleteClass(classToDelete.id);
        }}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp ${classToDelete?.name}? Thao tác này sẽ ghi nhận vào audit log. Khuyến nghị bạn chọn "Lưu trữ" thay vì xóa vĩnh viễn.`}
        isDestructive
        confirmLabel="Vẫn xóa"
      />

      {/* EDIT / RENAME CLASS MODAL */}
      {editingClass && (
        <Modal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              <span>Đổi tên & Chỉnh sửa thông tin lớp</span>
            </div>
          }
          description="Cập nhật tên lớp và các thông số thiết lập của lớp học này"
        >
          <form onSubmit={handleSaveEdit} className="space-y-5 text-xs text-slate-700">
            {/* Class Name Highlighted */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1.5">
              <label className="block font-black text-blue-950">
                Tên lớp học mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="VD: Lớp 9A1, Lớp 9A1 Chuyên Toán..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 text-sm shadow-xs"
                />
              </div>
              <p className="text-[11px] text-blue-700">
                💡 Tên lớp học mới sẽ được cập nhật đồng bộ ngay lập tức cho toàn bộ học sinh, phụ huynh và sổ điểm.
              </p>
            </div>

            {/* Grid 2 cols: Khối & Năm học */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối học</label>
                <select
                  value={editFormData.gradeLevel}
                  onChange={e => setEditFormData({ ...editFormData, gradeLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={9}>Khối 9 (THCS)</option>
                  <option value={8}>Khối 8 (THCS)</option>
                  <option value={7}>Khối 7 (THCS)</option>
                  <option value={6}>Khối 6 (THCS)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={editFormData.academicYear}
                  onChange={e => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                  placeholder="2024-2025"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Grid 2 cols: Phòng học & Sĩ số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={editFormData.room}
                  onChange={e => setEditFormData({ ...editFormData, room: e.target.value })}
                  placeholder="VD: Phòng 405"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sĩ số tối đa</label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={editFormData.maxStudents}
                  onChange={e => setEditFormData({ ...editFormData, maxStudents: parseInt(e.target.value) || 40 })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Grid 2 cols: Môn học & Giáo viên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bộ môn phụ trách</label>
                <input
                  type="text"
                  value={editFormData.subject}
                  onChange={e => setEditFormData({ ...editFormData, subject: e.target.value })}
                  placeholder="VD: Toán học & Chủ nhiệm"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm</label>
                <input
                  type="text"
                  value={editFormData.homeroomTeacherName}
                  onChange={e => setEditFormData({ ...editFormData, homeroomTeacherName: e.target.value })}
                  placeholder="VD: Thầy Nguyễn Văn An"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Mã tham gia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã tham gia lớp</label>
                <input
                  type="text"
                  value={editFormData.joinCode}
                  onChange={e => setEditFormData({ ...editFormData, joinCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-700 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={editFormData.isJoinLocked}
                    onChange={e => setEditFormData({ ...editFormData, isJoinLocked: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Khóa mã tham gia (chỉ giáo viên thêm)</span>
                </label>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mô tả lớp học</label>
              <textarea
                rows={2}
                value={editFormData.description}
                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Ghi chú mục tiêu học tập của lớp..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
