import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineChartProps {
  data: { value: number }[];
  color?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, color = "#00f5a0" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-24 h-8 flex items-center justify-center">
        <div className="w-12 h-[1px] bg-gray-600 opacity-20" />
      </div>
    );
  }

  return (
    <div className="w-24 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
