import React from 'react';
import { Users, Eye, BarChart2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AwarenessFunnelProps {
  data: {
    reach: {
      total: number;
      byPlacement: Record<string, number>;
      trend: number;
    };
    frequency: number;
    impressions: number;
    brandLift: {
      awareness: number;
      recall: number;
      consideration: number;
    } | null;
    demographics: {
      age: Array<{ group: string; percentage: number }>;
      gender: Array<{ type: string; percentage: number }>;
    };
  };
}

export const AwarenessFunnel: React.FC<AwarenessFunnelProps> = ({ data }) => {
  if (!data) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const placementData = Object.entries(data.reach.byPlacement).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Awareness Stage</h2>
            <p className="text-gray-600">Top of funnel metrics and brand awareness</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Users size={20} />
              <span className="font-medium">Total Reach</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {formatNumber(data.reach.total)}
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
              {data.reach.trend >= 0 ? '+' : ''}{data.reach.trend.toFixed(1)}% vs previous
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Eye size={20} />
              <span className="font-medium">Impressions</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {formatNumber(data.impressions)}
            </div>
            <div className="text-sm text-purple-600 mt-1">
              {data.frequency.toFixed(2)} avg. frequency
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <BarChart2 size={20} />
              <span className="font-medium">Brand Lift</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {data.brandLift ? `+${data.brandLift.awareness.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-green-600 mt-1">
              Brand awareness increase
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Target size={20} />
              <span className="font-medium">Recall Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {data.brandLift ? `${data.brandLift.recall.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-orange-600 mt-1">
              Ad recall rate
            </div>
          </div>
        </div>

        {/* Placement Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Reach by Placement</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="value" name="Reach" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Demographic Distribution</h3>
            <div className="space-y-6">
              {/* Age Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h4>
                <div className="space-y-2">
                  {data.demographics.age.map((group) => (
                    <div key={group.group}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{group.group}</span>
                        <span className="text-sm font-medium">{(group.percentage * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${group.percentage * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Gender</h4>
                <div className="space-y-2">
                  {data.demographics.gender.map((gender) => (
                    <div key={gender.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          {gender.type.charAt(0).toUpperCase() + gender.type.slice(1)}
                        </span>
                        <span className="text-sm font-medium">{(gender.percentage * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${gender.percentage * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};