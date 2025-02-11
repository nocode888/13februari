import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Layout, Monitor, Smartphone, Newspaper, TrendingUp } from 'lucide-react';

interface PlacementDistributionProps {
  data?: {
    placements: Array<{
      name: string;
      value: number;
      spend: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
    channels: Array<{
      name: string;
      value: number;
      spend: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
  };
}

export const PlacementDistribution: React.FC<PlacementDistributionProps> = ({ data }) => {
  if (!data) return null;

  const COLORS = {
    placements: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    channels: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'feed':
        return <Newspaper size={16} />;
      case 'stories':
        return <Smartphone size={16} />;
      case 'desktop':
        return <Monitor size={16} />;
      default:
        return <Layout size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Channel & Placement Distribution</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placement Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Placement Performance</h3>
            <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.placements}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                  >
                    {data.placements.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS.placements[index % COLORS.placements.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {data.placements.map((placement, index) => (
                <div key={placement.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getIcon(placement.name)}
                      <span className="text-sm text-gray-600">{placement.name}</span>
                    </div>
                    <span className="text-sm font-medium">{placement.value.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    CTR: {placement.ctr.toFixed(2)}% | Spend: {formatCurrency(placement.spend)}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${placement.value}%`,
                        backgroundColor: COLORS.placements[index % COLORS.placements.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Channel Distribution</h3>
            <div className="text-sm text-gray-500">Real-time data</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.channels}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                  >
                    {data.channels.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS.channels[index % COLORS.channels.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {data.channels.map((channel, index) => (
                <div key={channel.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getIcon(channel.name)}
                      <span className="text-sm text-gray-600">{channel.name}</span>
                    </div>
                    <span className="text-sm font-medium">{channel.value.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    CTR: {channel.ctr.toFixed(2)}% | Spend: {formatCurrency(channel.spend)}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${channel.value}%`,
                        backgroundColor: COLORS.channels[index % COLORS.channels.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp size={18} />
            <span className="font-medium">Top Placement</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {data.placements[0]?.name}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            {data.placements[0]?.value.toFixed(1)}% of total spend
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Layout size={18} />
            <span className="font-medium">Best CTR</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {Math.max(...[...data.placements, ...data.channels].map(item => item.ctr)).toFixed(2)}%
          </div>
          <div className="text-sm text-purple-600 mt-1">
            Click-through rate
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Monitor size={18} />
            <span className="font-medium">Total Impressions</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatNumber(data.placements.reduce((sum, item) => sum + item.impressions, 0))}
          </div>
          <div className="text-sm text-green-600 mt-1">
            Across all placements
          </div>
        </div>
      </div>
    </div>
  );
};