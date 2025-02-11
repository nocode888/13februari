import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: any;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data?.metrics) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        No performance data available
      </div>
    );
  }

  const chartData = [
    {
      name: 'Current Period',
      impressions: data.metrics.impressions || 0,
      clicks: data.metrics.clicks || 0,
      conversions: data.metrics.conversions || 0
    }
  ];

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="impressions"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Impressions"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clicks"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Clicks"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversions"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="Conversions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};