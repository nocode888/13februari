import React from 'react';
import { MousePointer, Play, Heart, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsiderationFunnelProps {
  data: {
    clicks: number;
    ctr: number;
    landingPageViews: number;
    videoWatched: {
      p25: number;
      p50: number;
      p75: number;
      p100: number;
    };
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
    addToCart: number;
  };
}

export const ConsiderationFunnel: React.FC<ConsiderationFunnelProps> = ({ data }) => {
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

  const videoData = [
    { name: '25%', value: data.videoWatched.p25 },
    { name: '50%', value: data.videoWatched.p50 },
    { name: '75%', value: data.videoWatched.p75 },
    { name: '100%', value: data.videoWatched.p100 }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Consideration Stage</h2>
            <p className="text-gray-600">Middle funnel engagement metrics</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <MousePointer size={20} />
              <span className="font-medium">Total Clicks</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {formatNumber(data.clicks)}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {data.ctr.toFixed(2)}% CTR
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Play size={20} />
              <span className="font-medium">Video Views</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {formatNumber(data.videoWatched.p100)}
            </div>
            <div className="text-sm text-purple-600 mt-1">
              Complete views
            </div>
          </div>

          <div className="bg-pink-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-pink-600 mb-2">
              <Heart size={20} />
              <span className="font-medium">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-pink-700">
              {formatNumber(data.engagement.likes + data.engagement.comments + data.engagement.shares)}
            </div>
            <div className="text-sm text-pink-600 mt-1">
              Total interactions
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <ShoppingCart size={20} />
              <span className="font-medium">Add to Cart</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {formatNumber(data.addToCart)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              Product interest
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Completion Funnel */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Video Completion Rates</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={videoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Views" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Breakdown */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Engagement Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Likes</span>
                  <span className="text-sm font-medium">{formatNumber(data.engagement.likes)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ 
                      width: `${(data.engagement.likes / (data.engagement.likes + data.engagement.comments + data.engagement.shares)) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="text-sm font-medium">{formatNumber(data.engagement.comments)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${(data.engagement.comments / (data.engagement.likes + data.engagement.comments + data.engagement.shares)) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Shares</span>
                  <span className="text-sm font-medium">{formatNumber(data.engagement.shares)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ 
                      width: `${(data.engagement.shares / (data.engagement.likes + data.engagement.comments + data.engagement.shares)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};