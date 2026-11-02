import { cn } from '@/lib/cn';

export function Sparkline({
  points,
  current,
  height = 28,
}: {
  points: number[];
  current: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const w = 100;
  const pts = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastY = height - ((current - min) / range) * (height - 4) - 2;
  const isUp = points[0] > current;
  const stroke = isUp ? '#FF4D2E' : '#34D399';
  const area = `${pts} ${w.toFixed(1)},${height} 0,${height}`;

  return (
    <div className="mt-1 flex items-center gap-2">
      <svg viewBox={`0 0 ${w} ${height}`} className="h-6 w-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sg)" />
        <polyline
          points={pts}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={w} cy={lastY} r="2" fill={stroke} />
      </svg>
      <span className={cn('text-[10px] font-medium', isUp ? 'text-deal-400' : 'text-emerald-400')}>
        {isUp ? 'Price drop' : 'Best price'}
      </span>
    </div>
  );
}