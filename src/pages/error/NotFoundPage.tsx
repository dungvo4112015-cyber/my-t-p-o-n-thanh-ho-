import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole } = useAuth();

  const handleGoHome = () => {
    if (currentRole === 'TEACHER') navigate('/teacher/dashboard');
    else if (currentRole === 'STUDENT') navigate('/student/dashboard');
    else if (currentRole === 'PARENT') navigate('/parent/dashboard');
    else if (currentRole === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black text-slate-900">404 - Trang không tồn tại</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển sang địa chỉ khác trong hệ thống.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Home className="w-4 h-4" /> Về trang chính
          </button>
        </div>
      </div>
    </div>
  );
};
