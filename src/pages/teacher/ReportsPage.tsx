import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  FileBarChart,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Smile,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { students, selectedClass, grades, attendance, behaviors, showToast } = useApp();

  const [reportType, setReportType] = useState<'comprehensive' | 'attendance' | 'academic' | 'behavior'>('comprehensive');
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã HS,Họ và tên,Lớp,Điểm TB,Hạnh kiểm,Chuyên cần,Điểm thi đua\n' +
      classStudents
        .map(s => `"${s.studentCode}","${s.fullName}","${s.className}",${s.gpa},"${s.conduct}",${s.attendanceRate}%,${s.rewardPoints}`)
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_${selectedClass?.name}_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất file báo cáo tổng hợp!');
  };

  return (
    <div className="space-y-6">
      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-6 h-6 text-cyan-400" />
            Báo cáo sư phạm & Tổng kết lớp học
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tổng hợp kết quả học tập, chuyên cần, nề nếp và in phiếu liên lạc lớp {selectedClass?.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Xuất Excel/CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            In báo cáo (PDF)
          </button>
        </div>
      </div>

      {/* Report Controls (hidden in print) */}
      <div className="no-print p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Mẫu báo cáo:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'comprehensive', label: 'Báo cáo tổng hợp lớp' },
              { id: 'academic', label: 'Báo cáo học tập' },
              { id: 'attendance', label: 'Báo cáo chuyên cần' },
              { id: 'behavior', label: 'Báo cáo nề nếp' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  reportType === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Thời điểm: Tháng 10/2026 • Học kỳ I
        </span>
      </div>

      {/* Printable Report Preview Paper */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Official School Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 text-xs">
          <div>
            <p className="font-bold text-slate-800 uppercase">ỦY BAN NHÂN DÂN QUẬN CẦU GIẤY</p>
            <p className="font-extrabold text-slate-900 text-sm uppercase">TRƯỜNG THCS CHU VĂN AN</p>
            <p className="text-slate-500">Địa chỉ: Quận Cầu Giấy, TP. Hà Nội</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-bold text-slate-600 text-[11px]">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-slate-500 mt-1 italic">Hà Nội, ngày 02 tháng 10 năm 2026</p>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
            BÁO CÁO TỔNG KẾT TÌNH HÌNH HỌC TẬP & RÈN LUYỆN
          </h2>
          <p className="text-xs font-bold text-slate-700">
            LỚP: {selectedClass?.name.toUpperCase()} • NIÊN KHÓA 2024-2025
          </p>
          <p className="text-[11px] text-slate-500">
            Giáo viên chủ nhiệm: <strong>{selectedClass?.homeroomTeacherName}</strong> • Sĩ số: <strong>{classStudents.length} học sinh</strong>
          </p>
        </div>

        {/* Summary Statistics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-slate-800">
                <th className="p-2.5 border border-slate-300 text-center w-12">STT</th>
                <th className="p-2.5 border border-slate-300">Mã HS</th>
                <th className="p-2.5 border border-slate-300">Họ và tên học sinh</th>
                <th className="p-2.5 border border-slate-300 text-center">Giới tính</th>
                <th className="p-2.5 border border-slate-300 text-center">ĐTB</th>
                <th className="p-2.5 border border-slate-300 text-center">Chuyên cần</th>
                <th className="p-2.5 border border-slate-300 text-center">Hạnh kiểm</th>
                <th className="p-2.5 border border-slate-300 text-center">Điểm thi đua</th>
                <th className="p-2.5 border border-slate-300">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((st, i) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-300 text-center font-bold">{i + 1}</td>
                  <td className="p-2 border border-slate-300 font-mono">{st.studentCode}</td>
                  <td className="p-2 border border-slate-300 font-bold text-slate-900">{st.fullName}</td>
                  <td className="p-2 border border-slate-300 text-center">{st.gender}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-blue-700">{st.gpa}</td>
                  <td className="p-2 border border-slate-300 text-center font-semibold">{st.attendanceRate}%</td>
                  <td className="p-2 border border-slate-300 text-center">{st.conduct}</td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-purple-700">+{st.rewardPoints}</td>
                  <td className="p-2 border border-slate-300 text-[11px] text-slate-600 italic">
                    {st.notes || 'Học lực tốt, nề nếp ổn định'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Area */}
        <div className="pt-8 flex justify-between text-xs font-bold text-slate-800">
          <div className="text-center space-y-12">
            <p>HIỆU TRƯỞNG DUYỆT</p>
            <p className="font-extrabold uppercase">Lê Thanh Tùng</p>
          </div>
          <div className="text-center space-y-12">
            <p>GIÁO VIÊN CHỦ NHIỆM</p>
            <p className="font-extrabold uppercase">{selectedClass?.homeroomTeacherName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
