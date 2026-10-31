import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Users, BookOpen, FileText, Bell, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { students, classes, assignments, resources, announcements } = useApp();
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'Học sinh' | 'Lớp học' | 'Bài tập' | 'Học liệu' | 'Thông báo';
      icon: any;
      path: string;
    }> = [];

    // Students (Teacher & Admin only)
    if (currentRole === 'TEACHER' || currentRole === 'ADMIN') {
      students
        .filter(s => s.fullName.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach(s => {
          list.push({
            id: s.id,
            title: `${s.fullName} (${s.studentCode})`,
            subtitle: `${s.className} • Điểm TB: ${s.gpa} • Điểm rèn luyện: ${s.rewardPoints}`,
            category: 'Học sinh',
            icon: Users,
            path: currentRole === 'TEACHER' ? `/teacher/students` : `/admin/students`,
          });
        });
    }

    // Classes
    if (currentRole === 'TEACHER' || currentRole === 'ADMIN') {
      classes
        .filter(c => c.name.toLowerCase().includes(q) || (c.subject && c.subject.toLowerCase().includes(q)))
        .slice(0, 3)
        .forEach(c => {
          list.push({
            id: c.id,
            title: c.name,
            subtitle: `${c.room} • ${c.studentCount} học sinh • ${c.homeroomTeacherName}`,
            category: 'Lớp học',
            icon: BookOpen,
            path: currentRole === 'TEACHER' ? `/teacher/classes/${c.id}` : `/admin/classes`,
          });
        });
    }

    // Assignments
    assignments
      .filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(a => {
        list.push({
          id: a.id,
          title: a.title,
          subtitle: `${a.className} • Hạn nộp: ${new Date(a.dueDate).toLocaleDateString('vi-VN')}`,
          category: 'Bài tập',
          icon: FileText,
          path: currentRole === 'STUDENT' ? `/student/assignments` : `/teacher/assignments`,
        });
      });

    // Resources
    resources
      .filter(r => r.title.toLowerCase().includes(q) || r.chapter.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(r => {
        list.push({
          id: r.id,
          title: r.title,
          subtitle: `${r.subject} • ${r.chapter} • ${r.fileType.toUpperCase()}`,
          category: 'Học liệu',
          icon: BookOpen,
          path: currentRole === 'STUDENT' ? `/student/resources` : `/teacher/resources`,
        });
      });

    // Announcements
    announcements
      .filter(anc => anc.title.toLowerCase().includes(q) || anc.content.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(anc => {
        list.push({
          id: anc.id,
          title: anc.title,
          subtitle: `Người gửi: ${anc.senderName} • ${new Date(anc.createdAt).toLocaleDateString('vi-VN')}`,
          category: 'Thông báo',
          icon: Bell,
          path:
            currentRole === 'TEACHER'
              ? `/teacher/announcements`
              : currentRole === 'PARENT'
              ? `/parent/notifications`
              : `/student/notifications`,
        });
      });

    return list;
  }, [query, students, classes, assignments, resources, announcements, currentRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-slate-100 px-4">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm học sinh, lớp, bài tập, học liệu, thông báo... (Nhấn ESC để đóng)"
            className="h-14 w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-blue-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-600">Tìm kiếm thông minh toàn hệ thống</p>
              <p className="text-xs text-slate-400 mt-1">Gõ họ tên học sinh, mã số, tên bài tập hoặc môn học để tra cứu tức thì</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Không tìm thấy kết quả nào phù hợp với từ khóa "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
