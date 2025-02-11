import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';

export const ROIAnalysis: React.FC = () => {
  const data = [
    {
      month: 'Jan',
      spend: 5000,
      revenue: 15000,
      roi: 200
    },
    {
      month: 'Feb',
      spend: 6000,
      revenue: 19800,
      roi: 230
    },
    {
      month: 'Mar',
      spend: 7500,
      revenue: 26250,
      roi: 250
    },
    {
      month: 'Apr',
      spend: 8000,
      revenue: 32000,
      roi: 300
    },
    {
      month: 'May',
      spend: 10000,
      revenue: 45000,
      roi: 350
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-purple-600" />
            <span className="font-medium text-gray-900">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$138,050</div>
          <div className="text-sm text-purple-600">From ad campaigns</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="font-medium text-gray-900">Average ROI</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">266%</div>
          <div className="text-sm text-blue-600">Return on ad spend</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={18} className="text-green-600" />
            <span className="font-medium text-gray-900">Profit Margin</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">38.2%</div>
          <div className="text-sm text-green-600">After ad costs</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="spend"
              stroke="#3b82f6"
              name="Ad Spend"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Revenue"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roi"
              stroke="#8b5cf6"
              name="ROI %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};