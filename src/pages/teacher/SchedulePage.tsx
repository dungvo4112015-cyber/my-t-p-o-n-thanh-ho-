import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ScheduleItem } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Pencil,
  Save,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Download,
  X,
  Check,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  FileDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface PeriodDef {
  period: number;
  timeSlot: string;
}

const MORNING_PERIODS: PeriodDef[] = [
  { period: 1, timeSlot: '07:15 - 08:00' },
  { period: 2, timeSlot: '08:05 - 08:50' },
  { period: 3, timeSlot: '09:05 - 09:50' },
  { period: 4, timeSlot: '09:55 - 10:40' },
  { period: 5, timeSlot: '10:45 - 11:30' },
];

const AFTERNOON_PERIODS: PeriodDef[] = [
  { period: 1, timeSlot: '13:30 - 14:15' },
  { period: 2, timeSlot: '14:20 - 15:05' },
  { period: 3, timeSlot: '15:20 - 16:05' },
  { period: 4, timeSlot: '16:10 - 16:55' },
];

const DAYS = [
  { day: 2, label: 'Thứ Hai' },
  { day: 3, label: 'Thứ Ba' },
  { day: 4, label: 'Thứ Tư' },
  { day: 5, label: 'Thứ Năm' },
  { day: 6, label: 'Thứ Sáu' },
  { day: 7, label: 'Thứ Bảy' },
];

const QUICK_SUBJECTS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'KHTN (Vật lý)',
  'KHTN (Hóa học)',
  'KHTN (Sinh học)',
  'Lịch sử & Địa lý',
  'Tin học',
  'GDCD',
  'Công nghệ',
  'Giáo dục thể chất',
  'Nghệ thuật',
  'Chào cờ / SHDC',
  'Sinh hoạt lớp',
  'Hoạt động trải nghiệm',
  'Bồi dưỡng HSG',
  'CLB Tiếng Anh',
  'CLB Robotics',
];

interface EditingCellTarget {
  dayOfWeek: number;
  session: 'MORNING' | 'AFTERNOON';
  period: number;
  timeSlot: string;
  item?: ScheduleItem;
}

