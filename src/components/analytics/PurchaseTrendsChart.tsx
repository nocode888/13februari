import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PurchaseTrendsChartProps {
  data: Array<{
    date: string;
    purchases: number;
  }>;
}

export const PurchaseTrendsChart: React.FC<PurchaseTrendsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No purchase data available
      </div>
    );
  }

  // Calculate moving average for trend line
  const movingAverageData = data.map((item, index) => {
    const window = data.slice(Math.max(0, index - 2), index + 1);
    const average = window.reduce((sum, curr) => sum + curr.purchases, 0) / window.length;
    return {
      ...item,
      trend: average
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={movingAverageData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => value.toLocaleString()}
            labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          />
          <Area
            type="monotone"
            dataKey="purchases"
            stroke="#8b5cf6"
            fill="#8b5cf680"
            name="Purchases"
          />
          <Area
            type="monotone"
            dataKey="trend"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="none"
            name="Trend"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};