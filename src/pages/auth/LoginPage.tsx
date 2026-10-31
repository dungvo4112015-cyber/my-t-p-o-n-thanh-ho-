import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Users2,
  Lock,
  Mail,
  ArrowRight,
  School,
} from 'lucide-react';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('teacher.an@edusmart.edu.vn');
  const [password, setPassword] = useState('123456');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/teacher/dashboard');
  };

  const handleQuickDemoLogin = (role: Role) => {
    switchRole(role);
    if (role === 'TEACHER') navigate('/teacher/dashboard');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'PARENT') navigate('/parent/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          E
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          EduSmart PRO
        </h2>
        <p className="text-xs text-slate-500">
          Nền tảng Quản lý Lớp học Thông minh & Chuyển đổi số Giáo dục
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200/80 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email tài khoản</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-101"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          {/* Firebase Google Auth Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await (useAuth as any)().loginWithGoogle?.();
                  navigate('/teacher/dashboard');
                } catch (err) {
                  console.error('Google login failed:', err);
                }
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng nhập với Google (Firebase Auth)</span>
            </button>
          </div>

          {/* Quick Demo Role Switcher Section */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
              Hoặc chọn tài khoản thử nghiệm nhanh (Demo)
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('TEACHER')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 font-bold flex items-center gap-2 transition-colors text-left"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="block text-[11px]">Giáo viên</span>
                  <span className="text-[10px] text-blue-600 font-normal">Thầy An (9A1)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('STUDENT')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center gap-2 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="block text-[11px]">Học sinh</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Lê Hải Đăng</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('PARENT')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-2 transition-colors text-left"
              >
                <Users2 className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="block text-[11px]">Phụ huynh</span>
                  <span className="text-[10px] text-amber-600 font-normal">Trần Thị Mai</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-900 font-bold flex items-center gap-2 transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="block text-[11px]">Quản trị viên</span>
                  <span className="text-[10px] text-rose-600 font-normal">Lê Thanh Tùng</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
