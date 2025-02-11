import React from 'react';
import { Users, PieChart, Info } from 'lucide-react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DemographicBreakdownProps {
  data: {
    age: Array<{
      group: string;
      percentage: number;
      spend: number;
      reach: number;
      frequency: number;
    }>;
    gender: Array<{
      type: string;
      percentage: number;
      spend: number;
      reach: number;
      frequency: number;
    }>;
  };
}

export const DemographicBreakdown: React.FC<DemographicBreakdownProps> = ({ data }) => {
  if (!data) return null;

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

  const COLORS = {
    age: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
    gender: ['#8b5cf6', '#a78bfa', '#c4b5fd']
  };

  const calculateTotalReach = () => {
    return data.age.reduce((sum, group) => sum + group.reach, 0);
  };

  const calculateAverageFrequency = () => {
    return data.age.reduce((sum, group) => sum + group.frequency, 0) / data.age.length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Age Distribution</h3>
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart>
                <Pie
                  data={data.age}
                  dataKey="percentage"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {data.age.map((entry, index) => (
                    <Cell key={entry.group} fill={COLORS.age[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {data.age.map((group, index) => (
              <div key={group.group}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{group.group}</span>
                  <span className="text-sm font-medium">{(group.percentage * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div>Spend: {formatCurrency(group.spend)}</div>
                  <div>Reach: {formatNumber(group.reach)}</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${group.percentage * 100}%`,
                      backgroundColor: COLORS.age[index]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Gender Distribution</h3>
          <div className="text-sm text-gray-500">Real-time data</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart>
                <Pie
                  data={data.gender}
                  dataKey="percentage"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label={({ name, percent }) => 
                    `${name.charAt(0).toUpperCase() + name.slice(1)} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {data.gender.map((entry, index) => (
                    <Cell key={entry.type} fill={COLORS.gender[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {data.gender.map((gender, index) => (
              <div key={gender.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {gender.type.charAt(0).toUpperCase() + gender.type.slice(1)}
                  </span>
                  <span className="text-sm font-medium">{(gender.percentage * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div>Spend: {formatCurrency(gender.spend)}</div>
                  <div>Reach: {formatNumber(gender.reach)}</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${gender.percentage * 100}%`,
                      backgroundColor: COLORS.gender[index]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-2 text-purple-600 mb-4">
            <Users size={20} />
            <h3 className="font-medium">Best Performing Segment</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Overall Reach</div>
              <div className="font-medium text-gray-900">{formatNumber(calculateTotalReach())}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Frequency</div>
              <div className="font-medium text-gray-900">{calculateAverageFrequency().toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Spend</div>
              <div className="font-medium text-gray-900">
                {formatCurrency(data.age.reduce((sum, group) => sum + group.spend, 0))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <PieChart size={20} />
            <h3 className="font-medium">Engagement Summary</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Overall Reach</span>
                <span className="text-sm font-medium">{formatNumber(calculateTotalReach())}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Avg. Frequency</span>
                <span className="text-sm font-medium">{calculateAverageFrequency().toFixed(2)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${(calculateAverageFrequency() / 3) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};