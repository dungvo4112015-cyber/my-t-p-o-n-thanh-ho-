import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  X,
  User,
  Users,
  Calendar,
  Hash,
  Layers,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
}) => {
  const { classes, selectedClass, addStudent, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');

  // Form state
  const [classId, setClassId] = useState(defaultClassId || selectedClass?.id || (classes[0]?.id || ''));
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [dob, setDob] = useState('2010-01-15');
  const [orderNumber, setOrderNumber] = useState<number | ''>('');
  const [studyGroup, setStudyGroup] = useState('Tổ 1');
  const [address, setAddress] = useState('Hà Nội');
  const [email, setEmail] = useState('');

  // Parent Info state
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [primaryContact, setPrimaryContact] = useState<'father' | 'mother'>('mother');
  const [parentAddress, setParentAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Errors state for inline validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const targetClass = defaultClassId || selectedClass?.id || (classes[0]?.id || '');
      setClassId(targetClass);
      // Auto suggest student code based on current date
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setStudentCode(`HS24${randomSuffix}`);
      setActiveTab('student');
      setErrors({});
    }
  }, [isOpen, defaultClassId, selectedClass, classes]);

  if (!isOpen) return null;

  const validateStudentTab = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên học sinh';
    if (!studentCode.trim()) errs.studentCode = 'Vui lòng nhập mã học sinh';
    if (!classId) errs.classId = 'Vui lòng chọn lớp học';
    if (!dob) errs.dob = 'Vui lòng chọn ngày sinh';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAll = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên học sinh';
    if (!studentCode.trim()) errs.studentCode = 'Vui lòng nhập mã học sinh';
    if (!classId) errs.classId = 'Vui lòng chọn lớp học';
    if (!dob) errs.dob = 'Vui lòng chọn ngày sinh';

    // Parent validation (if entered phone, must be digits)
    if (fatherPhone && !/^[0-9+ ]{9,15}$/.test(fatherPhone.trim())) {
      errs.fatherPhone = 'Số điện thoại bố không đúng định dạng';
    }
    if (motherPhone && !/^[0-9+ ]{9,15}$/.test(motherPhone.trim())) {
      errs.motherPhone = 'Số điện thoại mẹ không đúng định dạng';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToParent = () => {
    if (validateStudentTab()) {
      setActiveTab('parent');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateAll()) {
      if (errors.fullName || errors.studentCode || errors.classId || errors.dob) {
        setActiveTab('student');
      }
      showToast('error', 'Vui lòng kiểm tra các trường thông tin bắt buộc (*)');
      return;
    }

    const currentCls = classes.find(c => c.id === classId);
    const resolvedParentName =
      primaryContact === 'mother'
        ? motherName.trim() || fatherName.trim() || 'Phụ huynh ' + fullName
        : fatherName.trim() || motherName.trim() || 'Phụ huynh ' + fullName;
    const resolvedParentPhone =
      primaryContact === 'mother'
        ? motherPhone.trim() || fatherPhone.trim() || '0988000000'
        : fatherPhone.trim() || motherPhone.trim() || '0988000000';

    addStudent({
      studentCode: studentCode.trim(),
      fullName: fullName.trim(),
      dob,
      gender,
      classId,
      className: currentCls?.name || 'Lớp 9A1',
      avatar:
        gender === 'Nữ'
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      parentName: resolvedParentName,
      parentPhone: resolvedParentPhone,
      fatherName: fatherName.trim(),
      fatherPhone: fatherPhone.trim(),
      motherName: motherName.trim(),
      motherPhone: motherPhone.trim(),
      primaryContact,
      parentLinked: true,
      parentNotes: notes.trim(),
      orderNumber: orderNumber ? Number(orderNumber) : undefined,
      studyGroup: studyGroup || 'Tổ 1',
      email: email.trim() || undefined,
      address: address.trim() || parentAddress.trim() || 'Hà Nội',
      status: 'STUDYING',
      conduct: 'Tốt',
      gpa: 8.0,
      rewardPoints: 50,
      notes: notes.trim(),
      attendanceRate: 100,
    });

    showToast('success', `Đã thêm học sinh ${fullName} vào ${currentCls?.name || 'lớp'}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog with large border radius & clean shadow */}
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white relative">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Thêm từng học sinh</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Thêm mới
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Nhập thông tin hồ sơ học sinh và thông tin liên hệ phụ huynh để khởi tạo dữ liệu
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/60 border-b border-slate-100">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex max-w-md">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-blue-600 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>👤 Thông tin học sinh</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? 'bg-white text-purple-600 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>👥 Thông tin phụ huynh</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6 text-xs text-slate-700">
          {/* ================= TAB 1: THÔNG TIN HỌC SINH ================= */}
          {activeTab === 'student' && (
            <div className="space-y-5">
              {/* 2 Cột Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      placeholder="VD: Nguyễn Văn Anh"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Mã học sinh */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={studentCode}
                      onChange={e => {
                        setStudentCode(e.target.value);
                        if (errors.studentCode) setErrors({ ...errors, studentCode: '' });
                      }}
                      placeholder="VD: HS240901"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase placeholder:text-slate-400"
                    />
                  </div>
                  {errors.studentCode && <p className="text-[11px] text-rose-500 mt-1">{errors.studentCode}</p>}
                </div>
              </div>

              {/* Lớp & Giới tính */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lớp học */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Xếp vào lớp học <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={classId}
                      onChange={e => setClassId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Khối {c.gradeLevel} - {c.academicYear})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Giới tính dạng nút chọn Nam / Nữ */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Giới tính <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setGender('Nam')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                        gender === 'Nam'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span>👦 Nam</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('Nữ')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                        gender === 'Nữ'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span>👧 Nữ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hàng: Ngày sinh, STT, Tổ học tập bố trí đúng hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Ngày sinh */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ngày sinh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* STT trong lớp */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Số thứ tự (STT)</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={orderNumber}
                      onChange={e => setOrderNumber(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="VD: 15"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Tổ học tập */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Tổ học tập</label>
                  <div className="relative">
                    <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={studyGroup}
                      onChange={e => setStudyGroup(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs"
                    >
                      <option value="Tổ 1">Tổ 1</option>
                      <option value="Tổ 2">Tổ 2</option>
                      <option value="Tổ 3">Tổ 3</option>
                      <option value="Tổ 4">Tổ 4</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Địa chỉ & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Địa chỉ thường trú</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="VD: Số 12, Phố Hoàng Hoa Thám, Ba Đình, Hà Nội"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Email học sinh (nếu có)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="VD: hs.anhnv@truong.edu.vn"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Khối gợi ý liên lạc Bố/Mẹ */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/70 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-blue-900">
                      Cần thêm thông tin liên lạc Bố/Mẹ để kích hoạt sổ liên lạc điện tử
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Phụ huynh sẽ nhận thông báo điểm danh, bài tập và trao đổi trực tiếp với giáo viên qua ứng dụng.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline shrink-0"
                >
                  Thông tin phụ huynh →
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: THÔNG TIN PHỤ HUYNH ================= */}
          {activeTab === 'parent' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-2xl flex items-center justify-between text-xs text-purple-900">
                <span className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Hồ sơ liên lạc gia đình & Người giám hộ học sinh {fullName ? `"${fullName}"` : ''}
                </span>
                <span className="text-[11px] font-semibold text-purple-700">Tự động đồng bộ SMS & Zalo</span>
              </div>

              {/* Thông tin Mẹ */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    👩 Thông tin Mẹ học sinh
                  </h4>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 cursor-pointer">
                    <input
                      type="radio"
                      name="primaryContact"
                      checked={primaryContact === 'mother'}
                      onChange={() => setPrimaryContact('mother')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    Liên hệ chính
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên Mẹ</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={motherName}
                        onChange={e => setMotherName(e.target.value)}
                        placeholder="VD: Trần Thị Mai"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại Mẹ</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={motherPhone}
                        onChange={e => setMotherPhone(e.target.value)}
                        placeholder="VD: 0912 345 678"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                    {errors.motherPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.motherPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Thông tin Bố */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 flex items-center gap-2">
                    👨 Thông tin Bố học sinh
                  </h4>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 cursor-pointer">
                    <input
                      type="radio"
                      name="primaryContact"
                      checked={primaryContact === 'father'}
                      onChange={() => setPrimaryContact('father')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    Liên hệ chính
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và tên Bố</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={fatherName}
                        onChange={e => setFatherName(e.target.value)}
                        placeholder="VD: Nguyễn Văn Hùng"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại Bố</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={fatherPhone}
                        onChange={e => setFatherPhone(e.target.value)}
                        placeholder="VD: 0988 765 432"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </div>
                    {errors.fatherPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.fatherPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Ghi chú phụ huynh */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Ghi chú sức khỏe / Lưu ý giáo viên từ phụ huynh
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="VD: Học sinh bị cận thị cần ngồi bàn đầu, hay say xe khi đi dã ngoại..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Switch tab link or back */}
          <div>
            {activeTab === 'student' ? (
              <button
                type="button"
                onClick={handleNextToParent}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span>Chuyển sang tab phụ huynh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại thông tin học sinh</span>
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Thêm học sinh ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
