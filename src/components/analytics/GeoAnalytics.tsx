import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { MetaApiService } from '../../services/metaApi';
import { SpendAnalysis } from './geo/SpendAnalysis';
import { TrendingCities } from './geo/TrendingCities';
import { DemographicBreakdown } from './geo/DemographicBreakdown';
import { PlacementDistribution } from './geo/PlacementDistribution';
import { Loader2, AlertCircle } from 'lucide-react';

export const GeoAnalytics: React.FC = () => {
  const { accessToken, selectedAccount } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchGeoData = async () => {
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

        const geoData = await metaApi.getGeoInsights(dateRange);
        setData(geoData);
      } catch (err) {
        console.error('Failed to fetch geo data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch geographic data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoData();
  }, [accessToken, selectedAccount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading geographic data...</p>
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
        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendAnalysis data={data?.spend} />
          <TrendingCities data={data?.cities} />
        </div>

        {/* Placement Distribution */}
        <PlacementDistribution data={{
          placements: [
            { name: 'Feed', value: 45, spend: 1500000, impressions: 50000, clicks: 2500, ctr: 5 },
            { name: 'Stories', value: 30, spend: 1000000, impressions: 35000, clicks: 1500, ctr: 4.3 },
            { name: 'Reels', value: 15, spend: 500000, impressions: 20000, clicks: 800, ctr: 4 },
            { name: 'Search', value: 10, spend: 300000, impressions: 15000, clicks: 450, ctr: 3 }
          ],
          channels: [
            { name: 'Instagram', value: 40, spend: 1200000, impressions: 45000, clicks: 2200, ctr: 4.9 },
            { name: 'Facebook', value: 35, spend: 1100000, impressions: 40000, clicks: 1800, ctr: 4.5 },
            { name: 'Messenger', value: 15, spend: 500000, impressions: 20000, clicks: 700, ctr: 3.5 },
            { name: 'Audience Network', value: 10, spend: 300000, impressions: 15000, clicks: 400, ctr: 2.7 }
          ]
        }} />

        {/* Demographics */}
        <DemographicBreakdown data={data?.demographics} />
      </div>
    </div>
  );
};