import React, { useState } from 'react';
import { Bot, Settings, Play, Pause, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdsCopilot: React.FC = () => {
  const { selectedAccount } = useAuthStore();
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [automationRules, setAutomationRules] = useState({
    budgetOptimization: true,
    bidAdjustment: true,
    audienceExpansion: false,
    scheduleOptimization: true
  });

  const handleToggleAutomation = () => {
    setIsAutomationEnabled(!isAutomationEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meta Ads Automation</h1>
              <p className="text-gray-600">AI-powered campaign optimization and management</p>
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Automation Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Automation Status</h2>
              <button
                onClick={handleToggleAutomation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAutomationEnabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isAutomationEnabled ? (
                  <>
                    <Pause size={16} />
                    Stop Automation
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Automation
                  </>
                )}
              </button>
            </div>
            <div className={`flex items-center gap-2 text-sm ${
              isAutomationEnabled ? 'text-green-600' : 'text-gray-500'
            }`}>
              <RefreshCw size={16} className={isAutomationEnabled ? 'animate-spin' : ''} />
              {isAutomationEnabled ? 'Actively optimizing campaigns' : 'Automation is paused'}
            </div>
          </div>

          {/* Rule Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Rules</h2>
            <div className="space-y-3">
              {Object.entries(automationRules).map(([rule, enabled]) => (
                <div key={rule} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {rule.split(/(?=[A-Z])/).join(' ')}
                  </span>
                  <button
                    onClick={() => setAutomationRules(prev => ({
                      ...prev,
                      [rule]: !prev[rule as keyof typeof automationRules]
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Impact</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Cost Reduction</span>
                  <span className="text-sm font-medium text-green-600">-15.3%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full w-[15.3%] bg-green-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">CTR Improvement</span>
                  <span className="text-sm font-medium text-blue-600">+23.8%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div className="h-full w-[23.8%] bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};