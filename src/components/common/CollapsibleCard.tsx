import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';

export interface CollapsibleCardProps {
  title: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  children,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs transition-all overflow-hidden ${className}`}
    >
      {/* Header */}
      <div
        onClick={handleToggle}
        className={`px-5 py-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-slate-50/70 ${headerClassName} ${
          isOpen ? 'border-b border-slate-100' : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate">{title}</h3>
              {badge}
            </div>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {actions}
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isOpen ? 'Thu gọn nội dung' : 'Mở rộng nội dung'}
          >
            <span className="hidden sm:inline text-[11px]">{isOpen ? 'Thu gọn' : 'Mở rộng'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className={`p-5 animate-in fade-in duration-150 ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};
