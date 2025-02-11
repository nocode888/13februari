import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConversionFunnelProps {
  data: {
    purchases: number;
    revenue: number;
    cpa: number;
    roas: number;
    conversionRate: number;
    ltv: number;
  };
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Sample trend data (in a real app, this would come from the API)
  const trendData = [
    { date: '2024-01-01', revenue: data.revenue * 0.8, purchases: data.purchases * 0.8 },
    { date: '2024-01-02', revenue: data.revenue * 0.9, purchases: data.purchases * 0.9 },
    { date: '2024-01-03', revenue: data.revenue * 0.85, purchases: data.purchases * 0.85 },
    { date: '2024-01-04', revenue: data.revenue * 0.95, purchases: data.purchases * 0.95 },
    { date: '2024-01-05', revenue: data.revenue, purchases: data.purchases }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Conversion Stage</h2>
            <p className="text-gray-600">Bottom funnel performance metrics</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <DollarSign size={20} />
              <span className="font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(data.revenue)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              Total sales value
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <ShoppingBag size={20} />
              <span className="font-medium">Purchases</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {formatNumber(data.purchases)}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Total conversions
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <TrendingUp size={20} />
              <span className="font-medium">ROAS</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {data.roas.toFixed(2)}x
            </div>
            <div className="text-sm text-purple-600 mt-1">
              Return on ad spend
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Target size={20} />
              <span className="font-medium">Conv. Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {data.conversionRate.toFixed(2)}%
            </div>
            <div className="text-sm text-orange-600 mt-1">
              Click to purchase
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                      day: 'numeric',
                      month: 'short'
                    })}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={formatNumber}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                      name === 'revenue' ? 'Revenue' : 'Purchases'
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10b981"
                    fill="#10b98133"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="purchases"
                    name="Purchases"
                    stroke="#6366f1"
                    fill="#6366f133"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Cost per Acquisition (CPA)</span>
                  <span className="text-sm font-medium">{formatCurrency(data.cpa)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((data.cpa / (data.revenue / data.purchases)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Average cost to acquire a customer
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Customer Lifetime Value (LTV)</span>
                  <span className="text-sm font-medium">{formatCurrency(data.ltv)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min((data.ltv / (data.revenue / data.purchases * 3)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Average revenue per customer over time
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Return on Ad Spend (ROAS)</span>
                  <span className="text-sm font-medium">{data.roas.toFixed(2)}x</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min((data.roas / 5) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Revenue generated per ad spend dollar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};