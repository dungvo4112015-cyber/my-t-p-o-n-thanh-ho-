import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { LearningResource } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  FolderArchive,
  Plus,
  Search,
  Star,
  Download,
  Trash2,
  FileText,
  Video,
  Presentation,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { resources, addResource, deleteResource, toggleFavoriteResource, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    gradeLevel: 9,
    subject: 'Toán học',
    chapter: 'Chương 2: Hàm số bậc nhất',
    lesson: 'Bài 1: Khái niệm hàm số',
    fileType: 'pdf' as 'pdf' | 'doc' | 'ppt' | 'video' | 'link',
    fileSize: '3.5 MB',
    fileUrl: '#',
    description: '',
    uploadedBy: 'Thầy Nguyễn Văn An',
  });

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (favoriteOnly && !res.isFavorite) return false;
      if (typeFilter !== 'all' && res.fileType !== typeFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          res.title.toLowerCase().includes(q) ||
          res.chapter.toLowerCase().includes(q) ||
          res.lesson.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [resources, favoriteOnly, typeFilter, searchTerm]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addResource(formData);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      gradeLevel: 9,
      subject: 'Toán học',
      chapter: 'Chương 2: Hàm số bậc nhất',
      lesson: 'Bài 1: Khái niệm hàm số',
      fileType: 'pdf',
      fileSize: '3.5 MB',
      fileUrl: '#',
      description: '',
      uploadedBy: 'Thầy Nguyễn Văn An',
    });
  };

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">PDF</span>;
      case 'ppt':
        return <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-bold text-[10px]">POWERPOINT</span>;
      case 'video':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">VIDEO</span>;
      case 'doc':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">WORD</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">LINK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-cyan-400" />
            Tài liệu số & Giáo án điện tử
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Phân loại Khối → Môn → Chương → Bài học, chia sẻ tài liệu bài giảng cho học sinh
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Đăng tải tài liệu mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bài học, chương, tài liệu..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="pdf">Tài liệu PDF</option>
            <option value="ppt">Bài giảng PowerPoint</option>
            <option value="video">Video bài học</option>
            <option value="doc">Tài liệu Word</option>
          </select>

          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              favoriteOnly
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-white' : ''}`} />
            Yêu thích
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map(res => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                {getFileBadge(res.fileType)}
                <button
                  onClick={() => toggleFavoriteResource(res.id)}
                  className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                >
                  <Star className={`w-4 h-4 ${res.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
                </button>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 mt-2 line-clamp-2">{res.title}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">{res.chapter}</p>
              <p className="text-xs text-slate-500 mt-0.5">{res.lesson}</p>
              {res.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">{res.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{res.fileSize || '2.0 MB'}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteResource(res.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Xóa tài liệu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast('info', `Đang tải: ${res.title}`)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Tải về
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD RESOURCE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="lg"
        title="Đăng tải học liệu số mới"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-xs"
            >
              Đăng tải
            </button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên tài liệu / Bài giảng *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Slide bài giảng: Căn bậc hai số học"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chương học</label>
              <input
                type="text"
                value={formData.chapter}
                onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bài học</label>
              <input
                type="text"
                value={formData.lesson}
                onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Định dạng file</label>
              <select
                value={formData.fileType}
                onChange={e => setFormData({ ...formData, fileType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="pdf">PDF (Tài liệu/Đề thi)</option>
                <option value="ppt">PowerPoint (Bài giảng điện tử)</option>
                <option value="video">Video minh họa</option>
                <option value="doc">Word (Giáo án CV5512)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kích thước file</label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={e => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
