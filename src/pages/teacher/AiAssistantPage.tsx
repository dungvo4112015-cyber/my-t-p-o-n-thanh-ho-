import React, { useState } from 'react';
import { AiService, AiGeneratedContent } from '../../services/aiService';
import { useApp } from '../../contexts/AppContext';
import {
  Bot,
  Sparkles,
  HelpCircle,
  FileText,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Copy,
  Edit,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const { addAssignment, addQuiz, selectedClass, showToast } = useApp();

  const [contentType, setContentType] = useState<AiGeneratedContent['type']>('quiz');
  const [topic, setTopic] = useState('Hệ phương trình bậc nhất hai ẩn và ứng dụng giải bài toán bằng cách lập hệ phương trình');
  const [gradeLevel, setGradeLevel] = useState(9);
  const [subject, setSubject] = useState('Toán học');
  const [additionalNotes, setAdditionalNotes] = useState('Bao gồm 4 câu trắc nghiệm các mức độ và 1 câu thực tế.');

  const [isLoading, setIsLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<AiGeneratedContent | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [editableTitle, setEditableTitle] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('error', 'Vui lòng nhập chủ đề bài dạy!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AiService.generateEducationalContent(
        contentType,
        topic,
        gradeLevel,
        subject,
        additionalNotes
      );
      setDraftResult(res);
      setEditableTitle(res.title);
      setEditableContent(res.content);
      showToast('success', 'Đã khởi tạo bản nháp AI thành công! Thầy/Cô vui lòng thẩm định và chỉnh sửa.');
    } catch (e) {
      showToast('error', 'Không thể khởi tạo nội dung. Thử lại sau ít phút.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishAssignment = () => {
    if (!editableTitle.trim()) return;

    addAssignment({
      title: editableTitle,
      description: editableContent,
      classId: selectedClass?.id || 'cls-9a1',
      className: selectedClass?.name || 'Lớp 9A1',
      subject,
      teacherId: 'u-teacher-1',
      teacherName: 'Thầy Nguyễn Văn An',
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      assignedDate: new Date().toISOString(),
      maxScore: 10,
      targetType: 'ALL',
      isDraft: false,
    });

    showToast('success', 'Đã phê duyệt và chính thức giao bài tập cho học sinh!');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editableContent);
    showToast('success', 'Đã sao chép nội dung vào bộ nhớ tạm!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-purple-400" />
            AI HỖ TRỢ - Trợ lý Sư phạm Giáo viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Soạn thảo đề kiểm tra, phiếu bài tập, giáo án và lời nhận xét học sinh chuẩn GDPT 2018
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
            Human-in-the-loop: Bắt buộc giáo viên duyệt
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Yêu cầu soạn thảo
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại tài liệu cần tạo:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'quiz', label: 'Đề kiểm tra / Quiz', icon: HelpCircle },
                { id: 'assignment', label: 'Phiếu bài tập', icon: FileText },
                { id: 'lesson_plan', label: 'Giáo án CV5512', icon: BookOpen },
                { id: 'student_feedback', label: 'Gợi ý nhận xét HS', icon: MessageSquare },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = contentType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setContentType(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
              <select
                value={gradeLevel}
                onChange={e => setGradeLevel(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value={9}>Khối 9</option>
                <option value={8}>Khối 8</option>
                <option value={7}>Khối 7</option>
                <option value={6}>Khối 6</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề bài học / Nội dung kiến thức *</label>
            <textarea
              rows={3}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="VD: Căn thức bậc hai, giải bài toán bằng cách lập hệ phương trình..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú bổ sung sư phạm</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Số lượng câu hỏi, mức độ phân hóa, đối tượng học sinh..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerate}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-101 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang soạn thảo bản nháp...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Khởi tạo bản nháp ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: Human Review & Edit Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-slate-400" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Không gian Thẩm định & Biên tập (Bản nháp)
                </h3>
              </div>

              {draftResult && (
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" /> Sao chép
                </button>
              )}
            </div>

            {/* Note badge */}
            <div className="my-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Quy tắc an toàn:</strong> Mọi nội dung do AI đề xuất đều ở trạng thái nháp. Thầy/Cô cần kiểm tra kỹ độ chính xác chuyên môn trước khi phê duyệt công bố cho học sinh.
              </span>
            </div>

            {draftResult ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề tài liệu:</label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={e => setEditableTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết (Có thể sửa trực tiếp):</label>
                  <textarea
                    rows={14}
                    value={editableContent}
                    onChange={e => setEditableContent(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400">
                <Bot className="w-12 h-12 mx-auto text-purple-300 mb-3 opacity-60" />
                <p className="text-sm font-semibold text-slate-600">Chưa có bản nháp nào được tạo</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Điền các tiêu chí sư phạm ở cột bên trái và bấm "Khởi tạo bản nháp ngay"
                </p>
              </div>
            )}
          </div>

          {/* Action Approval Buttons */}
          {draftResult && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePublishAssignment}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4" />
                Duyệt & Giao thành bài tập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
