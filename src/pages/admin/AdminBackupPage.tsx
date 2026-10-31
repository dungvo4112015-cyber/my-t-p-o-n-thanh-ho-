import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { StorageService } from '../../services/storage';
import { Database, Download, Upload, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminBackupPage: React.FC = () => {
  const { resetDatabaseToDefault, showToast } = useApp();

  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      school: 'THCS Chu Văn An',
      users: StorageService.getUsers(),
      classes: StorageService.getClasses(),
      students: StorageService.getStudents(),
      attendance: StorageService.getAttendance(),
      grades: StorageService.getGrades(),
      assignments: StorageService.getAssignments(),
      submissions: StorageService.getSubmissions(),
      quizzes: StorageService.getQuizzes(),
      resources: StorageService.getResources(),
      behaviors: StorageService.getBehaviors(),
      rewards: StorageService.getRewards(),
      alerts: StorageService.getAlerts(),
      announcements: StorageService.getAnnouncements(),
      auditLogs: StorageService.getAuditLogs(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `EduSmart_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    showToast('success', 'Đã tải xuống file sao lưu hệ thống toàn vẹn (.JSON)!');
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cơ sở dữ liệu về trạng thái mẫu ban đầu?')) {
      resetDatabaseToDefault();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Database className="w-6 h-6 text-cyan-400" />
          Sao lưu, Phục hồi & Quản trị Dữ liệu
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Xuất file sao lưu dự phòng toàn bộ dữ liệu, khôi phục dữ liệu mẫu ban đầu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900">Sao lưu dữ liệu toàn hệ thống</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tải xuống bản sao lưu đầy đủ bao gồm danh sách học sinh, điểm số, lịch sử điểm danh và nhật ký audit log dưới dạng file JSON.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Tải bản sao lưu (.JSON)
          </button>
        </div>

        {/* Reset Demo Data Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900">Khôi phục dữ liệu mẫu ban đầu</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Đặt lại toàn bộ trạng thái hệ thống về bộ dữ liệu mẫu chuẩn (4 lớp học 9A1, 9A2, 8B, 7A cùng đầy đủ học sinh và điểm số).
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Khôi phục dữ liệu mẫu Demo
          </button>
        </div>
      </div>
    </div>
  );
};
