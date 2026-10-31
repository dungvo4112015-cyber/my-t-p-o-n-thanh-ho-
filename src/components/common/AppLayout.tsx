import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './Toast';
import { useApp } from '../../contexts/AppContext';
import { LuckyWheelModal } from '../classroom/LuckyWheelModal';
import { RandomPickerModal } from '../classroom/RandomPickerModal';
import { GroupMakerModal } from '../classroom/GroupMakerModal';
import { CountdownTimerModal } from '../classroom/CountdownTimerModal';
import { QuickQuizModal } from '../classroom/QuickQuizModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('edusmart_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const { activeTool, setActiveTool } = useApp();

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('edusmart_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#040d1a] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Interactive Classroom Tools Modals */}
      <LuckyWheelModal isOpen={activeTool === 'wheel'} onClose={() => setActiveTool(null)} />
      <RandomPickerModal isOpen={activeTool === 'random'} onClose={() => setActiveTool(null)} />
      <GroupMakerModal isOpen={activeTool === 'groups'} onClose={() => setActiveTool(null)} />
      <CountdownTimerModal isOpen={activeTool === 'timer'} onClose={() => setActiveTool(null)} />
      <QuickQuizModal isOpen={activeTool === 'quick-quiz'} onClose={() => setActiveTool(null)} />
    </div>
  );
};
