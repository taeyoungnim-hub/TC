import { Shield } from 'lucide-react';
import { getTrustScoreColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TrustScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export function TrustScoreBadge({ score, showLabel = false }: TrustScoreBadgeProps) {
  const colorClass = getTrustScoreColor(score);
  const label = score >= 70 ? '높음' : score >= 40 ? '보통' : '낮음';

  return (
    <div className="flex items-center gap-1.5">
      <Shield className={cn('w-4 h-4', colorClass)} />
      <span className={cn('font-semibold text-sm', colorClass)}>{Math.round(score)}</span>
      {showLabel && (
        <span className="text-xs text-gray-400">신뢰도 ({label})</span>
      )}
    </div>
  );
}
