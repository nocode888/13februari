import React, { useState } from 'react';
import { MapPin, Info, Filter, ChevronDown, Search } from 'lucide-react';

interface GeoMapProps {
  data: Array<{
    region: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    reach: number;
    frequency: number;
  }>;
}

export const GeoMap: React.FC<GeoMapProps> = ({ data }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetric, setFilterMetric] = useState<'ctr' | 'spend' | 'reach'>('ctr');
  const [showFilters, setShowFilters] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin size={20} />
          <span>No geographic data available</span>
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getPerformanceColor = (value: number, metric: typeof filterMetric) => {
    if (metric === 'ctr') {
      if (value >= 3) return 'bg-green-500';
      if (value >= 2) return 'bg-blue-500';
      if (value >= 1) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (metric === 'spend') {
      const maxSpend = Math.max(...data.map(r => r.spend));
      const ratio = value / maxSpend;
      if (ratio >= 0.75) return 'bg-green-500';
      if (ratio >= 0.5) return 'bg-blue-500';
      if (ratio >= 0.25) return 'bg-yellow-500';
      return 'bg-red-500';
    }

    // Reach metric
    const maxReach = Math.max(...data.map(r => r.reach));
    const ratio = value / maxReach;
    if (ratio >= 0.75) return 'bg-green-500';
    if (ratio >= 0.5) return 'bg-blue-500';
    if (ratio >= 0.25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMetricValue = (region: any, metric: typeof filterMetric) => {
    if (metric === 'ctr') return region.ctr;
    if (metric === 'spend') return region.spend;
    return region.reach;
  };

  const filteredData = data
    .filter(region => 
      region.region.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => getMetricValue(b, filterMetric) - getMetricValue(a, filterMetric));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">City Performance</h2>
          
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cities..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Metric Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">
                  {filterMetric === 'ctr' ? 'CTR' : filterMetric === 'spend' ? 'Spend' : 'Reach'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => {
                      setFilterMetric('ctr');
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      filterMetric === 'ctr' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    Click-Through Rate (CTR)
                  </button>
                  <button
                    onClick={() => {
                      setFilterMetric('spend');
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      filterMetric === 'spend' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    Total Spend
                  </button>
                  <button
                    onClick={() => {
                      setFilterMetric('reach');
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      filterMetric === 'reach' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    Audience Reach
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* City List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((city) => (
            <button
              key={city.region}
              onClick={() => setSelectedRegion(city.region)}
              className={`text-left p-4 rounded-lg transition-colors ${
                selectedRegion === city.region
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{city.region}</span>
                <span className={`w-2 h-2 rounded-full ${
                  getPerformanceColor(getMetricValue(city, filterMetric), filterMetric)
                }`} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-600">Spend</div>
                  <div className="font-medium text-gray-900">
                    {formatCurrency(city.spend)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">CTR</div>
                  <div className="font-medium text-gray-900">
                    {city.ctr.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Reach</div>
                  <div className="font-medium text-gray-900">
                    {formatNumber(city.reach)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Frequency</div>
                  <div className="font-medium text-gray-900">
                    {city.frequency.toFixed(2)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected City Details */}
        {selectedRegion && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="font-medium text-gray-900">{selectedRegion} Details</h3>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: 'Spend', value: formatCurrency(data.find(r => r.region === selectedRegion)?.spend || 0) },
                { label: 'Impressions', value: formatNumber(data.find(r => r.region === selectedRegion)?.impressions || 0) },
                { label: 'Reach', value: formatNumber(data.find(r => r.region === selectedRegion)?.reach || 0) },
                { label: 'Frequency', value: (data.find(r => r.region === selectedRegion)?.frequency || 0).toFixed(2) },
                { label: 'Clicks', value: formatNumber(data.find(r => r.region === selectedRegion)?.clicks || 0) },
                { label: 'CTR', value: `${(data.find(r => r.region === selectedRegion)?.ctr || 0).toFixed(2)}%` }
              ].map((metric) => (
                <div key={metric.label} className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                  <div className="font-semibold text-gray-900">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};