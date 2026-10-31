import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Student } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { Student360Modal } from '../../components/student/Student360Modal';
import { ImportStudentModal } from '../../components/student/ImportStudentModal';
import { AddStudentModal } from '../../components/student/AddStudentModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { CollapsibleCard } from '../../components/common/CollapsibleCard';
import { useSearchParams } from 'react-router-dom';
import { ParentsPage } from './ParentsPage';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Edit,
  GraduationCap,
  Award,
  ShieldCheck,
  Lock,
  Users2,
  Phone,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const {
    students,
    selectedClass,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    showToast,
    isDeleteEnabled,
    toggleDeleteMode,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMainTab, setActiveMainTab] = useState<'students' | 'parents'>(() =>
    searchParams.get('tab') === 'students' ? 'students' : 'parents'
  );

  const [classFilter, setClassFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [conductFilter, setConductFilter] = useState<string>('all');

  // Modals
  const [selectedStudentFor360, setSelectedStudentFor360] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    dob: '2010-01-01',
    gender: 'Nam' as 'Nam' | 'Nữ',
    classId: selectedClass?.id || 'cls-9a1',
    parentName: '',
    parentPhone: '',
    email: '',
    address: 'Hà Nội',
    status: 'STUDYING' as const,
    conduct: 'Tốt' as const,
    gpa: 8.0,
    rewardPoints: 50,
    notes: '',
    attendanceRate: 100,
  });

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (classFilter !== 'all' && s.classId !== classFilter) return false;
      if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
      if (conductFilter !== 'all' && s.conduct !== conductFilter) return false;
      return true;
    });
  }, [students, classFilter, genderFilter, conductFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.studentCode.trim()) return;

    const targetClass = classes.find(c => c.id === formData.classId);

    addStudent({
      ...formData,
      className: targetClass?.name || 'Lớp 9A1',
      avatar:
        formData.gender === 'Nữ'
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    });

    setIsAddModalOpen(false);
    setFormData({
      studentCode: '',
      fullName: '',
      dob: '2010-01-01',
      gender: 'Nam',
      classId: selectedClass?.id || 'cls-9a1',
      parentName: '',
      parentPhone: '',
      email: '',
      address: 'Hà Nội',
      status: 'STUDYING',
      conduct: 'Tốt',
      gpa: 8.0,
      rewardPoints: 50,
      notes: '',
      attendanceRate: 100,
    });
  };

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã HS,Họ và tên,Lớp,Giới tính,Ngày sinh,ĐTB,Hạnh kiểm,Điểm thi đua,Chuyên cần,Phụ huynh,SĐT\n' +
      filteredStudents
        .map(
          s =>
            `"${s.studentCode}","${s.fullName}","${s.className}","${s.gender}","${s.dob}",${s.gpa},"${s.conduct}",${s.rewardPoints},${s.attendanceRate}%,"${s.parentName}","${s.parentPhone}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_Sach_Hoc_Sinh_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất danh sách học sinh ra file CSV!');
  };

  const columns: Column<Student>[] = [
    {
      key: 'studentCode',
      header: 'Mã HS',
      sortable: true,
      render: s => <span className="font-mono font-bold text-blue-700 text-xs">{s.studentCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Học sinh',
      sortable: true,
      render: s => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={s.fullName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <span className="font-bold text-slate-900 block hover:text-blue-600 transition-colors">
              {s.fullName}
            </span>
            <span className="text-[11px] text-slate-400">{s.className}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Giới tính',
      render: s => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            s.gender === 'Nữ' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
          }`}
        >
          {s.gender}
        </span>
      ),
    },
    {
      key: 'gpa',
      header: 'Điểm TB',
      sortable: true,
      render: s => (
        <span
          className={`font-black text-xs ${
            s.gpa >= 8.5 ? 'text-emerald-600' : s.gpa >= 6.5 ? 'text-blue-600' : 'text-amber-600'
          }`}
        >
          {s.gpa.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'conduct',
      header: 'Hạnh kiểm',
      render: s => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          {s.conduct}
        </span>
      ),
    },
    {
      key: 'rewardPoints',
      header: 'Điểm thi đua',
      sortable: true,
      render: s => (
        <span className="font-bold text-purple-700 text-xs">+{s.rewardPoints} đ</span>
      ),
    },
    {
      key: 'parentName',
      header: 'Phụ huynh & SĐT',
      render: s => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{s.parentName}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {s.primaryContact === 'father' ? 'Bố' : 'Mẹ'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <a
              href={`tel:${s.parentPhone}`}
              onClick={e => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 font-mono text-[11px] font-bold flex items-center gap-0.5"
              title="Gọi điện cho phụ huynh"
            >
              <Phone className="w-2.5 h-2.5" />
              {s.parentPhone}
            </a>
            {s.parentLinked !== false && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Đã liên kết sổ liên lạc điện tử"></span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: s => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setSelectedStudentFor360(s)}
            title="Xem hồ sơ 360°"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isDeleteEnabled ? (
            <button
              onClick={() => setStudentToDelete(s)}
              title="Xóa học sinh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          ) : (
            <span
              title="Chức năng xóa học sinh đang TẮT (Chế độ an toàn chống xóa nhầm)"
              className="p-1.5 text-slate-300 cursor-not-allowed inline-flex items-center"
            >
              <Lock className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      ),
    },
  ];

  if (activeMainTab === 'parents') {
    return (
      <div className="space-y-4">
        {/* Navigation Switcher */}
        <div className="flex items-center gap-2 border-b border-[#0f2d56] pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveMainTab('parents');
              setSearchParams({ tab: 'parents' });
            }}
            className="flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl bg-[#0284c7] text-white shadow-md shadow-cyan-900/40 cursor-pointer"
          >
            <Users2 className="w-4 h-4" />
            <span>Thông tin phụ huynh</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 font-extrabold border border-cyan-800">
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMainTab('students');
              setSearchParams({ tab: 'students' });
            }}
            className="flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl text-slate-400 hover:text-white hover:bg-[#071933] transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Danh sách học sinh ({filteredStudents.length})</span>
          </button>
        </div>

        <ParentsPage />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-[#0f2d56] pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('parents');
            setSearchParams({ tab: 'parents' });
          }}
          className="flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl text-slate-400 hover:text-white hover:bg-[#071933] transition-all cursor-pointer"
        >
          <Users2 className="w-4 h-4" />
          <span>Thông tin phụ huynh</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 font-extrabold border border-cyan-800">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('students');
            setSearchParams({ tab: 'students' });
          }}
          className="flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl bg-[#0284c7] text-white shadow-md shadow-cyan-900/40 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Danh sách học sinh ({filteredStudents.length})</span>
        </button>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            Hồ sơ & Danh sách học sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tra cứu thông tin, hồ sơ 360°, nhập xuất dữ liệu và theo dõi học tập
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import Excel
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Xuất CSV
          </button>

          {/* Nút BẬT / TẮT XÓA */}
          <button
            type="button"
            onClick={toggleDeleteMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDeleteEnabled
                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={
              isDeleteEnabled
                ? 'Chế độ xóa đang BẬT: Bạn có thể xóa học sinh. Nhấn để TẮT (Chế độ an toàn)'
                : 'Chế độ xóa đang TẮT: Dữ liệu học sinh được bảo vệ. Nhấn để BẬT xóa'
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

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Thêm học sinh
          </button>
        </div>
      </div>

      {/* Collapsible Overview Stats */}
      <CollapsibleCard
        title="Thống kê hồ sơ học sinh"
        subtitle={`Đang hiển thị ${filteredStudents.length} / ${students.length} học sinh toàn trường`}
        icon={Users}
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Tổng số HS</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{filteredStudents.length} HS</p>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
            <span className="text-[11px] text-blue-700 font-bold uppercase">Học sinh Nam</span>
            <p className="text-xl font-black text-blue-900 mt-0.5">
              {filteredStudents.filter(s => s.gender === 'Nam').length} HS
            </p>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/70">
            <span className="text-[11px] text-rose-700 font-bold uppercase">Học sinh Nữ</span>
            <p className="text-xl font-black text-rose-900 mt-0.5">
              {filteredStudents.filter(s => s.gender === 'Nữ').length} HS
            </p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
            <span className="text-[11px] text-emerald-700 font-bold uppercase">Hạnh kiểm Tốt</span>
            <p className="text-xl font-black text-emerald-900 mt-0.5">
              {filteredStudents.filter(s => s.conduct === 'Tốt').length} HS
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {/* DataTable */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        keyExtractor={s => s.id}
        searchPlaceholder="Tìm kiếm học sinh theo tên, mã số, SĐT phụ huynh..."
        searchableKeys={['fullName', 'studentCode', 'parentName', 'parentPhone']}
        onRowClick={s => setSelectedStudentFor360(s)}
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        }
      />

      {/* STUDENT 360 MODAL */}
      <Student360Modal
        student={selectedStudentFor360}
        isOpen={!!selectedStudentFor360}
        onClose={() => setSelectedStudentFor360(null)}
      />

      {/* IMPORT EXCEL/CSV WIZARD MODAL */}
      <ImportStudentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultClassId={classFilter !== 'all' ? classFilter : selectedClass?.id}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) deleteStudent(studentToDelete.id);
        }}
        title="Xóa học sinh"
        message={`Bạn có chắc muốn xóa học sinh "${studentToDelete?.fullName}" (${studentToDelete?.studentCode}) khỏi cơ sở dữ liệu? Dữ liệu điểm danh và kết quả học tập liên quan sẽ được lưu vết trong audit log.`}
        isDestructive
        confirmLabel="Vẫn xóa"
      />
    </div>
  );
};
