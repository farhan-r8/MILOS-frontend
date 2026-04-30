interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface SimplePieChartProps {
  data: DataPoint[];
}

export function SimplePieChart({ data }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate segments
  let currentAngle = -90; // Start from top
  const segments = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // Function to calculate arc path
  const describeArc = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="w-full h-[250px] flex items-center justify-center">
      <div className="relative" style={{ width: '250px', height: '250px' }}>
        {/* SVG Pie Chart */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {segments.map((segment, index) => (
            <g key={`segment-${index}`} className="group cursor-pointer">
              <path
                d={describeArc(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full space-y-2 min-w-[120px]">
          {segments.map((segment, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2 text-sm group cursor-pointer">
              <div
                className="w-3 h-3 rounded-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <div className="text-gray-700 font-medium">{segment.name}</div>
                <div className="text-gray-500 text-xs">
                  {(segment.percentage * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
