import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { MetaAnalyticsService } from '../services/metaAnalytics';

export function useMetaAnalytics() {
  const { accessToken, selectedAccount } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    insights: any;
    daily: any[];
  } | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchAnalytics = async (dateRange: { start: string; end: string }, currency?: string) => {
    if (!accessToken) {
      setError('Please connect your Meta account');
      setIsLoading(false);
      return;
    }

    if (!selectedAccount) {
      setError('Please select an ad account');
      setIsLoading(false);
      return;
    }

    console.log('Fetching analytics data...', { dateRange, currency });
    setIsFetching(true);
    setError(null);

    try {
      const analytics = new MetaAnalyticsService(accessToken, selectedAccount.id);
      const insights = await analytics.getAccountInsights(dateRange);
      
      console.log('Fetched insights:', insights);
      
      setData({
        insights,
        daily: insights.daily || []
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Initial fetch with default date range
  useEffect(() => {
    if (selectedAccount) {
      console.log('Selected account changed, fetching analytics...');
      fetchAnalytics({
        start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
    }
  }, [selectedAccount]);

  return {
    isLoading,
    isFetching,
    error,
    data,
    fetchAnalytics
  };
}