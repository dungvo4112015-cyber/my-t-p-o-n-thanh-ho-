import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Student } from '../../types';
import { EditParentModal } from '../../components/student/EditParentModal';
import { Student360Modal } from '../../components/student/Student360Modal';
import { Modal } from '../../components/common/Modal';
import {
  Phone,
  Search,
  Download,
  Send,
  Pencil,
  Eye,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ParentsPage: React.FC = () => {
  const { students, classes, showToast, addAnnouncement } = useApp();

  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [directMessageStudent, setDirectMessageStudent] = useState<Student | null>(null);

  // Send message form state
  const [messageTargetClass, setMessageTargetClass] = useState('all');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Table horizontal scrolling ref & progress
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      // Class filter
      if (classFilter !== 'all' && st.classId !== classFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesStudent =
          st.fullName.toLowerCase().includes(q) || st.studentCode.toLowerCase().includes(q);
        const matchesParent =
          st.parentName.toLowerCase().includes(q) ||
          st.parentPhone.includes(q) ||
          (st.fatherName && st.fatherName.toLowerCase().includes(q)) ||
          (st.fatherPhone && st.fatherPhone.includes(q)) ||
          (st.motherName && st.motherName.toLowerCase().includes(q)) ||
          (st.motherPhone && st.motherPhone.includes(q)) ||
          (st.address && st.address.toLowerCase().includes(q)) ||
          (st.parentEmail && st.parentEmail.toLowerCase().includes(q));
        if (!matchesStudent && !matchesParent) return false;
      }

      return true;
    });
  }, [students, classFilter, searchQuery]);

  // Handle table scroll event to update progress slider
  const handleTableScroll = () => {
    const el = tableContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress((el.scrollLeft / maxScroll) * 100);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrollProgress(val);
    const el = tableContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (val / 100) * maxScroll;
  };

  const scrollTo = (direction: 'start' | 'left' | 'right' | 'end') => {
    const el = tableContainerRef.current;
    if (!el) return;

    if (direction === 'start') {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left') {
      el.scrollBy({ left: -350, behavior: 'smooth' });
    } else if (direction === 'right') {
      el.scrollBy({ left: 350, behavior: 'smooth' });
    } else if (direction === 'end') {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
  };

  // Helper format phone number: e.g. "0983 234 567"
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '0983 234 567';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
    }
    return phone;
  };

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = phone.replace(/\s+/g, '');
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    showToast('success', `Đã sao chép số điện thoại ${formatPhoneNumber(phone)} vào bộ nhớ tạm!`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleOpenZalo = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const digits = phone.replace(/\D/g, '');
    window.open(`https://zalo.me/${digits}`, '_blank');
  };

  const exportCSV = () => {
    const csvHeader =
      'STT,Mã HS,Họ tên HS,Lớp,Người liên hệ chính,SĐT chính,Họ tên Bố,SĐT Bố,Nghề nghiệp Bố,Họ tên Mẹ,SĐT Mẹ,Nghề nghiệp Mẹ,Email phụ huynh,Địa chỉ gia đình,Trạng thái kết nối\n';

    const csvRows = filteredStudents.map((s, idx) => {
      const primaryRelation =
        s.primaryContact === 'father'
          ? 'Bố'
          : s.primaryContact === 'guardian'
          ? 'Người giám hộ'
          : 'Mẹ';
      const isLinked = s.parentLinked !== false ? 'Đã kết nối' : 'Chưa kết nối';
      return `"${idx + 1}","${s.studentCode}","${s.fullName}","${s.className}","${s.parentName} (${primaryRelation})","${s.parentPhone}","${s.fatherName || ''}","${s.fatherPhone || ''}","${s.fatherJob || ''}","${s.motherName || ''}","${s.motherPhone || ''}","${s.motherJob || ''}","${s.parentEmail || s.email || ''}","${s.address}","${isLinked}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvHeader + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_Ba_Phu_Huynh_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Đã xuất danh bạ phụ huynh ra file CSV thành công!');
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle.trim() || !messageContent.trim()) return;

    const targetCls = classes.find(c => c.id === messageTargetClass);

    addAnnouncement({
      title: directMessageStudent
        ? `[Gửi Phụ Huynh ${directMessageStudent.parentName}] ${messageTitle.trim()}`
        : `[Gửi Phụ Huynh] ${messageTitle.trim()}`,
      content: messageContent.trim(),
      senderName: 'Giáo viên chủ nhiệm',
      senderRole: 'Giáo viên',
      targetRole: 'PARENTS',
      classId: messageTargetClass === 'all' ? undefined : messageTargetClass,
      className: targetCls?.name,
      priority: 'HIGH',
    });

    showToast(
      'success',
      directMessageStudent
        ? `Đã gửi tin nhắn tới phụ huynh ${directMessageStudent.parentName} thành công!`
        : 'Đã gửi thông báo đến sổ liên lạc của phụ huynh học sinh!'
    );
    setMessageTitle('');
    setMessageContent('');
    setIsSendMessageModalOpen(false);
    setDirectMessageStudent(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm phụ huynh, học sinh, số điện thoại..."
            className="w-full pl-9 pr-4 py-2 bg-[#071933] text-slate-100 placeholder-slate-400 border border-[#11315e] rounded-xl text-xs font-medium focus:ring-2 focus:ring-cyan-500/40 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Class Selector */}
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-[#071933] border border-[#11315e] text-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="all">Tất cả các lớp ({students.length})</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setDirectMessageStudent(null);
              setMessageTitle('');
              setMessageContent('');
              setIsSendMessageModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi tin nhắn</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#14396b] bg-[#071933] hover:bg-[#0c2448] text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất file</span>
          </button>
        </div>
      </div>

      {/* EXACT CYBER DARK NAVY TABLE FROM USER SCREENSHOT */}
      <div className="bg-[#05152d] border border-[#0f2d56] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Scrollable table container */}
        <div
          ref={tableContainerRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-[#05152d]"
        >
          <table className="w-full text-left text-xs min-w-[880px] border-collapse">
            <thead className="bg-[#081e3d] border-b border-[#0f2d56] text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Phụ huynh</th>
                <th className="py-3.5 px-4 min-w-[200px]">Học sinh</th>
                <th className="py-3.5 px-4 min-w-[280px]">Số điện thoại & Liên hệ</th>
                <th className="py-3.5 px-4 min-w-[150px]">Trạng thái</th>
                {/* 3 Thao tác CỐ ĐỊNH BÊN PHẢI (STICKY RIGHT) */}
                <th className="sticky right-0 z-30 py-3.5 px-4 text-center bg-[#081e3d] border-b border-[#0f2d56] border-l border-[#0f2d56] shadow-[-8px_0_16px_rgba(0,0,0,0.6)] w-36 min-w-[130px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c2347]">
              {filteredStudents.map(st => {
                const isFatherPrimary = st.primaryContact === 'father';
                const formattedPhone = formatPhoneNumber(st.parentPhone);

                return (
                  <tr
                    key={st.id}
                    className="hover:bg-[#0d274f] transition-colors group cursor-pointer"
                    onClick={() => setViewingStudent(st)}
                  >
                    {/* 1. Phụ huynh + Badge Bố/Mẹ */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm tracking-wide group-hover:text-cyan-300 transition-colors">
                          {st.parentName}
                        </span>

                        {isFatherPrimary ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0d2a4a] text-[#38bdf8] border border-[#1e4976] shrink-0 select-none">
                            Bố
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#3a1020] text-[#f472b6] border border-[#6b1d3a] shrink-0 select-none">
                            Mẹ
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Học sinh (Avatar + Tên) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            st.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                          }
                          alt={st.fullName}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover shrink-0"
                        />
                        <span className="font-bold text-slate-100 text-sm tracking-wide block group-hover:text-cyan-300 transition-colors">
                          {st.fullName}
                        </span>
                      </div>
                    </td>

                    {/* 3. Số điện thoại (Cyan font) + Copy + Gọi + Zalo pill */}
                    <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {/* SĐT dạ quang neon cyan */}
                        <span className="font-mono font-black text-[#00e5ff] tracking-widest text-sm select-all">
                          {formattedPhone}
                        </span>

                        {/* Copy button */}
                        <button
                          type="button"
                          onClick={e => handleCopyPhone(st.id, st.parentPhone, e)}
                          title="Sao chép số điện thoại"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#132c52] rounded-lg transition-colors border border-[#1b3d68] cursor-pointer"
                        >
                          {copiedId === st.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Call button */}
                        <a
                          href={`tel:${st.parentPhone}`}
                          title="Gọi điện thoại"
                          className="p-1.5 text-slate-400 hover:text-[#10b981] hover:bg-[#10b981]/15 rounded-lg transition-colors border border-[#1b3d68] cursor-pointer flex items-center justify-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Zalo button (Pill style as in screenshot) */}
                        <button
                          type="button"
                          onClick={e => handleOpenZalo(st.parentPhone, e)}
                          title="Mở trò chuyện Zalo"
                          className="px-3 py-0.5 text-xs font-bold text-[#38bdf8] border border-[#1b3d68] rounded-full hover:bg-[#0284c7] hover:text-white transition-all cursor-pointer select-none"
                        >
                          Zalo
                        </button>
                      </div>
                    </td>

                    {/* 4. Trạng thái kết nối */}
                    <td className="py-4 px-4">
                      {st.parentLinked !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#062c20] text-[#4ade80] border border-[#0f5132] select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>
                          Đã kết nối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#331c07] text-[#fbbf24] border border-[#633a0e] select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></span>
                          Chưa kết nối
                        </span>
                      )}
                    </td>

                    {/* 5. 3 Thao tác CỐ ĐỊNH BÊN PHẢI (STICKY RIGHT) - CHỈ ICON, KHÔNG CHỮ */}
                    <td
                      className="sticky right-0 z-20 py-3.5 px-3 text-center bg-[#05152d] group-hover:bg-[#0d274f] transition-colors border-l border-[#0c2347] shadow-[-8px_0_16px_rgba(0,0,0,0.6)]"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. View (Eye) */}
                        <button
                          type="button"
                          onClick={() => setViewingStudent(st)}
                          title="Xem chi tiết"
                          className="w-8 h-8 rounded-xl border border-[#163863] text-[#38bdf8] hover:bg-[#163863]/50 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 2. Edit (Pencil) */}
                        <button
                          type="button"
                          onClick={() => setEditingStudent(st)}
                          title="Chỉnh sửa"
                          className="w-8 h-8 rounded-xl border border-[#163863] text-[#38bdf8] hover:bg-[#163863]/50 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* 3. Liên hệ (MessageSquare) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDirectMessageStudent(st);
                            setMessageTitle('');
                            setMessageContent('');
                            setIsSendMessageModalOpen(true);
                          }}
                          title="Nhắn tin cho phụ huynh"
                          className="w-8 h-8 rounded-xl border border-[#0284c7] text-[#38bdf8] bg-[#0284c7]/20 hover:bg-[#0284c7] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm shadow-cyan-900/50"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM TOOLBAR: Thanh trượt ngang & Nút điều hướng chuẩn như trong ảnh */}
        <div className="p-3 bg-[#071933] border-t border-[#0f2d56] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Thanh trượt ngang */}
          <div className="flex items-center gap-3 w-full sm:w-1/2">
            <div className="flex items-center gap-1.5 text-[#00e5ff] font-bold shrink-0 select-none">
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse"></span>
              <span>Thanh trượt ngang:</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={scrollProgress}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-[#0e294f] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
            />
          </div>

          {/* Điều hướng cuộn bảng */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto select-none">
            <button
              type="button"
              onClick={() => scrollTo('start')}
              className="px-3 py-1 bg-[#0c1f3b] hover:bg-[#16335d] text-slate-300 hover:text-white border border-[#1d3d6e] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Đầu bảng
            </button>

            <button
              type="button"
              onClick={() => scrollTo('left')}
              className="flex items-center gap-1 px-3 py-1 bg-[#0c1f3b] hover:bg-[#16335d] text-slate-300 hover:text-white border border-[#1d3d6e] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trái</span>
            </button>

            <button
              type="button"
              onClick={() => scrollTo('right')}
              className="flex items-center gap-1 px-3 py-1 bg-[#0c1f3b] hover:bg-[#16335d] text-slate-300 hover:text-white border border-[#1d3d6e] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <span>Phải</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo('end')}
              className="px-3 py-1 bg-[#0c1f3b] hover:bg-[#16335d] text-slate-300 hover:text-white border border-[#1d3d6e] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Cuối bảng
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PARENT MODAL */}
      <EditParentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
      />

      {/* STUDENT 360 MODAL (VIEW) */}
      <Student360Modal
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        student={viewingStudent}
      />

      {/* SEND MESSAGE MODAL */}
      <Modal
        isOpen={isSendMessageModalOpen}
        onClose={() => {
          setIsSendMessageModalOpen(false);
          setDirectMessageStudent(null);
        }}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>
              {directMessageStudent
                ? `Gửi tin nhắn: ${directMessageStudent.parentName} (PH của ${directMessageStudent.fullName})`
                : 'Gửi tin nhắn / Thông báo cho Phụ huynh'}
            </span>
          </div>
        }
      >
        <form onSubmit={handleSendMessageSubmit} className="space-y-4 text-xs">
          {!directMessageStudent ? (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gửi tới danh sách phụ huynh lớp</label>
              <select
                value={messageTargetClass}
                onChange={e => setMessageTargetClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="all">Toàn bộ phụ huynh học sinh ({students.length} gia đình)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Phụ huynh lớp {c.name} ({students.filter(s => s.classId === c.id).length} học sinh)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-blue-900 block">Người nhận: {directMessageStudent.parentName}</span>
                <span className="text-slate-600 font-mono">SĐT: {formatPhoneNumber(directMessageStudent.parentPhone)}</span>
              </div>
              <button
                type="button"
                onClick={e => handleOpenZalo(directMessageStudent.parentPhone, e)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Mở Zalo trực tiếp
              </button>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề thông báo *</label>
            <input
              type="text"
              required
              value={messageTitle}
              onChange={e => setMessageTitle(e.target.value)}
              placeholder="VD: Nhắc nhở lịch họp phụ huynh đầu năm học..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội dung tin nhắn gửi đến phụ huynh *</label>
            <textarea
              rows={4}
              required
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              placeholder="Nhập nội dung dặn dò, thông báo kiểm tra, kế hoạch học tập..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2 text-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Tin nhắn sẽ được gửi trực tiếp tới tài khoản Sổ liên lạc điện tử của phụ huynh.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsSendMessageModalOpen(false);
                setDirectMessageStudent(null);
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Gửi thông báo ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
