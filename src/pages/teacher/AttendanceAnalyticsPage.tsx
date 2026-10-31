import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { LineChart, CheckCircle2, AlertCircle, Clock, Users, ArrowUpRight, TrendingUp } from 'lucide-react';

export const AttendanceAnalyticsPage: React.FC = () => {
  const { students, selectedClass, attendance } = useApp();
  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  // Overall attendance rate
  const overallRate = classStudents.length > 0
    ? (classStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / classStudents.length).toFixed(1)
    : '97.2';

  // Attendance breakdown
  const weeks = [
    { week: 'Tuần 1 (05/09 - 10/09)', presentRate: 98.5, late: 2, absent: 1 },
    { week: 'Tuần 2 (12/09 - 17/09)', presentRate: 97.8, late: 3, absent: 2 },
    { week: 'Tuần 3 (19/09 - 24/09)', presentRate: 96.5, late: 4, absent: 3 },
    { week: 'Tuần 4 (26/09 - 01/10)', presentRate: 98.0, late: 1, absent: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <LineChart className="w-6 h-6 text-cyan-400" />
          Thống kê & Phân tích chuyên cần: {selectedClass?.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Theo dõi tỷ lệ chuyên cần theo tuần, học kỳ và danh sách học sinh cần lưu ý
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tỷ lệ đi học trung bình</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{overallRate}%</span>
            <span className="text-xs font-bold text-emerald-700">Đạt chuẩn A</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Cao hơn 1.2% so với mặt bằng khối 9</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Chuyên cần tuyệt đối 100%</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">24 HS</span>
            <span className="text-xs text-slate-500">/ 38 HS</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đi học đúng giờ đầy đủ các buổi</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Học sinh vắng có phép</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">5 lượt</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Có đơn xin phép hợp lệ từ phụ huynh</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Học sinh cần nhắc nhở</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">2 HS</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đi trễ trên 2 lần trong tháng</p>
        </div>
      </div>

      {/* Weekly Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Diễn biến chuyên cần theo tuần học:</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
              <tr>
                <th className="p-3">Tuần học</th>
                <th className="p-3 text-center">Tỷ lệ có mặt</th>
                <th className="p-3 text-center">Số lượt đi muộn</th>
                <th className="p-3 text-center">Số lượt vắng</th>
                <th className="p-3 text-center">Đánh giá chung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {weeks.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{w.week}</td>
                  <td className="p-3 text-center">
                    <span className="font-extrabold text-emerald-600 text-sm">{w.presentRate}%</span>
                  </td>
                  <td className="p-3 text-center text-amber-600 font-semibold">{w.late}</td>
                  <td className="p-3 text-center text-rose-600 font-semibold">{w.absent}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Tốt
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
