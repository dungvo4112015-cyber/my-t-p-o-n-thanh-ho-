import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Assignment, Submission } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusChip } from '../../components/common/StatusChip';
import {
  FileText,
  Clock,
  CheckCircle2,
  Upload,
  Send,
  Paperclip,
  Award,
  AlertCircle,
} from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  const { assignments, submissions, submitAssignmentStudent, showToast } = useApp();
  const { currentUser } = useAuth();

  const studentId = currentUser.studentId || 'hs-1';
  const mySubmissions = submissions.filter(s => s.studentId === studentId);

  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<Assignment | null>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; url: string }[]>([]);

  const handleOpenSubmitModal = (asg: Assignment) => {
    setSelectedAsgForSubmit(asg);
    const existing = mySubmissions.find(s => s.assignmentId === asg.id);
    if (existing) {
      setSubmitContent(existing.content);
      setSelectedFiles(existing.attachments || []);
    } else {
      setSubmitContent('');
      setSelectedFiles([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit) return;
    if (!submitContent.trim() && selectedFiles.length === 0) {
      showToast('error', 'Vui lòng nhập nội dung bài làm hoặc đính kèm file ảnh/PDF!');
      return;
    }

    submitAssignmentStudent(selectedAsgForSubmit.id, submitContent, selectedFiles);
    setSelectedAsgForSubmit(null);
  };

  const handleAddSampleFile = () => {
    setSelectedFiles([
      ...selectedFiles,
      {
        name: `BaiLam_${currentUser.name.replace(/\s+/g, '')}_Trang${selectedFiles.length + 1}.pdf`,
        size: '2.4 MB',
        url: '#',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-cyan-400" />
          Bài tập về nhà & Nhiệm vụ học tập
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Xem yêu cầu bài tập, tải file tài liệu đính kèm và nộp bài làm cho thầy cô chấm điểm
        </p>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {assignments
          .filter(a => !a.isDraft)
          .map(asg => {
            const sub = mySubmissions.find(s => s.assignmentId === asg.id);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {asg.subject}
                      </span>
                      {sub ? (
                        <StatusChip status={sub.status} type="submission" />
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Chưa nộp
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{asg.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{asg.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Hạn chót nộp bài:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(asg.dueDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Teacher feedback if graded */}
                {sub && sub.score !== undefined && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Điểm số: <strong className="text-sm">{sub.score} / {asg.maxScore}</strong>
                      </span>
                      <span className="text-emerald-700 text-[11px]">Chấm bởi: {sub.gradedBy}</span>
                    </div>
                    {sub.feedback && (
                      <p className="text-emerald-800 italic pt-1">Lời phê của Thầy/Cô: "{sub.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Footer submit action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Giáo viên giao: {asg.teacherName}</span>

                  <button
                    onClick={() => handleOpenSubmitModal(asg)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sub ? 'Cập nhật lại bài nộp' : 'Nộp bài tập'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* SUBMISSION MODAL */}
      {selectedAsgForSubmit && (
        <Modal
          isOpen={!!selectedAsgForSubmit}
          onClose={() => setSelectedAsgForSubmit(null)}
          maxWidth="lg"
          title={`Nộp bài: ${selectedAsgForSubmit.title}`}
          footer={
            <>
              <button
                type="button"
                onClick={() => setSelectedAsgForSubmit(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận nộp bài
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nội dung câu trả lời / Lời giải của em:</label>
              <textarea
                rows={5}
                value={submitContent}
                onChange={e => setSubmitContent(e.target.value)}
                placeholder="Nhập các bước giải toán, đáp án các câu hỏi hoặc ghi chú nộp bài..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-700">Đính kèm file ảnh chụp bài làm / PDF:</label>
                <button
                  type="button"
                  onClick={handleAddSampleFile}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Đính kèm file
                </button>
              </div>

              {selectedFiles.length === 0 ? (
                <div
                  onClick={handleAddSampleFile}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-500">Bấm để tải file ảnh hoặc tài liệu bài làm</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{f.name}</span>
                        <span className="text-[10px] text-blue-600">({f.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
