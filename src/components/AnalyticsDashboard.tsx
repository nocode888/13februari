import React, { useState, useEffect } from 'react';
import {
  BarChart,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Share2,
} from 'lucide-react';
import { DateRangePicker } from './analytics/DateRangePicker';
import { CurrencySelector } from './analytics/CurrencySelector';
import { MetricsGrid } from './analytics/MetricsGrid';
import { PerformanceChart } from './analytics/PerformanceChart';
import { PurchaseTrendsChart } from './analytics/PurchaseTrendsChart';
import { RevenueComparisonChart } from './analytics/RevenueComparisonChart';
import { AIChatbot } from './AIChatbot';
import { useMetaAnalytics } from '../hooks/useMetaAnalytics';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from './LoadingScreen';
import { ShareLinkModal } from './ShareLinkModal';

interface AnalyticsDashboardProps {
  isShared?: boolean;
  dashboardData?: {
    id: string;
    accessType: 'view' | 'edit';
    expiresIn: string;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isShared,
  dashboardData,
}) => {
  const { selectedAccount } = useAuthStore();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [currency, setCurrency] = useState(selectedAccount?.currency || 'IDR');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { isLoading, error, data, fetchAnalytics } = useMetaAnalytics();
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const canEdit = !isShared || dashboardData?.accessType === 'edit';

  useEffect(() => {
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics(dateRange, currency);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading && !data) {
    return <LoadingScreen message="Loading analytics data..." />;
  }

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">No Account Selected</h2>
          </div>
          <p className="text-gray-600">
            Please select a Meta Ads account to view analytics data.
          </p>
        </div>
      </div>
    );
  }

  const metrics = data?.insights?.metrics || {
    spend: 0,
    revenue: 0,
    purchases: 0,
    cpc: 0,
    cpm: 0,
    ctr: 0,
    costPerPurchase: 0,
  };

  const roas =
    metrics.revenue > 0 ? (metrics.revenue / metrics.spend) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* AI Chatbot */}
      <AIChatbot
        type="analytics"
        insights={data?.insights}
        onInterestsGenerated={() => {}}
      />

      <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isShared && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Share Dashboard"
                >
                  <Share2 size={20} />
                </button>
              )}

              {canEdit && (
                <>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>

                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <Filter size={20} />
                  </button>

                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <Download size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="ml-[350px] p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ad Spend */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ad Spend</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.spend)}
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.spend > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {metrics.spend > 0 ? '+38.97%' : 'No spend recorded'}
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.revenue)}
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.revenue > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {metrics.revenue > 0 ? '+45.32%' : 'No revenue recorded'}
              </div>
            </div>

            {/* ROAS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">ROAS</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {roas.toFixed(2)}%
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  roas > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {roas > 0 ? '+12.45%' : 'No ROAS data'}
              </div>
            </div>

            {/* Purchases */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Users size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchases</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.purchases.toLocaleString()}
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.purchases > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {metrics.purchases > 0 ? '+28.67%' : 'No purchases recorded'}
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CPC */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <DollarSign size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost Per Click (CPC)</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.cpc)}
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.cpc > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                Average cost per click
              </div>
            </div>

            {/* CPM */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <DollarSign size={20} className="text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost Per Mille (CPM)</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.cpm)}
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.cpm > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                Cost per 1,000 impressions
              </div>
            </div>

            {/* CTR */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Target size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Click-Through Rate (CTR)
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {metrics.ctr.toFixed(2)}%
                  </h3>
                </div>
              </div>
              <div
                className={`text-sm ${
                  metrics.ctr > 0 ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                Percentage of clicks per impression
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Ad Spend Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue vs Ad Spend
              </h3>
              <RevenueComparisonChart data={data?.insights?.daily || []} />
            </div>

            {/* Purchase Trends */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Purchase Trends
              </h3>
              <PurchaseTrendsChart data={data?.insights?.daily || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {!isShared && (
        <ShareLinkModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          dashboardId={selectedAccount?.id || ''}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;
