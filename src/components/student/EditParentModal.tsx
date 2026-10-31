import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { Modal } from '../common/Modal';
import {
  Users2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  Save,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  FileText,
} from 'lucide-react';

interface EditParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSaved?: (updated: Student) => void;
}

export const EditParentModal: React.FC<EditParentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaved,
}) => {
  const { updateStudent, showToast } = useApp();

  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [fatherJob, setFatherJob] = useState('');

  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [motherJob, setMotherJob] = useState('');

  const [primaryContact, setPrimaryContact] = useState<'father' | 'mother' | 'guardian'>('mother');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [parentNotes, setParentNotes] = useState('');
  const [parentLinked, setParentLinked] = useState(true);

  useEffect(() => {
    if (student) {
      setFatherName(student.fatherName || '');
      setFatherPhone(student.fatherPhone || '');
      setFatherJob(student.fatherJob || '');

      setMotherName(student.motherName || (student.parentName && student.primaryContact !== 'father' ? student.parentName : ''));
      setMotherPhone(student.motherPhone || (student.parentPhone && student.primaryContact !== 'father' ? student.parentPhone : ''));
      setMotherJob(student.motherJob || '');

      setPrimaryContact(student.primaryContact || (student.fatherName && !student.motherName ? 'father' : 'mother'));
      setParentEmail(student.parentEmail || '');
      setAddress(student.address || '');
      setParentNotes(student.parentNotes || '');
      setParentLinked(student.parentLinked ?? true);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine resolved primary contact name and phone
    const resolvedParentName =
      primaryContact === 'father'
        ? fatherName.trim() || motherName.trim() || student.parentName
        : motherName.trim() || fatherName.trim() || student.parentName;

    const resolvedParentPhone =
      primaryContact === 'father'
        ? fatherPhone.trim() || motherPhone.trim() || student.parentPhone
        : motherPhone.trim() || fatherPhone.trim() || student.parentPhone;

    const updates: Partial<Student> = {
      parentName: resolvedParentName || 'Phụ huynh ' + student.fullName,
      parentPhone: resolvedParentPhone || '0900000000',
      fatherName: fatherName.trim(),
      fatherPhone: fatherPhone.trim(),
      fatherJob: fatherJob.trim(),
      motherName: motherName.trim(),
      motherPhone: motherPhone.trim(),
      motherJob: motherJob.trim(),
      primaryContact,
      parentEmail: parentEmail.trim(),
      address: address.trim(),
      parentNotes: parentNotes.trim(),
      parentLinked,
    };

    updateStudent(student.id, updates);
    showToast('success', `Đã cập nhật thông tin phụ huynh cho học sinh ${student.fullName}!`);
    if (onSaved) {
      onSaved({ ...student, ...updates });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Cập nhật thông tin phụ huynh</h3>
            <p className="text-xs text-slate-500 font-normal">
              Học sinh: <strong className="text-blue-700">{student.fullName}</strong> ({student.studentCode}) • Lớp {student.className}
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Người liên hệ chính & trạng thái */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="font-bold text-slate-800 block text-xs">Người liên hệ chính của học sinh</label>
              <p className="text-[11px] text-slate-500">Giáo viên sẽ ưu tiên gọi điện/gửi thông báo trước</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="radio"
                  name="primaryContact"
                  checked={primaryContact === 'mother'}
                  onChange={() => setPrimaryContact('mother')}
                  className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Mẹ</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="radio"
                  name="primaryContact"
                  checked={primaryContact === 'father'}
                  onChange={() => setPrimaryContact('father')}
                  className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Bố</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="radio"
                  name="primaryContact"
                  checked={primaryContact === 'guardian'}
                  onChange={() => setPrimaryContact('guardian')}
                  className="text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Người giám hộ</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Tài khoản Sổ liên lạc điện tử:
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={parentLinked}
                onChange={e => setParentLinked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className={`text-xs font-bold ${parentLinked ? 'text-emerald-700' : 'text-slate-500'}`}>
                {parentLinked ? 'Đã kích hoạt & liên kết ứng dụng' : 'Chưa kích hoạt'}
              </span>
            </label>
          </div>
        </div>

        {/* 2 Cột: Thông tin Bố và Thông tin Mẹ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin Bố */}
          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-blue-200/60">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                B
              </span>
              <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wide">
                Thông tin Bố (Cha)
              </h4>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên bố</label>
              <input
                type="text"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
                placeholder="VD: Lê Văn Hùng"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Số điện thoại bố
              </label>
              <input
                type="tel"
                value={fatherPhone}
                onChange={e => setFatherPhone(e.target.value)}
                placeholder="VD: 0912111222"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Nghề nghiệp / Đơn vị công tác
              </label>
              <input
                type="text"
                value={fatherJob}
                onChange={e => setFatherJob(e.target.value)}
                placeholder="VD: Kỹ sư xây dựng"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Thông tin Mẹ */}
          <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-pink-200/60">
              <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-[11px]">
                M
              </span>
              <h4 className="font-extrabold text-pink-950 text-xs uppercase tracking-wide">
                Thông tin Mẹ
              </h4>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và tên mẹ</label>
              <input
                type="text"
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
                placeholder="VD: Trần Thị Mai"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Số điện thoại mẹ
              </label>
              <input
                type="tel"
                value={motherPhone}
                onChange={e => setMotherPhone(e.target.value)}
                placeholder="VD: 0933221100"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Nghề nghiệp / Đơn vị công tác
              </label>
              <input
                type="text"
                value={motherJob}
                onChange={e => setMotherJob(e.target.value)}
                placeholder="VD: Bác sĩ, Giáo viên..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ & Email liên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email liên hệ phụ huynh
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={e => setParentEmail(e.target.value)}
              placeholder="VD: phuhuynh@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Địa chỉ gia đình
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="VD: Số 12 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Ghi chú & Dặn dò đặc biệt từ phụ huynh */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Ghi chú / Lưu ý riêng từ phụ huynh đối với học sinh
          </label>
          <textarea
            rows={3}
            value={parentNotes}
            onChange={e => setParentNotes(e.target.value)}
            placeholder="VD: Dặn dò đưa đón, tiền sử bệnh tật hoặc dị ứng thực phẩm, nguyện vọng gia đình gửi gắm thầy cô..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu thông tin phụ huynh
          </button>
        </div>
      </form>
    </Modal>
  );
};
