import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Assignment } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Trash2,
  Edit,
  ArrowRight,
  Send,
  Upload,
} from 'lucide-react';
import { CollapsibleCard } from '../../components/common/CollapsibleCard';

export const AssignmentsPage: React.FC = () => {
  const { assignments, submissions, selectedClass, addAssignment, updateAssignment, deleteAssignment } = useApp();
  const navigate = useNavigate();

  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Toán học',
    dueDate: '2026-10-15T23:59',
    maxScore: 10,
    targetType: 'ALL' as 'ALL' | 'GROUP' | 'INDIVIDUAL',
    isDraft: false,
    attachments: [] as { name: string; size: string; url: string }[],
  });

  const classAssignments = assignments.filter(a => a.classId === selectedClass?.id);

  const filtered = classAssignments.filter(a => {
    if (filterTab === 'published') return !a.isDraft;
    if (filterTab === 'draft') return a.isDraft;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addAssignment({
      ...formData,
      classId: selectedClass?.id || 'cls-9a1',
      className: selectedClass?.name || 'Lớp 9A1',
      teacherId: 'u-teacher-1',
      teacherName: 'Thầy Nguyễn Văn An',
      assignedDate: new Date().toISOString(),
    });

    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      subject: 'Toán học',
      dueDate: '2026-10-15T23:59',
      maxScore: 10,
      targetType: 'ALL',
      isDraft: false,
      attachments: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Giao bài tập & Nhiệm vụ học tập: {selectedClass?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Giao bài tập về nhà, theo dõi tiến độ nộp bài và chấm điểm học sinh
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Giao bài tập mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({classAssignments.length})
        </button>
        <button
          onClick={() => setFilterTab('published')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'published' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang mở ({classAssignments.filter(a => !a.isDraft).length})
        </button>
        <button
          onClick={() => setFilterTab('draft')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterTab === 'draft' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bản nháp ({classAssignments.filter(a => a.isDraft).length})
        </button>
      </div>

      {/* Collapsible Overview Stats */}
      <CollapsibleCard
        title={`Tiến độ bài tập & Thu bài: ${selectedClass?.name}`}
        subtitle={`Tổng cộng ${classAssignments.length} bài tập • ${submissions.length} lượt bài nộp`}
        icon={FileText}
        defaultOpen={true}
        badge={
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {submissions.filter(s => s.status === 'SUBMITTED').length} bài cần chấm
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Tổng bài tập</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{classAssignments.length}</p>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
            <span className="text-[11px] text-emerald-700 font-bold uppercase">Đang mở nộp</span>
            <p className="text-xl font-black text-emerald-900 mt-0.5">
              {classAssignments.filter(a => !a.isDraft).length}
            </p>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70">
            <span className="text-[11px] text-amber-700 font-bold uppercase">Chờ giáo viên chấm</span>
            <p className="text-xl font-black text-amber-900 mt-0.5">
              {submissions.filter(s => s.status === 'SUBMITTED').length}
            </p>
          </div>
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/70">
            <span className="text-[11px] text-purple-700 font-bold uppercase">Đã chấm điểm</span>
            <p className="text-xl font-black text-purple-900 mt-0.5">
              {submissions.filter(s => s.status === 'GRADED').length}
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {/* Assignment List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Chưa có bài tập nào trong mục này</p>
            <p className="text-xs text-slate-400 mt-1">Bấm "Giao bài tập mới" để gửi bài cho học sinh</p>
          </div>
        ) : (
          filtered.map(asg => {
            const subsForAsg = submissions.filter(s => s.assignmentId === asg.id);
            const gradedCount = subsForAsg.filter(s => s.status === 'GRADED').length;
            const submittedCount = subsForAsg.length;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {asg.subject}
                      </span>
                      {asg.isDraft && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Bản nháp
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{asg.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{asg.description}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setAssignmentToDelete(asg)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics & Submission Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>

                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Đã nộp: <strong className="text-slate-800">{submittedCount}</strong> / {selectedClass?.studentCount || 38} HS
                    </span>

                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã chấm: <strong className="text-emerald-700">{gradedCount}</strong> bài
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/teacher/assignments/${asg.id}/grading`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all hover:scale-102"
                  >
                    <span>Không gian chấm bài</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="xl"
        title="Giao bài tập mới cho học sinh"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateSubmit}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Giao bài ngay
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Ôn tập chương 3: Hệ phương trình bậc nhất hai ẩn"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Môn học</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hạn nộp bài</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội dung hướng dẫn & yêu cầu</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Yêu cầu học sinh làm các bài tập nào trong SGK, trình bày các bước..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isDraft}
                onChange={e => setFormData({ ...formData, isDraft: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Lưu dưới dạng bản nháp (Chưa công bố cho học sinh)</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={() => {
          if (assignmentToDelete) deleteAssignment(assignmentToDelete.id);
        }}
        title="Xóa bài tập"
        message={`Bạn có chắc muốn xóa bài tập "${assignmentToDelete?.title}"? Tất cả bài nộp của học sinh sẽ bị gỡ bỏ.`}
        isDestructive
        confirmLabel="Vẫn xóa"
      />
    </div>
  );
};
