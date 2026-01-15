import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'safe' | 'warning' | 'fraud';
  children?: ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  variant = 'default',
  children,
  className,
}: StatCardProps) {
  const variantStyles = {
    default: '',
    safe: 'border-risk-safe/30',
    warning: 'border-risk-warning/30',
    fraud: 'border-risk-fraud/30',
  };

  const valueStyles = {
    default: 'text-foreground',
    safe: 'text-risk-safe',
    warning: 'text-risk-warning',
    fraud: 'text-risk-fraud',
  };

  return (
    <div
      className={cn(
        'glass-card p-6 flex flex-col gap-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'default' ? 'bg-primary/10' : `bg-risk-${variant}/10`
          )}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn('text-3xl font-bold tracking-tight font-mono', valueStyles[variant])}>
          {value}
        </span>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          {trend >= 0 ? (
            <div className="flex items-center gap-1 text-risk-safe">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{trend}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-risk-fraud">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}%</span>
            </div>
          )}
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
