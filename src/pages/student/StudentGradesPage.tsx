import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { GraduationCap, Award, TrendingUp, BookOpen, Clock } from 'lucide-react';

export const StudentGradesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { grades } = useApp();

  const studentId = currentUser.studentId || 'hs-1';
  const myGrade = grades.find(g => g.studentId === studentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-cyan-400" />
          Bảng điểm & Kết quả học tập cá nhân
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Theo dõi chi tiết các đầu điểm kiểm tra thường xuyên, giữa kỳ và điểm trung bình môn
        </p>
      </div>

      {/* Grade Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl shadow-sm">
          <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Điểm Trung bình môn Toán</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black">{myGrade?.average ?? '9.1'}</span>
            <span className="text-xs font-bold text-blue-200">/ 10</span>
          </div>
          <p className="text-xs text-blue-100 mt-1">Xếp loại: Xuất sắc (Giỏi)</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Điểm thi giữa kỳ</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{myGrade?.midTerm ?? '9.0'}</span>
            <span className="text-xs font-bold text-emerald-600">Hệ số x2</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đạt điểm tối đa phần Đại số</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Điểm thi cuối kỳ</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{myGrade?.finalTerm ?? '9.2'}</span>
            <span className="text-xs font-bold text-blue-600">Hệ số x3</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Dự kiến kiểm tra vào tháng 12</p>
        </div>
      </div>

      {/* Detailed Subject Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Chi tiết bảng điểm các môn học:</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                <th className="p-3">Môn học</th>
                <th className="p-3 text-center">Miệng 1</th>
                <th className="p-3 text-center">Miệng 2</th>
                <th className="p-3 text-center">15 phút 1</th>
                <th className="p-3 text-center">15 phút 2</th>
                <th className="p-3 text-center bg-blue-50/50">Giữa kỳ (x2)</th>
                <th className="p-3 text-center bg-blue-50/50">Cuối kỳ (x3)</th>
                <th className="p-3 text-center bg-indigo-50 font-black text-blue-700">ĐTB</th>
                <th className="p-3 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-3 font-bold text-slate-900">Toán học (Đại số & Hình học)</td>
                <td className="p-3 text-center">{myGrade?.oral1 ?? 9.0}</td>
                <td className="p-3 text-center">{myGrade?.oral2 ?? 9.5}</td>
                <td className="p-3 text-center">{myGrade?.test15m1 ?? 9.0}</td>
                <td className="p-3 text-center">{myGrade?.test15m2 ?? 8.5}</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">{myGrade?.midTerm ?? 9.0}</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">{myGrade?.finalTerm ?? 9.2}</td>
                <td className="p-3 text-center font-black text-sm text-blue-600 bg-indigo-50/30">
                  {myGrade?.average ?? 9.1}
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Giỏi
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Ngữ văn 9</td>
                <td className="p-3 text-center">8.5</td>
                <td className="p-3 text-center">8.0</td>
                <td className="p-3 text-center">8.5</td>
                <td className="p-3 text-center">8.0</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">8.5</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">8.8</td>
                <td className="p-3 text-center font-black text-sm text-blue-600 bg-indigo-50/30">8.5</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Giỏi
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Tiếng Anh 9</td>
                <td className="p-3 text-center">9.0</td>
                <td className="p-3 text-center">9.0</td>
                <td className="p-3 text-center">9.5</td>
                <td className="p-3 text-center">9.0</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">9.0</td>
                <td className="p-3 text-center font-bold text-slate-900 bg-blue-50/20">9.2</td>
                <td className="p-3 text-center font-black text-sm text-blue-600 bg-indigo-50/30">9.1</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Giỏi
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
