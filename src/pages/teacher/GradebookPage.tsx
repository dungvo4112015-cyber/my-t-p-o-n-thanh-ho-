import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { GradeItem } from '../../types';
import {
  GraduationCap,
  Save,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  History,
  RotateCcw,
} from 'lucide-react';

export const GradebookPage: React.FC = () => {
  const { students, selectedClass, grades, saveGradesBatch, showToast } = useApp();

  const classStudents = students.filter(s => s.classId === selectedClass?.id);

  // Editable spreadsheet rows
  const [localGrades, setLocalGrades] = useState<GradeItem[]>([]);
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize spreadsheet from store
  useEffect(() => {
    const list: GradeItem[] = classStudents.map(st => {
      const match = grades.find(g => g.studentId === st.id);
      if (match) return { ...match };
      return {
        id: `gr-${st.id}`,
        studentId: st.id,
        studentName: st.fullName,
        classId: selectedClass?.id || 'cls-9a1',
        subject: 'Toán học',
        oral1: undefined,
        oral2: undefined,
        test15m1: undefined,
        test15m2: undefined,
        midTerm: undefined,
        finalTerm: undefined,
        average: undefined,
      };
    });
    setLocalGrades(list);
    setModifiedCells(new Set());
    setHasUnsavedChanges(false);
  }, [selectedClass?.id, grades, classStudents.length]);

  const calculateAverage = (item: GradeItem): number | undefined => {
    let sum = 0;
    let weight = 0;
    if (item.oral1 !== undefined) { sum += item.oral1; weight += 1; }
    if (item.oral2 !== undefined) { sum += item.oral2; weight += 1; }
    if (item.test15m1 !== undefined) { sum += item.test15m1; weight += 1; }
    if (item.test15m2 !== undefined) { sum += item.test15m2; weight += 1; }
    if (item.midTerm !== undefined) { sum += item.midTerm * 2; weight += 2; }
    if (item.finalTerm !== undefined) { sum += item.finalTerm * 3; weight += 3; }
    if (weight === 0) return undefined;
    return Number((sum / weight).toFixed(1));
  };

  const handleCellChange = (
    studentId: string,
    field: keyof Omit<GradeItem, 'id' | 'studentId' | 'studentName' | 'classId' | 'subject' | 'average'>,
    valStr: string
  ) => {
    const num = valStr.trim() === '' ? undefined : parseFloat(valStr);

    if (num !== undefined && (isNaN(num) || num < 0 || num > 10)) {
      showToast('error', 'Điểm phải từ 0 đến 10!');
      return;
    }

    setLocalGrades(prev =>
      prev.map(row => {
        if (row.studentId === studentId) {
          const updated = { ...row, [field]: num };
          updated.average = calculateAverage(updated);
          return updated;
        }
        return row;
      })
    );

    setModifiedCells(prev => new Set(prev).add(`${studentId}-${field}`));
    setHasUnsavedChanges(true);
  };

  const handleBatchSave = () => {
    saveGradesBatch(localGrades);
    setModifiedCells(new Set());
    setHasUnsavedChanges(false);
  };

  const exportExcelCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã HS,Họ và tên,Miệng 1,Miệng 2,15m 1,15m 2,Giữa kỳ,Cuối kỳ,Điểm TB\n' +
      localGrades
        .map(g => {
          const st = classStudents.find(s => s.id === g.studentId);
          return `"${st?.studentCode || ''}","${g.studentName}",${g.oral1 ?? ''},${g.oral2 ?? ''},${g.test15m1 ?? ''},${g.test15m2 ?? ''},${g.midTerm ?? ''},${g.finalTerm ?? ''},${g.average ?? ''}`;
        })
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Diem_${selectedClass?.name || 'Lop'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất bảng điểm ra file CSV thành công!');
  };

  // Grade Statistics
  const validAverages = localGrades.map(g => g.average).filter((a): a is number => a !== undefined);
  const classAvg = validAverages.length > 0 ? (validAverages.reduce((a, b) => a + b, 0) / validAverages.length).toFixed(1) : '8.5';
  const excellentCount = validAverages.filter(a => a >= 8.5).length;
  const goodCount = validAverages.filter(a => a >= 6.5 && a < 8.5).length;
  const passCount = validAverages.filter(a => a >= 5.0 && a < 6.5).length;
  const underCount = validAverages.filter(a => a < 5.0).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
            Sổ điểm điện tử: {selectedClass?.name} - Môn Toán học
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Bảng tính tương tác nhập điểm trực tiếp, tự động tính điểm trung bình môn theo hệ số
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcelCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Xuất Excel/CSV
          </button>

          <button
            onClick={handleBatchSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            Lưu sổ điểm
          </button>
        </div>
      </div>

      {/* Analytics Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-bold uppercase text-slate-400">ĐTB Toàn Lớp</span>
          <p className="text-xl font-black text-blue-600 mt-0.5">{classAvg}</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Giỏi (≥ 8.5)</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{excellentCount} HS</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-bold uppercase text-blue-600">Khá (6.5 - 8.4)</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{goodCount} HS</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-bold uppercase text-amber-600">Đạt (5.0 - 6.4)</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{passCount} HS</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-bold uppercase text-rose-600">Chưa đạt (&lt; 5.0)</span>
          <p className="text-xl font-black text-slate-800 mt-0.5">{underCount} HS</p>
        </div>
      </div>

      {/* Interactive Spreadsheet with Sticky Header & First Column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/90 backdrop-blur-md sticky top-0 z-20 font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 sticky left-0 bg-slate-100 z-30 min-w-[200px] border-r border-slate-200">
                  Học sinh
                </th>
                <th className="py-3 px-3 text-center min-w-[90px]">Miệng 1 (x1)</th>
                <th className="py-3 px-3 text-center min-w-[90px]">Miệng 2 (x1)</th>
                <th className="py-3 px-3 text-center min-w-[90px]">15 phút 1 (x1)</th>
                <th className="py-3 px-3 text-center min-w-[90px]">15 phút 2 (x1)</th>
                <th className="py-3 px-3 text-center min-w-[90px] bg-blue-50/50">Giữa kỳ (x2)</th>
                <th className="py-3 px-3 text-center min-w-[90px] bg-blue-50/50">Cuối kỳ (x3)</th>
                <th className="py-3 px-3 text-center min-w-[100px] bg-indigo-50 font-black text-blue-700">
                  ĐTB Môn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {localGrades.map((row, idx) => {
                const st = classStudents.find(s => s.id === row.studentId);
                return (
                  <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Sticky first column */}
                    <td className="py-2.5 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 w-5">{idx + 1}</span>
                      <span className="truncate">{row.studentName}</span>
                    </td>

                    {/* Oral 1 */}
                    <td className={`p-1.5 text-center ${modifiedCells.has(`${row.studentId}-oral1`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.oral1 ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'oral1', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-semibold text-slate-800"
                        placeholder="-"
                      />
                    </td>

                    {/* Oral 2 */}
                    <td className={`p-1.5 text-center ${modifiedCells.has(`${row.studentId}-oral2`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.oral2 ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'oral2', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-semibold text-slate-800"
                        placeholder="-"
                      />
                    </td>

                    {/* 15m 1 */}
                    <td className={`p-1.5 text-center ${modifiedCells.has(`${row.studentId}-test15m1`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.test15m1 ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'test15m1', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-semibold text-slate-800"
                        placeholder="-"
                      />
                    </td>

                    {/* 15m 2 */}
                    <td className={`p-1.5 text-center ${modifiedCells.has(`${row.studentId}-test15m2`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.test15m2 ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'test15m2', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-semibold text-slate-800"
                        placeholder="-"
                      />
                    </td>

                    {/* Mid Term */}
                    <td className={`p-1.5 text-center bg-blue-50/20 ${modifiedCells.has(`${row.studentId}-midTerm`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.midTerm ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'midTerm', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-bold text-slate-900"
                        placeholder="-"
                      />
                    </td>

                    {/* Final Term */}
                    <td className={`p-1.5 text-center bg-blue-50/20 ${modifiedCells.has(`${row.studentId}-finalTerm`) ? 'bg-amber-100/50' : ''}`}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.finalTerm ?? ''}
                        onChange={e => handleCellChange(row.studentId, 'finalTerm', e.target.value)}
                        className="w-16 p-1 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg focus:outline-none font-bold text-slate-900"
                        placeholder="-"
                      />
                    </td>

                    {/* Average */}
                    <td className="p-2 text-center bg-indigo-50/50 font-black text-sm text-blue-700">
                      {row.average !== undefined ? row.average.toFixed(1) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Bạn có ô điểm đã chỉnh sửa chưa được lưu
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tất cả điểm số đã đồng bộ lên hệ thống
            </span>
          )}
        </div>

        <button
          onClick={handleBatchSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
        >
          <Save className="w-4 h-4" />
          Lưu thay đổi sổ điểm
        </button>
      </div>
    </div>
  );
};
