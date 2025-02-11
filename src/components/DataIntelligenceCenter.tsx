import React, { useState } from 'react';
import { LayoutDashboard, Database, MapPin, ActivitySquare } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import { GeoAnalytics } from './analytics/GeoAnalytics';
import { FunnelAnalytics } from './analytics/FunnelAnalytics';
import { EditorPanel } from './EditorPanel';

export const DataIntelligenceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'geo' | 'funnel'>('analytics');
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                <Database size={18} />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Data Intelligence Center</h1>
            </div>
            <div className="ml-8 flex items-center gap-4">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={16} />
                Analytics Dashboard
              </button>
              <button
                onClick={() => setActiveTab('funnel')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'funnel'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ActivitySquare size={16} />
                Funnel Analytics
              </button>
              <button
                onClick={() => setActiveTab('geo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'geo'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MapPin size={16} />
                Geographic Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`transition-all duration-300 ${
        isEditorCollapsed ? 'mr-[60px]' : 'mr-[400px]'
      }`}>
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'funnel' ? (
          <FunnelAnalytics />
        ) : (
          <GeoAnalytics />
        )}
      </div>

      {/* Editor Panel */}
      <EditorPanel
        isCollapsed={isEditorCollapsed}
        onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
      />
    </div>
  );
};