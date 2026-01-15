import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getRiskLevel } from '@/types/transaction';

interface RiskGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RiskGauge({ value, size = 'md', showLabel = true, className }: RiskGaugeProps) {
  const riskLevel = getRiskLevel(value);
  
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 8, fontSize: 'text-lg' },
    md: { width: 120, strokeWidth: 10, fontSize: 'text-2xl' },
    lg: { width: 160, strokeWidth: 12, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (value / 100) * circumference;

  const colorClass = useMemo(() => {
    switch (riskLevel) {
      case 'safe':
        return 'stroke-risk-safe';
      case 'warning':
        return 'stroke-risk-warning';
      case 'fraud':
        return 'stroke-risk-fraud';
    }
  }, [riskLevel]);

  const bgColorClass = useMemo(() => {
    switch (riskLevel) {
      case 'safe':
        return 'stroke-risk-safe/20';
      case 'warning':
        return 'stroke-risk-warning/20';
      case 'fraud':
        return 'stroke-risk-fraud/20';
    }
  }, [riskLevel]);

  const textColorClass = useMemo(() => {
    switch (riskLevel) {
      case 'safe':
        return 'text-risk-safe';
      case 'warning':
        return 'text-risk-warning';
      case 'fraud':
        return 'text-risk-fraud';
    }
  }, [riskLevel]);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: config.width, height: config.width / 2 + 20 }}>
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
        >
          {/* Background arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            className={bgColorClass}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
            fill="none"
            className={cn(colorClass, 'transition-all duration-700 ease-out')}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              filter: `drop-shadow(0 0 8px hsl(var(--risk-${riskLevel}) / 0.5))`,
            }}
          />
        </svg>
        
        {/* Value display */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-2"
          style={{ top: '20%' }}
        >
          <span className={cn('font-bold font-mono', config.fontSize, textColorClass)}>
            {value}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className={cn('text-sm font-medium uppercase tracking-wider', textColorClass)}>
          {riskLevel === 'safe' && 'Low Risk'}
          {riskLevel === 'warning' && 'Elevated'}
          {riskLevel === 'fraud' && 'Critical'}
        </span>
      )}
    </div>
  );
}
