import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BarChart, TrendingUp, Target, DollarSign, Users, Calendar, Filter, Download, Settings, Layers, Grid, Map, Activity, PieChart, ChevronUp, ChevronDown, RefreshCw, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { CampaignTable } from './analytics/CampaignTable';
import { CreativePerformance } from './analytics/CreativePerformance';
import { BudgetAllocation } from './analytics/BudgetAllocation';
import { ConversionFunnel } from './analytics/ConversionFunnel';
import { ROIAnalysis } from './analytics/ROIAnalysis';
import { MetricsComparison } from './analytics/MetricsComparison';
import { useAuthStore } from '../store/authStore';
import { useMetaAds } from '../hooks/useMetaAds';
import { DateRangePicker } from './analytics/DateRangePicker';

export const AdsVisualManager: React.FC = () => {
  const { selectedAccount } = useAuthStore();
  const { isLoading, error, data, refetch } = useMetaAds();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'campaigns' | 'performance' | 'budget'>('campaigns');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">No Account Selected</h2>
          </div>
          <p className="text-gray-600">
            Please select a Meta Ads account to view the visual manager.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading ads data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visual Manager</h1>
            <p className="text-gray-600">Manage and analyze your advertising campaigns</p>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangePicker onChange={setDateRange} />
            
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw size={20} />
            </button>
            
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <Filter size={20} />
            </button>
            
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* View Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'campaigns'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Layers size={16} />
              Campaigns
            </button>
            <button
              onClick={() => setActiveView('performance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'performance'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Activity size={16} />
              Performance
            </button>
            <button
              onClick={() => setActiveView('budget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'budget'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <DollarSign size={16} />
              Budget
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeView === 'campaigns' && (
            <>
              <CampaignTable campaigns={data?.campaigns || []} />
              <CreativePerformance creatives={data?.creatives || []} />
            </>
          )}

          {activeView === 'performance' && (
            <>
              <MetricsComparison />
              <ConversionFunnel />
            </>
          )}

          {activeView === 'budget' && (
            <>
              <BudgetAllocation />
              <ROIAnalysis />
            </>
          )}
        </div>
      </div>
    </div>
  );
};