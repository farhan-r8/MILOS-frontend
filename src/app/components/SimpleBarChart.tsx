interface DataPoint {
  month: string;
  points: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
}

export function SimpleBarChart({ data }: SimpleBarChartProps) {
  const maxPoints = Math.max(...data.map(d => d.points));

  return (
    <div className="w-full h-[300px] flex flex-col relative">
      {/* Horizontal grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 py-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={`grid-${i}`} className="border-t border-gray-200" />
        ))}
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 px-4 relative z-10">
        {data.map((item, index) => {
          const heightPercent = (item.points / maxPoints) * 100;

          return (
            <div key={`${item.month}-${index}`} className="flex-1 flex flex-col items-center gap-3">
              {/* Bar container */}
              <div className="w-full flex flex-col items-center justify-end h-full">
                {/* Value label */}
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  {item.points.toLocaleString()}
                </div>
                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer relative group"
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {item.points.toLocaleString()} poin
                    </div>
                  </div>
                </div>
              </div>
              {/* Month label */}
              <div className="text-sm font-medium text-gray-600">
                {item.month}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
