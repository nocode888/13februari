import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Image, Play, FileText, Eye, MousePointer, ShoppingCart, ChevronDown, Calendar } from 'lucide-react';

interface CreativePerformanceProps {
  creatives: Array<{
    id: string;
    name: string;
    type: string;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    spend?: number;
    currency?: string;
    launchDate?: string;
    previewUrl?: string;
  }>;
  currency?: string;
}

export const CreativePerformance: React.FC<CreativePerformanceProps> = ({ 
  creatives,
  currency = 'USD'
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!creatives || creatives.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No creative performance data available
      </div>
    );
  }

  // Sort creatives by launch date (newest first)
  const sortedCreatives = [...creatives].sort((a, b) => {
    const dateA = a.launchDate ? new Date(a.launchDate) : new Date(0);
    const dateB = b.launchDate ? new Date(b.launchDate) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  // Get recent and remaining creatives
  const recentCreatives = sortedCreatives.slice(0, 6);
  const remainingCreatives = sortedCreatives.slice(6);

  const getCreativeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Play size={16} className="text-purple-500" />;
      case 'carousel':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <Image size={16} className="text-blue-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(creatives.reduce((sum, c) => sum + (c.impressions || 0), 0))}
              </p>
              <p className="text-sm text-blue-600">Total Impressions</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MousePointer size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(creatives.reduce((sum, c) => sum + (c.clicks || 0), 0))}
              </p>
              <p className="text-sm text-green-600">Total Clicks</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(creatives.reduce((sum, c) => sum + (c.conversions || 0), 0))}
              </p>
              <p className="text-sm text-purple-600">Total Conversions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentCreatives.map((creative) => (
            <div key={creative.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {creative.previewUrl && (
                <div className="aspect-video w-full bg-gray-100">
                  <img 
                    src={creative.previewUrl} 
                    alt={creative.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getCreativeIcon(creative.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{creative.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {formatDate(creative.launchDate)}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    (creative.ctr || 0) >= 4 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {creative.ctr?.toFixed(2) || 0}% CTR
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(creative.impressions || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(creative.clicks || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Clicks</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(creative.spend || 0)}
                    </p>
                    <p className="text-sm text-gray-500">Spend</p>
                  </div>
                </div>

                <div className="h-[120px] bg-gray-50 border-t border-gray-200 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[creative]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="impressions" fill="#3b82f6" name="Views" />
                      <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                      <Bar dataKey="conversions" fill="#8b5cf6" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Section */}
        {remainingCreatives.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mx-auto"
            >
              {showAll ? 'Show Less' : `Show ${remainingCreatives.length} More`}
              <ChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${
                  showAll ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAll && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {remainingCreatives.map((creative) => (
                  <div key={creative.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Same creative card content as above */}
                    {creative.previewUrl && (
                      <div className="aspect-video w-full bg-gray-100">
                        <img 
                          src={creative.previewUrl} 
                          alt={creative.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getCreativeIcon(creative.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{creative.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar size={14} />
                              {formatDate(creative.launchDate)}
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          (creative.ctr || 0) >= 4 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {creative.ctr?.toFixed(2) || 0}% CTR
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(creative.impressions || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Views</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(creative.clicks || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Clicks</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(creative.spend || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Spend</p>
                        </div>
                      </div>

                      <div className="h-[120px] bg-gray-50 border-t border-gray-200 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[creative]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="impressions" fill="#3b82f6" name="Views" />
                            <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                            <Bar dataKey="conversions" fill="#8b5cf6" name="Conversions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};