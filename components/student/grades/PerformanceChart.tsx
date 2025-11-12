'use client'

interface PerformanceData {
  month: string
  grade: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const maxGrade = Math.max(...data.map(d => d.grade))
  const minGrade = Math.min(...data.map(d => d.grade))

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-4">Performance Trend (Last 6 Months)</h4>
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.grade / 100) * 100
            const isHighest = item.grade === maxGrade
            const isLowest = item.grade === minGrade

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all hover:opacity-80 ${
                      isHighest ? 'bg-green-500' : isLowest ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                      {item.grade}%
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 font-medium">
                  {item.month}
                </div>
              </div>
            )
          })}
        </div>

        {/* Grid lines */}
        <div className="absolute left-12 right-0 top-0 bottom-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map((value) => (
            <div
              key={value}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{ bottom: `${value}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
