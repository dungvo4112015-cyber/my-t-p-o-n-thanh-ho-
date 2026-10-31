import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Settings, School, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useApp();

  const [schoolName, setSchoolName] = useState('Trường THCS Chu Văn An');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Học kỳ I');
  const [address, setAddress] = useState('Số 10 Thụy Khuê, Tây Hồ, Hà Nội');
  const [phone, setPhone] = useState('024 3823 4567');
  const [email, setEmail] = useState('c2chuvanan@hanoiedu.vn');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Đã lưu cấu hình trường học thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-cyan-400" />
          Cấu hình trường học & Hệ thống
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Thiết lập thông tin nhà trường, năm học hiện hành và thông tin liên hệ
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên trường học *</label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Năm học hiện hành</label>
              <input
                type="text"
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Học kỳ</label>
              <select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Học kỳ I">Học kỳ I</option>
                <option value="Học kỳ II">Học kỳ II</option>
                <option value="Cả năm">Cả năm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Địa chỉ trụ sở</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email trường</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              Lưu cấu hình hệ thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
