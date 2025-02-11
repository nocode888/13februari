import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { MetaApiService } from '../../services/metaApi';
import { AwarenessFunnel } from './funnel/AwarenessFunnel';
import { ConsiderationFunnel } from './funnel/ConsiderationFunnel';
import { ConversionFunnel } from './funnel/ConversionFunnel';
import { DateRangePicker } from './DateRangePicker';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const FunnelAnalytics: React.FC = () => {
  const { accessToken, selectedAccount } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchFunnelData = async () => {
    if (!accessToken || !selectedAccount) {
      setError('Please connect your Meta account and select an ad account');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const metaApi = new MetaApiService(accessToken, selectedAccount.id);
      const funnelData = await metaApi.getFunnelInsights(dateRange);
      setData(funnelData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch funnel data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch funnel data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();

    // Set up 15-minute refresh interval
    const interval = setInterval(fetchFunnelData, 15 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [accessToken, selectedAccount, dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading funnel analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Funnel Analytics</h1>
            <p className="text-gray-600">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangePicker onChange={setDateRange} />
            <button
              onClick={fetchFunnelData}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Funnel Stages */}
        <div className="space-y-6">
          <AwarenessFunnel data={data?.awareness} />
          <ConsiderationFunnel data={data?.consideration} />
          <ConversionFunnel data={data?.conversion} />
        </div>
      </div>
    </div>
  );
};