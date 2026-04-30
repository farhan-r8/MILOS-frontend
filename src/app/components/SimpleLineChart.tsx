interface DataPoint {
  month: string;
  points: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
}

export function SimpleLineChart({ data }: SimpleLineChartProps) {
  const maxPoints = Math.max(...data.map(d => d.points));
  const minPoints = Math.min(...data.map(d => d.points));
  const range = maxPoints - minPoints;

  // Calculate positions for each point
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.points - minPoints) / range) * 100;
    return { x, y, ...item };
  });

  // Create SVG path
  const pathD = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <div className="w-full h-[300px] relative">
      {/* Chart SVG */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        <g className="opacity-20">
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={`grid-${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#6b7280"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-300"
        />

        {/* Area under line */}
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#gradient)"
          opacity="0.2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Points and labels */}
      <div className="absolute inset-0 flex items-end justify-between px-2">
        {points.map((point, index) => (
          <div key={`point-${index}`} className="flex flex-col items-center relative group flex-1">
            {/* Dot */}
            <div
              className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform z-10"
              style={{
                bottom: `${100 - point.y}%`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                  {point.points.toLocaleString()} poin
                </div>
              </div>
            </div>

            {/* Month label */}
            <div className="text-sm font-medium text-gray-600 mt-2">
              {point.month}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
