import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';

export function useMetaAds() {
  const { accessToken, selectedAccount } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    campaigns: any[];
    adSets: any[];
    ads: any[];
    creatives: any[];
  } | null>(null);

  const fetchAdsData = async () => {
    if (!accessToken || !selectedAccount) {
      setError('Please connect your Meta account and select an ad account');
      setIsLoading(false);
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

      // Fetch campaigns first
      const campaigns = await metaApi.getCampaigns(dateRange);
      
      // Then fetch ad sets for these campaigns
      const adSets = await metaApi.getAdSets(campaigns.map(c => c.id));
      
      // Then fetch ads for these ad sets
      const ads = await metaApi.getAds(adSets.map(as => as.id));
      
      // Finally fetch creatives for these ads
      const creatives = await metaApi.getCreatives(ads.map(a => a.id));

      setData({ campaigns, adSets, ads, creatives });
    } catch (err) {
      console.error('Failed to fetch ads data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ads data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data initially and when account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchAdsData();
    }
  }, [selectedAccount]);

  return {
    isLoading,
    error,
    data,
    refetch: fetchAdsData
  };
}