export const SchedulePage: React.FC = () => {
  const {
    selectedClass,
    classes,
    setSelectedClassId,
    schedule: contextSchedule,
    saveSchedule,
    showToast,
  } = useApp();

  // Current schedule items state
  const [items, setItems] = useState<ScheduleItem[]>(() => {
    return contextSchedule && contextSchedule.length > 0
      ? contextSchedule
      : StorageService.getSchedule();
  });

  // Keep local items in sync if contextSchedule changes externally
  useEffect(() => {
    if (contextSchedule && contextSchedule.length > 0) {
      setItems(contextSchedule);
    }
  }, [contextSchedule]);

  // Mode states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<ScheduleItem[][]>([]);
  const [redoStack, setRedoStack] = useState<ScheduleItem[][]>([]);

  // Cell Editing Modal / Drawer state
  const [activeCell, setActiveCell] = useState<EditingCellTarget | null>(null);
  const [formSubject, setFormSubject] = useState<string>('');
  const [formTeacher, setFormTeacher] = useState<string>('');
  const [formRoom, setFormRoom] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Export menu toggle
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Record a new state into undo stack
  const pushState = useCallback((newItems: ScheduleItem[]) => {
    setUndoStack(prev => [...prev.slice(-30), items]);
    setRedoStack([]);
    setItems(newItems);
    setHasUnsavedChanges(true);
  }, [items]);

  // Undo logic
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, items]);
    setItems(previous);
    setHasUnsavedChanges(true);
    showToast('info', 'Đã hoàn tác thao tác vừa thực hiện');
  }, [undoStack, items, showToast]);

  // Redo logic
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, items]);
    setItems(next);
    setHasUnsavedChanges(true);
    showToast('info', 'Đã làm lại thao tác');
  }, [redoStack, items, showToast]);

  // Keyboard shortcut listener (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Toggle Edit mode
  const handleToggleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setIsDeleteMode(false); // Mutually exclusive
      showToast('info', 'Đã bật chế độ chỉnh sửa. Nhấp vào ô bất kỳ để cập nhật môn học.');
    } else {
      setIsEditing(false);
      setActiveCell(null);
    }
  };

  // Save changes
  const handleSave = () => {
    saveSchedule(items);
    setHasUnsavedChanges(false);
    showToast('success', 'Đã lưu thời khóa biểu thành công!');
  };

  // Toggle Delete mode
  const handleToggleDelete = () => {
    if (!isDeleteMode) {
      setIsDeleteMode(true);
      setIsEditing(false); // Mutually exclusive
      setActiveCell(null);
      showToast('warning', 'Đã bật chế độ xóa: Nhấp vào ô, hàng hoặc cột để xóa ngay lập tức!');
    } else {
      setIsDeleteMode(false);
      showToast('info', 'Đã tắt chế độ xóa.');
    }
  };

  // Map schedule items for fast lookup: `${session}-${period}-${dayOfWeek}`
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleItem>();
    items.forEach(item => {
      const key = `${item.session}-${item.period}-${item.dayOfWeek}`;
      map.set(key, item);
    });
    return map;
  }, [items]);

  // Action: Delete Single Cell (Instant, no confirm popup)
  const handleDeleteCell = (session: 'MORNING' | 'AFTERNOON', period: number, dayOfWeek: number) => {
    const key = `${session}-${period}-${dayOfWeek}`;
    const exists = scheduleMap.has(key);
    if (!exists) return; // Already empty

    const newItems = items.filter(
      it => !(it.session === session && it.period === period && it.dayOfWeek === dayOfWeek)
    );
    pushState(newItems);
  };

  // Action: Delete Entire Row (All days for this period in this session)
  const handleDeleteRow = (session: 'MORNING' | 'AFTERNOON', period: number) => {
    const newItems = items.filter(
      it => !(it.session === session && it.period === period)
    );
    pushState(newItems);
    showToast('info', `Đã xóa toàn bộ Tiết ${period} (${session === 'MORNING' ? 'Buổi Sáng' : 'Buổi Chiều'})`);
  };

  // Action: Delete Entire Column (All periods for this dayOfWeek)
  const handleDeleteColumn = (dayOfWeek: number) => {
    const dayLabel = DAYS.find(d => d.day === dayOfWeek)?.label || `Thứ ${dayOfWeek}`;
    const newItems = items.filter(it => it.dayOfWeek !== dayOfWeek);
    pushState(newItems);
    showToast('info', `Đã xóa toàn bộ tiết của ${dayLabel}`);
  };

  // Cell Click Handler
  const handleCellClick = (
    session: 'MORNING' | 'AFTERNOON',
    period: number,
    timeSlot: string,
    dayOfWeek: number
  ) => {
    if (isDeleteMode) {
      // Instant Delete without confirmation popup
      handleDeleteCell(session, period, dayOfWeek);
      return;
    }

    if (isEditing) {
      // Open editor for this cell
      const key = `${session}-${period}-${dayOfWeek}`;
      const item = scheduleMap.get(key);
      setActiveCell({
        dayOfWeek,
        session,
        period,
        timeSlot,
        item,
      });
      setFormSubject(item?.subject || '');
      setFormTeacher(item?.teacherName || (selectedClass?.homeroomTeacherName || ''));
      setFormRoom(item?.room || (selectedClass?.room || 'Phòng 402'));
    }
  };

  // Save cell edit
  const handleSaveCell = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeCell) return;

    const trimmedSubject = formSubject.trim();
    const key = `${activeCell.session}-${activeCell.period}-${activeCell.dayOfWeek}`;
    const existing = scheduleMap.get(key);

    if (!trimmedSubject) {
      // If subject was emptied, remove item
      if (existing) {
        const newItems = items.filter(it => it.id !== existing.id);
        pushState(newItems);
      }
      setActiveCell(null);
      return;
    }

    if (existing) {
      // Update existing item
      const newItems = items.map(it => {
        if (it.id === existing.id) {
          return {
            ...it,
            subject: trimmedSubject,
            teacherName: formTeacher.trim() || 'Giáo viên bộ môn',
            room: formRoom.trim() || (selectedClass?.room || 'Phòng học'),
          };
        }
        return it;
      });
      pushState(newItems);
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classId: selectedClass?.id || 'cls-9a1',
        className: selectedClass?.name || '9A1',
        dayOfWeek: activeCell.dayOfWeek,
        session: activeCell.session,
        period: activeCell.period,
        subject: trimmedSubject,
        teacherName: formTeacher.trim() || 'Giáo viên bộ môn',
        room: formRoom.trim() || (selectedClass?.room || 'Phòng học'),
        timeSlot: activeCell.timeSlot,
      };
      pushState([...items, newItem]);
    }

    setActiveCell(null);
  };

  // Export to Excel file (.xlsx)
  const handleExportExcel = () => {
    setShowExportMenu(false);
    const className = selectedClass?.name || 'Lớp';
    const wb = XLSX.utils.book_new();

    const rows: (string | number)[][] = [];

    // Header row
    rows.push(['BUỔI', 'TIẾT', 'THỜI GIAN', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY']);

    // Morning rows
    MORNING_PERIODS.forEach(p => {
      const row: (string | number)[] = ['Sáng', `Tiết ${p.period}`, p.timeSlot];
      DAYS.forEach(d => {
        const item = scheduleMap.get(`MORNING-${p.period}-${d.day}`);
        if (item) {
          row.push(`${item.subject}${item.teacherName ? ` (${item.teacherName})` : ''}`);
        } else {
          row.push('');
        }
      });
      rows.push(row);
    });

    // Afternoon rows
    AFTERNOON_PERIODS.forEach(p => {
      const row: (string | number)[] = ['Chiều', `Tiết ${p.period}`, p.timeSlot];
      DAYS.forEach(d => {
        const item = scheduleMap.get(`AFTERNOON-${p.period}-${d.day}`);
        if (item) {
          row.push(`${item.subject}${item.teacherName ? ` (${item.teacherName})` : ''}`);
        } else {
          row.push('');
        }
      });
      rows.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'ThoiKhoaBieu');
    XLSX.writeFile(wb, `Thoi_Khoa_Bieu_${className.replace(/\s+/g, '_')}.xlsx`);
    showToast('success', `Đã xuất file Excel Thời khóa biểu ${className}!`);
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    setShowExportMenu(false);
    const wb = XLSX.utils.book_new();
    const rows: (string | number)[][] = [
      ['BUỔI', 'TIẾT', 'THỜI GIAN', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'],
      ['Sáng', 'Tiết 1', '07:15 - 08:00', 'Chào cờ', 'Toán học', 'Tin học', 'Ngữ văn', 'Toán học', 'Ôn tập'],
      ['Sáng', 'Tiết 2', '08:05 - 08:50', 'Toán học', 'KHTN', 'Tin học', 'Toán học', 'Ngữ văn', 'Ôn tập'],
      ['Sáng', 'Tiết 3', '09:05 - 09:50', 'Toán học', 'Toán học', 'Tiếng Anh', 'Lịch sử & Địa lý', 'Tiếng Anh', 'Ngoại khóa'],
      ['Sáng', 'Tiết 4', '09:55 - 10:40', 'Ngữ văn', 'Ngữ văn', 'GDCD', 'Tiếng Anh', 'Sinh hoạt lớp', ''],
      ['Sáng', 'Tiết 5', '10:45 - 11:30', 'Tiếng Anh', 'Lịch sử & Địa lý', 'KHTN', 'Công nghệ', 'HĐTN', ''],
      ['Chiều', 'Tiết 1', '13:30 - 14:15', 'Bồi dưỡng Toán', 'Bồi dưỡng Văn', 'CLB STEM', 'Luyện giải Toán', '', ''],
      ['Chiều', 'Tiết 2', '14:20 - 15:05', 'Bồi dưỡng Toán', 'Bồi dưỡng Văn', 'CLB STEM', 'Bồi dưỡng Anh', '', ''],
      ['Chiều', 'Tiết 3', '15:20 - 16:05', 'Thể dục', 'Nghệ thuật', 'Thể dục', 'Kỹ năng sống', '', ''],
      ['Chiều', 'Tiết 4', '16:10 - 16:55', 'CLB Tiếng Anh', 'CLB Robotics', 'Tự học', 'Đọc sách', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'MauTKB');
    XLSX.writeFile(wb, 'Mau_Thoi_Khoa_Bieu_Chuan.xlsx');
    showToast('info', 'Đã tải xuống file mẫu Excel!');
  };

  // Import Excel Handler
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const buffer = evt.target?.result;
        if (!buffer) throw new Error('Không đọc được file');

        const wb = XLSX.read(buffer, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 });

        if (!rawData || rawData.length < 2) {
          showToast('error', 'File Excel không có dữ liệu thời khóa biểu hợp lệ!');
          return;
        }

        const newItems: ScheduleItem[] = [];
        const classId = selectedClass?.id || 'cls-9a1';
        const className = selectedClass?.name || '9A1';

        // Detect column indices from header row (row 0)
        const headerRow = rawData[0].map(c => String(c || '').toLowerCase().trim());
        const dayCols: { day: number; colIdx: number }[] = [];

        DAYS.forEach(d => {
          const colIdx = headerRow.findIndex(h =>
            h.includes(d.label.toLowerCase()) ||
            h.includes(d.label.toLowerCase().replace('thứ ', 't')) ||
            h.includes(`thứ ${d.day}`) ||
            h.includes(`t${d.day}`)
          );
          if (colIdx >= 0) {
            dayCols.push({ day: d.day, colIdx });
          }
        });

        // Fallback default column indices (3, 4, 5, 6, 7, 8) if headers didn't match
        if (dayCols.length === 0) {
          DAYS.forEach((d, idx) => {
            dayCols.push({ day: d.day, colIdx: 3 + idx });
          });
        }

        // Loop data rows (starting from row 1)
        for (let r = 1; r < rawData.length; r++) {
          const row = rawData[r];
          if (!row || row.length === 0) continue;

          const sessionStr = String(row[0] || '').toLowerCase();
          const periodStr = String(row[1] || '').toLowerCase();

          let session: 'MORNING' | 'AFTERNOON' = 'MORNING';
          if (sessionStr.includes('chiều') || sessionStr.includes('afternoon') || sessionStr.includes('c')) {
            session = 'AFTERNOON';
          } else if (sessionStr.includes('sáng') || sessionStr.includes('morning') || sessionStr.includes('s')) {
            session = 'MORNING';
          }

          // Extract period number (1 to 5)
          const periodMatch = periodStr.match(/\d+/);
          let periodNum = periodMatch ? parseInt(periodMatch[0], 10) : 0;
          if (periodNum === 0) {
            // Check if period is just a number in col 1
            if (typeof row[1] === 'number') {
              periodNum = row[1];
            } else {
              continue; // Skip unrecognized row
            }
          }

          // Bound period number
          if (session === 'MORNING' && (periodNum < 1 || periodNum > 5)) continue;
          if (session === 'AFTERNOON' && (periodNum < 1 || periodNum > 4)) continue;

          // Time slot lookup
          const periodList = session === 'MORNING' ? MORNING_PERIODS : AFTERNOON_PERIODS;
          const timeSlot = periodList.find(p => p.period === periodNum)?.timeSlot || '';

          // Read subjects from day columns
          dayCols.forEach(({ day, colIdx }) => {
            const cellVal = String(row[colIdx] || '').trim();
            if (cellVal) {
              // Parse optional teacher in parentheses, e.g. "Toán học (Thầy An)"
              let subject = cellVal;
              let teacher = 'Giáo viên bộ môn';
              const parenMatch = cellVal.match(/^(.*?)\s*\((.*?)\)$/);
              if (parenMatch) {
                subject = parenMatch[1].trim();
                teacher = parenMatch[2].trim();
              }

              newItems.push({
                id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                classId,
                className,
                dayOfWeek: day,
                session,
                period: periodNum,
                subject,
                teacherName: teacher,
                room: selectedClass?.room || 'Phòng học',
                timeSlot,
              });
            }
          });
        }

        if (newItems.length === 0) {
          showToast('warning', 'Không tìm thấy tiết học hợp lệ trong file Excel!');
          return;
        }

        // Push to undo stack and replace
        pushState(newItems);
        showToast('success', `Đã nhập thành công ${newItems.length} tiết học từ file Excel!`);
      } catch (err) {
        showToast('error', 'Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  // Print schedule
  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <div className="space-y-4 pb-16">
      {/* ================= 1. KHU VỰC THANH CHỨC NĂNG (TOP BAR) ================= */}
      {/* Chỉ hiển thị đúng 6 nút chính nằm trên cùng một thanh ngang */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-4 py-3 flex items-center justify-between gap-3 flex-wrap print:hidden">
        {/* The 6 Main Buttons on a single horizontal row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Chỉnh sửa (Bật/tắt chế độ sửa. Khi bật sẽ xuất hiện thêm nút Lưu) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isEditing
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Bật/tắt chế độ sửa"
            >
              <Pencil className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>

            {/* Khi bật Chỉnh sửa: Xuất hiện thêm nút Lưu */}
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-150"
                title="Lưu lại toàn bộ thời khóa biểu"
              >
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            )}
          </div>

          {/* 2. Xóa (Màu đỏ, nằm cạnh nút Chỉnh sửa) */}
          {/* Khi bật: Người dùng click vào ô/hàng/cột nào sẽ xóa ngay lập tức không cần popup */}
          <button
            type="button"
            onClick={handleToggleDelete}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDeleteMode
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
            title="Xóa: Khi bật, click vào ô/hàng/cột để xóa ngay lập tức"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
            {isDeleteMode && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* 3. Hoàn tác (Icon mũi tên trái - Ctrl+Z) */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              canUndo
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shadow-xs'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hoàn tác</span>
          </button>

          {/* 4. Làm lại (Icon mũi tên phải - Ctrl+Y) - Chỉ kích hoạt khi có thể tiến tới */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              canRedo
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shadow-xs'
                : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Làm lại</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* 5. Import Excel */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-xs"
            title="Nhập dữ liệu thời khóa biểu từ Excel (.xlsx, .xls, .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleImportExcel}
          />

          {/* 6. Xuất file */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-xs"
              title="Xuất file thời khóa biểu"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Xuất file</span>
            </button>

            {/* Dropdown Options */}
            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Xuất file Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>In / Xuất PDF</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-amber-600" />
                  <span>Tải file Excel mẫu</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Clean Class Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Lớp:</span>
          <select
            value={selectedClass?.id || 'cls-9a1'}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.academicYear})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual notification of active mode (Only brief status indicators) */}
      {isDeleteMode && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-rose-800 font-semibold print:hidden animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Chế độ XÓA đang BẬT: Nhấp vào ô, tiêu đề hàng (tiết) hoặc tiêu đề cột (thứ) để xóa tức thì không cần xác nhận.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteMode(false)}
            className="text-rose-600 hover:text-rose-900 font-bold underline cursor-pointer text-xs"
          >
            Tắt chế độ xóa
          </button>
        </div>
      )}

      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-blue-800 font-semibold print:hidden animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span>Chế độ CHỈNH SỬA đang BẬT: Nhấp vào bất kỳ ô nào để nhập/sửa môn học. Sau khi sửa xong, nhấn nút Lưu ở thanh công cụ.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
          >
            Lưu thay đổi
          </button>
        </div>
      )}

      {/* ================= 2. BẢNG THỜI KHÓA BIỂU TOÀN DIỆN (SÁNG VÀ CHIỀU) ================= */}
      {/* Thiết kế sạch sẽ, không có nút 'Thêm cột', không đổi cỡ chữ/màu sắc */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">Buổi</th>
                <th className="py-3 px-3 w-20 text-center border-r border-slate-200">Tiết</th>
                <th className="py-3 px-3 w-28 text-center border-r border-slate-200">Thời gian</th>
                {DAYS.map(d => (
                  <th
                    key={d.day}
                    onClick={() => {
                      if (isDeleteMode) {
                        handleDeleteColumn(d.day);
                      }
                    }}
                    className={`py-3 px-3 text-center border-r border-slate-200 last:border-r-0 transition-colors ${
                      isDeleteMode
                        ? 'hover:bg-rose-100 hover:text-rose-800 cursor-pointer group'
                        : ''
                    }`}
                    title={isDeleteMode ? `Nhấp để XÓA TOÀN BỘ ${d.label}` : d.label}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{d.label}</span>
                      {isDeleteMode && (
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 opacity-60 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {/* ===== BUỔI SÁNG (MORNING) ===== */}
              {MORNING_PERIODS.map((periodDef, idx) => (
                <tr key={`morning-${periodDef.period}`} className="hover:bg-slate-50/70 transition-colors">
                  {/* Rowspan for 'Sáng' */}
                  {idx === 0 && (
                    <td
                      rowSpan={MORNING_PERIODS.length}
                      className="text-center font-extrabold text-slate-800 bg-amber-50/50 border-r border-slate-200 align-middle py-4 px-2"
                    >
                      <div className="writing-vertical sm:writing-horizontal font-bold text-amber-900 tracking-wide">
                        SÁNG
                      </div>
                    </td>
                  )}

                  {/* Period label with instant row delete if isDeleteMode */}
                  <td
                    onClick={() => {
                      if (isDeleteMode) {
                        handleDeleteRow('MORNING', periodDef.period);
                      }
                    }}
                    className={`text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 py-3 px-2 ${
                      isDeleteMode
                        ? 'hover:bg-rose-100 hover:text-rose-800 cursor-pointer group'
                        : ''
                    }`}
                    title={isDeleteMode ? `Nhấp để XÓA TOÀN BỘ Tiết ${periodDef.period} (Sáng)` : `Tiết ${periodDef.period}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tiết {periodDef.period}</span>
                      {isDeleteMode && (
                        <Trash2 className="w-3 h-3 text-rose-500 opacity-60 group-hover:opacity-100" />
                      )}
                    </div>
                  </td>

                  {/* Time Slot */}
                  <td className="text-center text-slate-500 font-mono text-[11px] border-r border-slate-200 py-3 px-2">
                    {periodDef.timeSlot}
                  </td>

                  {/* Day cells (Thứ 2 -> Thứ 7) */}
                  {DAYS.map(d => {
                    const item = scheduleMap.get(`MORNING-${periodDef.period}-${d.day}`);
                    return (
                      <td
                        key={`m-${periodDef.period}-${d.day}`}
                        onClick={() => handleCellClick('MORNING', periodDef.period, periodDef.timeSlot, d.day)}
                        className={`p-2.5 border-r border-slate-200 last:border-r-0 align-top transition-all min-h-[58px] ${
                          isDeleteMode
                            ? 'hover:bg-rose-50 hover:border-rose-300 cursor-pointer'
                            : isEditing
                            ? 'hover:bg-blue-50/80 hover:ring-1 hover:ring-blue-400 cursor-pointer'
                            : ''
                        }`}
                        title={
                          isDeleteMode
                            ? 'Nhấp để XÓA ô này ngay lập tức'
                            : isEditing
                            ? 'Nhấp để chỉnh sửa'
                            : undefined
                        }
                      >
                        {item ? (
                          <div className="relative group">
                            <div className="font-bold text-slate-900 leading-snug">
                              {item.subject}
                            </div>
                            {(item.teacherName || item.room) && (
                              <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                                {item.teacherName && <span>{item.teacherName}</span>}
                                {item.teacherName && item.room && <span>•</span>}
                                {item.room && <span className="font-mono text-slate-400">{item.room}</span>}
                              </div>
                            )}

                            {/* Delete indicator hover icon when delete mode is active */}
                            {isDeleteMode && (
                              <div className="absolute top-0 right-0 p-1 text-rose-600 bg-rose-100 rounded-md shadow-xs">
                                <Trash2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-300 text-xs py-1">
                            {isEditing ? (
                              <span className="text-blue-500/70 text-[11px] font-medium">+ Thêm</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* ===== PHÂN TÁCH BUỔI SÁNG / CHIỀU ===== */}
              <tr className="bg-slate-200/80 border-y-2 border-slate-300">
                <td colSpan={9} className="py-1 px-4 text-center text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Nghỉ trưa • Chuyển sang lịch học Buổi Chiều
                </td>
              </tr>

              {/* ===== BUỔI CHIỀU (AFTERNOON) ===== */}
              {AFTERNOON_PERIODS.map((periodDef, idx) => (
                <tr key={`afternoon-${periodDef.period}`} className="hover:bg-slate-50/70 transition-colors">
                  {/* Rowspan for 'Chiều' */}
                  {idx === 0 && (
                    <td
                      rowSpan={AFTERNOON_PERIODS.length}
                      className="text-center font-extrabold text-slate-800 bg-sky-50/50 border-r border-slate-200 align-middle py-4 px-2"
                    >
                      <div className="writing-vertical sm:writing-horizontal font-bold text-sky-900 tracking-wide">
                        CHIỀU
                      </div>
                    </td>
                  )}

                  {/* Period label with instant row delete if isDeleteMode */}
                  <td
                    onClick={() => {
                      if (isDeleteMode) {
                        handleDeleteRow('AFTERNOON', periodDef.period);
                      }
                    }}
                    className={`text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 py-3 px-2 ${
                      isDeleteMode
                        ? 'hover:bg-rose-100 hover:text-rose-800 cursor-pointer group'
                        : ''
                    }`}
                    title={isDeleteMode ? `Nhấp để XÓA TOÀN BỘ Tiết ${periodDef.period} (Chiều)` : `Tiết ${periodDef.period}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tiết {periodDef.period}</span>
                      {isDeleteMode && (
                        <Trash2 className="w-3 h-3 text-rose-500 opacity-60 group-hover:opacity-100" />
                      )}
                    </div>
                  </td>

                  {/* Time Slot */}
                  <td className="text-center text-slate-500 font-mono text-[11px] border-r border-slate-200 py-3 px-2">
                    {periodDef.timeSlot}
                  </td>

                  {/* Day cells (Thứ 2 -> Thứ 7) */}
                  {DAYS.map(d => {
                    const item = scheduleMap.get(`AFTERNOON-${periodDef.period}-${d.day}`);
                    return (
                      <td
                        key={`a-${periodDef.period}-${d.day}`}
                        onClick={() => handleCellClick('AFTERNOON', periodDef.period, periodDef.timeSlot, d.day)}
                        className={`p-2.5 border-r border-slate-200 last:border-r-0 align-top transition-all min-h-[58px] ${
                          isDeleteMode
                            ? 'hover:bg-rose-50 hover:border-rose-300 cursor-pointer'
                            : isEditing
                            ? 'hover:bg-blue-50/80 hover:ring-1 hover:ring-blue-400 cursor-pointer'
                            : ''
                        }`}
                        title={
                          isDeleteMode
                            ? 'Nhấp để XÓA ô này ngay lập tức'
                            : isEditing
                            ? 'Nhấp để chỉnh sửa'
                            : undefined
                        }
                      >
                        {item ? (
                          <div className="relative group">
                            <div className="font-bold text-slate-900 leading-snug">
                              {item.subject}
                            </div>
                            {(item.teacherName || item.room) && (
                              <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                                {item.teacherName && <span>{item.teacherName}</span>}
                                {item.teacherName && item.room && <span>•</span>}
                                {item.room && <span className="font-mono text-slate-400">{item.room}</span>}
                              </div>
                            )}

                            {/* Delete indicator hover icon when delete mode is active */}
                            {isDeleteMode && (
                              <div className="absolute top-0 right-0 p-1 text-rose-600 bg-rose-100 rounded-md shadow-xs">
                                <Trash2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-300 text-xs py-1">
                            {isEditing ? (
                              <span className="text-blue-500/70 text-[11px] font-medium">+ Thêm</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT CELL MODAL / DIALOG ================= */}
      {activeCell && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Chỉnh sửa tiết học
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {DAYS.find(d => d.day === activeCell.dayOfWeek)?.label} •{' '}
                  {activeCell.session === 'MORNING' ? 'Buổi Sáng' : 'Buổi Chiều'} • Tiết {activeCell.period} ({activeCell.timeSlot})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCell} className="p-5 space-y-4">
              {/* Quick subject tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn nhanh môn học:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {QUICK_SUBJECTS.map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setFormSubject(subj)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        formSubject === subj
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên môn học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="Nhập tên môn học..."
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Teacher Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giáo viên phụ trách
                </label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={e => setFormTeacher(e.target.value)}
                  placeholder="Họ và tên giáo viên..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Room Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phòng học
                </label>
                <input
                  type="text"
                  value={formRoom}
                  onChange={e => setFormRoom(e.target.value)}
                  placeholder="Phòng học (ví dụ: Phòng 402, Sân trường, Lab 1...)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between gap-2">
                {activeCell.item ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteCell(activeCell.session, activeCell.period, activeCell.dayOfWeek);
                      setActiveCell(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tiết này</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCell(null)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Cập nhật</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
