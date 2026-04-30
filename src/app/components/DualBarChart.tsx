interface DataPoint {
  id: string;
  month: string;
  transactions: number;
  weight: number;
}

interface DualBarChartProps {
  data: DataPoint[];
}

export function DualBarChart({ data }: DualBarChartProps) {
  const maxTransactions = Math.max(...data.map(d => d.transactions));
  const maxWeight = Math.max(...data.map(d => d.weight));

  return (
    <div className="w-full h-[300px] flex flex-col">
      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Transaksi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Berat (kg)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-end justify-between gap-2 px-4 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`grid-line-${i}`} className="border-t border-gray-200" />
          ))}
        </div>

        {/* Bars */}
        {data.map((item) => {
          const transactionHeight = (item.transactions / maxTransactions) * 100;
          const weightHeight = (item.weight / maxWeight) * 100;

          return (
            <div key={item.id} className="flex-1 flex flex-col items-center gap-3 relative z-10">
              {/* Bar container */}
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Transactions bar */}
                <div className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500 cursor-pointer relative"
                    style={{ height: `${transactionHeight}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                        {item.transactions} transaksi
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight bar */}
                <div className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer relative"
                    style={{ height: `${weightHeight}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                        {item.weight} kg
                      </div>
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
