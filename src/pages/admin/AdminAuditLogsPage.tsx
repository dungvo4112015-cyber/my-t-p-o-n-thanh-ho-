import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { AuditLog } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { History, ShieldCheck, Download } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs, showToast } = useApp();
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
    return true;
  });

  const exportAuditCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Thời gian,Người thực hiện,Vai trò,Module,Hành động,Chi tiết,Địa chỉ IP\n' +
      filteredLogs
        .map(
          l =>
            `"${l.timestamp}","${l.userName}","${l.userRole}","${l.module}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ipAddress}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất nhật ký kiểm toán Audit Log ra file CSV!');
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      sortable: true,
      render: l => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
          {new Date(l.timestamp).toLocaleTimeString('vi-VN')} {new Date(l.timestamp).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Người thực hiện',
      sortable: true,
      render: l => (
        <div>
          <span className="font-bold text-slate-900 block">{l.userName}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{l.userRole}</span>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      sortable: true,
      render: l => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {l.module}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Chi tiết hành vi ghi nhận',
      render: l => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{l.targetName}</p>
          <p className="text-slate-500 mt-0.5 line-clamp-2">{l.details}</p>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Địa chỉ IP',
      render: l => <span className="font-mono text-xs text-slate-400">{l.ipAddress}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-rose-400" />
            Nhật ký kiểm toán & Hoạt động hệ thống (Audit Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ghi vết toàn bộ hành vi sửa/xóa điểm, điểm danh, thêm học sinh, cấp quyền để phục vụ an toàn thông tin
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Xuất file kiểm toán CSV
        </button>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={l => l.id}
        searchPlaceholder="Tìm kiếm theo tên người thao tác, nội dung, IP..."
        searchableKeys={['userName', 'action', 'details', 'ipAddress', 'targetName']}
      />
    </div>
  );
};
