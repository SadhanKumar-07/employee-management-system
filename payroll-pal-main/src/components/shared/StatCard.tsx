import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-card border-l-4 border-l-primary',
  success: 'bg-card border-l-4 border-l-success',
  warning: 'bg-card border-l-4 border-l-warning',
  info: 'bg-card border-l-4 border-l-info',
};

const iconVariants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export const StatCard = ({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) => (
  <div className={cn('rounded-xl p-5 shadow-card border border-border animate-fade-in', variantStyles[variant])}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconVariants[variant])}>
        {icon}
      </div>
    </div>
  </div>
);
