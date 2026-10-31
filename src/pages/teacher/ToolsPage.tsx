import React from 'react';
import { useApp } from '../../contexts/AppContext';
import {
  Dices,
  Shuffle,
  Users2,
  Clock,
  HelpCircle,
  Play,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ToolsPage: React.FC = () => {
  const { setActiveTool, selectedClass } = useApp();

  const tools = [
    {
      id: 'wheel' as const,
      title: 'Vòng quay may mắn',
      desc: 'Quay ngẫu nhiên gọi tên học sinh lên bảng hoặc nhận phần thưởng với hiệu ứng âm thanh và pháo hoa rực rỡ.',
      icon: Dices,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300',
      badge: 'Phổ biến nhất',
    },
    {
      id: 'random' as const,
      title: 'Bốc thăm gọi tên ngẫu nhiên',
      desc: 'Chọn 1 hoặc nhiều học sinh cùng lúc, hỗ trợ cơ chế thông minh tránh gọi trùng lặp học sinh đã được gọi.',
      icon: Shuffle,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300',
    },
    {
      id: 'groups' as const,
      title: 'Bộ chia nhóm học tập',
      desc: 'Chia đều học sinh trong lớp theo số nhóm hoặc số lượng bạn mỗi nhóm, tùy chọn cân bằng tỉ lệ Nam/Nữ.',
      icon: Users2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300',
    },
    {
      id: 'timer' as const,
      title: 'Đồng hồ đếm ngược lớp học',
      desc: 'Hẹn giờ làm bài thảo luận nhóm 1, 3, 5, 10, 15 phút với vòng tròn tiến độ trực quan và chuông báo khi hết giờ.',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300',
    },
    {
      id: 'quick-quiz' as const,
      title: 'Khảo sát & Quiz nhanh tức thời',
      desc: 'Đưa ra câu hỏi trắc nghiệm trực tiếp tại lớp để học sinh giơ tay biểu quyết và hiển thị biểu đồ kết quả tức thì.',
      icon: HelpCircle,
      color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Dices className="w-6 h-6 text-purple-400" />
          Hộp công cụ tương tác trên lớp ({selectedClass?.name})
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Các tiện ích hỗ trợ tổ chức trò chơi học tập, chia nhóm, bấm giờ và tạo không khí lớp học sôi nổi
        </p>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`p-6 rounded-3xl bg-white border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 ${tool.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-white shadow-xs border border-slate-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mt-4">{tool.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tool.desc}</p>
              </div>

              <button
                onClick={() => setActiveTool(tool.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-102"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Mở công cụ ngay
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
