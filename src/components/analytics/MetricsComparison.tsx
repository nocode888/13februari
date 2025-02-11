import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { MetaApiService } from '../../services/metaApi';

interface TimeRange {
  label: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Yesterday', days: 1 },
  { label: 'Last 3 Days', days: 3 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 }
];

interface MetricData {
  id: string;
  label: string;
  format: 'currency' | 'number' | 'percentage';
  value: number;
  isExpanded?: boolean;
}

const DEFAULT_METRICS: MetricData[] = [
  { id: 'spend', label: 'Spend', format: 'currency', value: 0 },
  { id: 'purchases', label: 'Purchase (Web)', format: 'number', value: 0 },
  { id: 'cost_per_purchase', label: 'Cost Per Purchase (Web)', format: 'currency', value: 0 },
  { id: 'ctr', label: 'CTR (Outbound)', format: 'percentage', value: 0 },
  { id: 'cpm', label: 'CPM', format: 'currency', value: 0 }
];

export const MetricsComparison: React.FC = () => {
  const { accessToken, selectedAccount } = useAuthStore();
  const [metrics, setMetrics] = useState<MetricData[]>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMetric, setIsAddingMetric] = useState(false);

  const fetchMetricsData = async () => {
    if (!accessToken || !selectedAccount) {
      setError('Please connect your Meta account and select an ad account');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const metaApi = new MetaApiService(accessToken, selectedAccount.id);
      
      // Create date ranges for each time period
      const dateRanges = TIME_RANGES.map(range => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - range.days);
        return {
          label: range.label,
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        };
      });

      // Fetch data for all metrics and time ranges in parallel
      const promises = dateRanges.map(range => 
        metaApi.getAccountInsights(range, metrics.map(m => m.id))
      );

      const results = await Promise.all(promises);

      // Update metrics with data from all time ranges
      const updatedMetrics = metrics.map(metric => ({
        ...metric,
        timeRanges: results.map((result, index) => ({
          label: dateRanges[index].label,
          value: result.metrics[metric.id] || 0
        }))
      }));

      setMetrics(updatedMetrics);
    } catch (err) {
      console.error('Failed to fetch metrics data:', err);
      setError('Failed to fetch metrics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsData();
  }, [accessToken, selectedAccount]);

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const toggleMetricExpansion = (index: number) => {
    setMetrics(metrics.map((metric, i) => ({
      ...metric,
      isExpanded: i === index ? !metric.isExpanded : metric.isExpanded
    })));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Metrics Comparison</h3>
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
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <X size={16} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-sm font-medium text-gray-500 p-4 min-w-[200px]">
                Key Metrics
              </th>
              {TIME_RANGES.map((range) => (
                <th key={range.label} className="text-left text-sm font-medium text-gray-500 p-4 min-w-[150px]">
                  <div className="flex items-center gap-2">
                    {range.label}
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.map((metric, index) => (
              <tr key={metric.id} className="group hover:bg-gray-50">
                <td className="p-4">
                  <button
                    onClick={() => toggleMetricExpansion(index)}
                    className="flex items-center gap-2 text-sm text-gray-900"
                  >
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${
                        metric.isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                    {metric.label}
                  </button>
                </td>
                {metric.timeRanges?.map((range, rangeIndex) => (
                  <td key={rangeIndex} className="p-4 text-sm text-gray-900">
                    {formatValue(range.value, metric.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsAddingMetric(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Metrics
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};