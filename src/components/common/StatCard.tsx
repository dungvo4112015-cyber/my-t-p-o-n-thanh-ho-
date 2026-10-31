import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  trend?: {
    value: string;
    isUp: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      iconText: 'text-blue-600',
      border: 'hover:border-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconText: 'text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50',
      iconText: 'text-amber-600',
      border: 'hover:border-amber-300',
    },
    purple: {
      bg: 'bg-purple-50',
      iconText: 'text-purple-600',
      border: 'hover:border-purple-300',
    },
    rose: {
      bg: 'bg-rose-50',
      iconText: 'text-rose-600',
      border: 'hover:border-rose-300',
    },
    slate: {
      bg: 'bg-slate-100',
      iconText: 'text-slate-600',
      border: 'hover:border-slate-300',
    },
  };

  const style = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + style.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.iconText}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1.5 text-xs text-slate-500 font-normal leading-normal">{subtitle}</p>}
    </div>
  );
};
