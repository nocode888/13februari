import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface SpendAnalysisProps {
  data: {
    daily: Array<{
      date: string;
      spend: number;
      region: string;
    }>;
    totals: {
      [key: string]: number;
    };
  };
}

export const SpendAnalysis: React.FC<SpendAnalysisProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <DollarSign size={20} />
          <span>No spend data available</span>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Spend Budget Analysis</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <DollarSign size={18} />
              <span className="font-medium">Total Spend</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(Object.values(data.totals).reduce((a, b) => a + b, 0))}
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
              <ArrowUp size={14} />
              <span>12.5% vs last period</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp size={18} />
              <span className="font-medium">Budget Utilization</span>
            </div>
            <div className="text-2xl font-bold text-green-700">78.3%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <ArrowUp size={14} />
              <span>5.2% efficiency</span>
            </div>
          </div>
        </div>

        {/* Spend Distribution Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                  day: 'numeric',
                  month: 'short'
                })}
              />
              <YAxis tickFormatter={(value) => `Rp${value / 1000}K`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              />
              <Legend />
              <Bar dataKey="spend" name="Daily Spend" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};