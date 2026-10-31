import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';
import { Student } from '../../types';

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportStudentModal: React.FC<ImportStudentModalProps> = ({ isOpen, onClose }) => {
  const { selectedClass, importStudents, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({
    studentCode: 'Mã học sinh',
    fullName: 'Họ và tên',
    dob: 'Ngày sinh',
    gender: 'Giới tính',
    parentName: 'Họ tên phụ huynh',
    parentPhone: 'SĐT phụ huynh',
    address: 'Địa chỉ',
  });
  const [validationErrors, setValidationErrors] = useState<{ row: number; column: string; message: string }[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  // Mock template download
  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã học sinh,Họ và tên,Ngày sinh,Giới tính,Họ tên phụ huynh,SĐT phụ huynh,Địa chỉ\n' +
      'HS240910,Nguyễn Văn Khoa,2010-05-15,Nam,Nguyễn Văn Thành,0905111222,Số 15 Cầu Giấy Hà Nội\n' +
      'HS240911,Lê Thị Mỹ Uyên,2010-08-20,Nữ,Lê Văn Dũng,0912333444,Yên Hòa Cầu Giấy Hà Nội\n' +
      'HS240912,Trần Quang Hải,2010-02-10,Nam,Trần Đức Minh,0987666555,Dịch Vọng Cầu Giấy Hà Nội';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mau_Import_Hoc_Sinh_${selectedClass?.name || 'Lop'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Đã tải xuống file mẫu Excel/CSV!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Read and parse CSV / Text
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 1) {
        // Headers
        const headers = lines[0].split(',').map(h => h.trim());
        const rows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
          });
          rows.push(obj);
        }
        setParsedRows(rows);
      } else {
        // Fallback sample data if empty file chosen
        setParsedRows([
          {
            'Mã học sinh': 'HS240910',
            'Họ và tên': 'Nguyễn Văn Khoa',
            'Ngày sinh': '2010-05-15',
            'Giới tính': 'Nam',
            'Họ tên phụ huynh': 'Nguyễn Văn Thành',
            'SĐT phụ huynh': '0905111222',
            'Địa chỉ': 'Số 15 Cầu Giấy, Hà Nội',
          },
          {
            'Mã học sinh': 'HS240911',
            'Họ và tên': 'Lê Thị Mỹ Uyên',
            'Ngày sinh': '2010-08-20',
            'Giới tính': 'Nữ',
            'Họ tên phụ huynh': 'Lê Văn Dũng',
            'SĐT phụ huynh': '0912333444',
            'Địa chỉ': 'Yên Hòa, Cầu Giấy, Hà Nội',
          },
          {
            'Mã học sinh': 'HS240912',
            'Họ và tên': 'Trần Quang Hải',
            'Ngày sinh': '2010-02-10',
            'Giới tính': 'Nam',
            'Họ tên phụ huynh': 'Trần Đức Minh',
            'SĐT phụ huynh': '0987666555',
            'Địa chỉ': 'Dịch Vọng, Cầu Giấy, Hà Nội',
          },
        ]);
      }
      setStep(3); // proceed to mapping
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    const errors: { row: number; column: string; message: string }[] = [];

    parsedRows.forEach((row, idx) => {
      const code = row[columnMapping.studentCode];
      const name = row[columnMapping.fullName];
      const phone = row[columnMapping.parentPhone];

      if (!code) {
        errors.push({ row: idx + 1, column: 'Mã học sinh', message: 'Mã học sinh không được để trống' });
      }
      if (!name) {
        errors.push({ row: idx + 1, column: 'Họ và tên', message: 'Họ tên không được để trống' });
      }
      if (phone && !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
        errors.push({ row: idx + 1, column: 'SĐT phụ huynh', message: 'Số điện thoại phụ huynh chưa đúng 10 chữ số' });
      }
    });

    setValidationErrors(errors);
    setStep(5); // Show validation state
  };

  const handleExecuteImport = () => {
    const studentsToImport: Omit<Student, 'id'>[] = parsedRows.map((r, i) => ({
      studentCode: r[columnMapping.studentCode] || `HS2409${90 + i}`,
      fullName: r[columnMapping.fullName] || 'Học sinh mới',
      dob: r[columnMapping.dob] || '2010-01-01',
      gender: r[columnMapping.gender] === 'Nữ' ? 'Nữ' : 'Nam',
      classId: selectedClass?.id || 'cls-9a1',
      className: selectedClass?.name || 'Lớp 9A1',
      parentName: r[columnMapping.parentName] || 'Phụ huynh',
      parentPhone: r[columnMapping.parentPhone] || '0901234567',
      address: r[columnMapping.address] || 'Hà Nội',
      status: 'STUDYING',
      conduct: 'Tốt',
      gpa: 8.0,
      rewardPoints: 50,
      attendanceRate: 100,
    }));

    const result = importStudents(studentsToImport);
    setImportResult({ success: result.successCount, failed: result.failedCount });
    setStep(6);
  };

  const handleCloseAll = () => {
    setStep(1);
    setFileName('');
    setParsedRows([]);
    setValidationErrors([]);
    setImportResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAll} maxWidth="3xl" title="Wizard Import học sinh từ Excel/CSV">
      <div className="space-y-6">
        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-3">
          {[
            { num: 1, title: 'Tải mẫu' },
            { num: 2, title: 'Tải file lên' },
            { num: 3, title: 'Map cột' },
            { num: 4, title: 'Xem trước' },
            { num: 5, title: 'Kiểm tra' },
            { num: 6, title: 'Hoàn tất' },
          ].map(s => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className={`hidden sm:inline ${step === s.num ? 'text-blue-600 font-bold' : ''}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Download Sample */}
        {step === 1 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Bước 1: Tải xuống file mẫu chuẩn</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Tải file mẫu Excel/CSV có định dạng cấu trúc chuẩn của trường học để chuẩn bị dữ liệu học sinh chính xác.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadSample}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Tải file mẫu (.CSV)
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Tiếp tục: Tải file lên</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Upload File */}
        {step === 2 && (
          <div className="py-6 space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-8 text-center transition-all bg-slate-50/50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Kéo thả file Excel hoặc CSV vào đây</p>
              <p className="text-xs text-slate-500 mt-1">Hỗ trợ các định dạng .csv, .xlsx, .xls</p>
              <label className="mt-4 inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                Chọn file từ máy tính
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                onClick={() => {
                  // Quick sample load if user clicks next without selecting file
                  setParsedRows([
                    {
                      'Mã học sinh': 'HS240910',
                      'Họ và tên': 'Nguyễn Văn Khoa',
                      'Ngày sinh': '2010-05-15',
                      'Giới tính': 'Nam',
                      'Họ tên phụ huynh': 'Nguyễn Văn Thành',
                      'SĐT phụ huynh': '0905111222',
                      'Địa chỉ': 'Số 15 Cầu Giấy, Hà Nội',
                    },
                    {
                      'Mã học sinh': 'HS240911',
                      'Họ và tên': 'Lê Thị Mỹ Uyên',
                      'Ngày sinh': '2010-08-20',
                      'Giới tính': 'Nữ',
                      'Họ tên phụ huynh': 'Lê Văn Dũng',
                      'SĐT phụ huynh': '0912333444',
                      'Địa chỉ': 'Yên Hòa, Cầu Giấy, Hà Nội',
                    },
                    {
                      'Mã học sinh': 'HS240912',
                      'Họ và tên': 'Trần Quang Hải',
                      'Ngày sinh': '2010-02-10',
                      'Giới tính': 'Nam',
                      'Họ tên phụ huynh': 'Trần Đức Minh',
                      'SĐT phụ huynh': '0987666555',
                      'Địa chỉ': 'Dịch Vọng, Cầu Giấy, Hà Nội',
                    },
                  ]);
                  setStep(3);
                }}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Dùng dữ liệu mẫu demo →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Mapping Columns */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Kiểm tra ánh xạ giữa các trường trong cơ sở dữ liệu và tiêu đề cột trong file bạn vừa tải lên:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              {Object.keys(columnMapping).map(key => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700 capitalize">{key}:</span>
                  <input
                    type="text"
                    value={columnMapping[key]}
                    onChange={e => setColumnMapping({ ...columnMapping, [key]: e.target.value })}
                    className="w-40 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Tiếp tục: Xem trước ({parsedRows.length} dòng) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
              <span>Xem trước dữ liệu ({parsedRows.length} học sinh):</span>
              <span className="text-blue-600">Đích đến: {selectedClass?.name}</span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-56">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Mã HS</th>
                    <th className="p-2.5">Họ và tên</th>
                    <th className="p-2.5">Ngày sinh</th>
                    <th className="p-2.5">Giới tính</th>
                    <th className="p-2.5">Phụ huynh</th>
                    <th className="p-2.5">SĐT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-800">{r[columnMapping.studentCode]}</td>
                      <td className="p-2.5">{r[columnMapping.fullName]}</td>
                      <td className="p-2.5">{r[columnMapping.dob]}</td>
                      <td className="p-2.5">{r[columnMapping.gender]}</td>
                      <td className="p-2.5">{r[columnMapping.parentName]}</td>
                      <td className="p-2.5">{r[columnMapping.parentPhone]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                onClick={handleValidate}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Kiểm tra tính hợp lệ dữ liệu <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Validate & Confirm */}
        {step === 5 && (
          <div className="space-y-4">
            {validationErrors.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs text-emerald-900">Dữ liệu hoàn toàn hợp lệ!</h5>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Tất cả {parsedRows.length} dòng dữ liệu đã vượt qua các điều kiện kiểm tra định dạng và trường bắt buộc.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Phát hiện {validationErrors.length} lỗi trong file:</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                  {validationErrors.map((err, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 text-rose-700">
                      Dòng {err.row}, Cột [{err.column}]: {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <button
                onClick={handleExecuteImport}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                <FileCheck className="w-4 h-4" />
                Xác nhận Import vào lớp {selectedClass?.name}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Result */}
        {step === 6 && importResult && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Import hoàn tất thành công!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Đã thêm thành công <span className="font-bold text-emerald-600">{importResult.success}</span> học sinh
                vào lớp {selectedClass?.name}.
              </p>
              {importResult.failed > 0 && (
                <p className="text-xs text-rose-600 mt-0.5">Bỏ qua {importResult.failed} dòng bị trùng hoặc thiếu trường bắt buộc.</p>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={handleCloseAll}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Xem danh sách học sinh
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
