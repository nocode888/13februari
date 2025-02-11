import React from 'react';
import { TrendingUp, ArrowUp, ArrowDown, Target, MousePointer } from 'lucide-react';

interface TrendingCitiesProps {
  data: Array<{
    city: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    growth: number;
  }>;
}

export const TrendingCities: React.FC<TrendingCitiesProps> = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <TrendingUp size={20} />
          <span>No city data available</span>
        </div>
      </div>
    );
  }

  // Sort cities by performance (using CTR and growth as factors)
  const sortedCities = [...data].sort((a, b) => {
    const scoreA = (a.ctr * 0.7) + (a.growth * 0.3);
    const scoreB = (b.ctr * 0.7) + (b.growth * 0.3);
    return scoreB - scoreA;
  });

  // Get top city
  const topCity = sortedCities[0];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Trending Cities</h2>
            <p className="text-gray-600">Performance by region</p>
          </div>
        </div>

        {/* Top City Highlight */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">{topCity.city}</span>
                <div className={`flex items-center gap-1 text-sm ${
                  topCity.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {topCity.growth >= 0 ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  <span>{Math.abs(Math.round(topCity.growth))}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Leading performance region</p>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Clicks Card */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <MousePointer size={20} />
                <span className="font-medium">Total Clicks</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {formatNumber(topCity.clicks)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                From {formatNumber(topCity.impressions)} impressions
              </div>
            </div>

            {/* CTR Card */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Target size={20} />
                <span className="font-medium">Engagement Rate</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {topCity.ctr.toFixed(1)}%
              </div>
              <div className="text-sm text-green-600 mt-1">
                Click-through rate
              </div>
            </div>
          </div>
        </div>

        {/* Other Cities List */}
        <div className="space-y-4">
          {sortedCities.slice(1).map((city, index) => (
            <div key={city.city} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-gray-900">
                    {index + 2}. {city.city}
                  </span>
                  <div className={`flex items-center gap-1 text-sm ${
                    city.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {city.growth >= 0 ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    <span>{Math.abs(Math.round(city.growth))}%</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {city.ctr.toFixed(1)}% CTR
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{ 
                    width: `${(city.clicks / topCity.clicks) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};