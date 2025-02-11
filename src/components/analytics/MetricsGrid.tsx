import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Settings, X, ChevronDown, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { MetaApiService } from '../../services/metaApi';

interface MetricOption {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const AVAILABLE_METRICS: MetricOption[] = [
  { id: 'cpc', label: 'CPC', icon: ArrowDown, description: 'Cost per Click' },
  { id: 'ctr', label: 'CTR', icon: ArrowUp, description: 'Click-Through Rate' },
  { id: 'cpm', label: 'CPM', icon: ArrowDown, description: 'Cost per 1,000 Impressions' },
  { id: 'roas', label: 'ROAS', icon: ArrowUp, description: 'Return on Ad Spend' },
  { id: 'reach', label: 'Reach', icon: ArrowUp, description: 'Total Unique Users Reached' },
  { id: 'frequency', label: 'Frequency', icon: ArrowUp, description: 'Average Times Users See Ads' },
  { id: 'cpp', label: 'CPP', icon: ArrowDown, description: 'Cost per 1,000 People Reached' }
];

interface Metric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  sparklineData?: Array<{ value: number }>;
}

interface MetricsGridProps {
  metrics: Metric[];
  onMetricsChange?: (boxId: number, newMetricId: string) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics: initialMetrics, onMetricsChange }) => {
  const { accessToken, selectedAccount } = useAuthStore();
  const [metrics, setMetrics] = useState(initialMetrics.map((m, index) => ({ 
    ...m, 
    boxId: index
  })));
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to fetch metrics data
  const fetchMetricsData = async () => {
    if (!accessToken || !selectedAccount) {
      setError('Please connect your Meta account and select an ad account');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const metaApi = new MetaApiService(accessToken, selectedAccount.id);
      
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };

      // Fetch data for all metrics in parallel
      const metricPromises = metrics.map(metric => 
        metaApi.getAccountInsights(dateRange, [metric.id])
      );

      const results = await Promise.all(metricPromises);

      // Update metrics with new data
      const updatedMetrics = metrics.map((metric, index) => {
        const data = results[index];
        const currentValue = data.metrics[metric.id] || 0;
        const trend = data.trends[metric.id]?.direction || 'up';
        const change = data.trends[metric.id]?.value.toFixed(1) + '%';

        return {
          ...metric,
          value: formatMetricValue(metric.id, currentValue),
          change,
          trend,
          sparklineData: data.sparklines[metric.id]
        };
      });

      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Failed to fetch metrics data:', err);
      setError('Failed to fetch metrics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchMetricsData();

    // Set up 5-minute refresh interval
    const interval = setInterval(fetchMetricsData, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [accessToken, selectedAccount]);

  const handleMetricChange = async (boxId: number, newMetricId: string) => {
    const updatedMetrics = metrics.map(metric => 
      metric.boxId === boxId 
        ? { ...metric, id: newMetricId, label: AVAILABLE_METRICS.find(m => m.id === newMetricId)?.label || '' }
        : metric
    );

    setMetrics(updatedMetrics);
    setSelectedBoxId(null);
    
    if (onMetricsChange) {
      onMetricsChange(boxId, newMetricId);
    }

    // Fetch new data immediately
    fetchMetricsData();
  };

  const formatMetricValue = (metricId: string, value: number): string => {
    switch (metricId) {
      case 'cpc':
      case 'cpm':
      case 'cpp':
        return `$${value.toFixed(2)}`;
      case 'ctr':
        return `${value.toFixed(2)}%`;
      case 'roas':
        return `${value.toFixed(1)}x`;
      case 'reach':
      case 'frequency':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetricsData}
            disabled={isLoading}
            className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Loader2 size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <span className="text-sm text-gray-500">
            Auto-refreshes every 5 minutes
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <X size={16} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.boxId}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow relative group"
          >
            {/* Metric Selector Dropdown */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setSelectedBoxId(selectedBoxId === metric.boxId ? null : metric.boxId)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${
                    selectedBoxId === metric.boxId ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {selectedBoxId === metric.boxId && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {AVAILABLE_METRICS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleMetricChange(metric.boxId, option.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        metric.id === option.id ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <option.icon size={16} className="text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900">{option.label}</span>
                        <span className="text-xs text-gray-500 block">
                          {option.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <metric.icon size={20} />
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span>{metric.change}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              
              {/* Sparkline Chart */}
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metric.trend === 'up' ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {isLoading && metric.boxId === selectedBoxId && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};