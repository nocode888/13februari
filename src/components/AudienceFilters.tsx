import React, { useState } from 'react';
import { Filter, X, ChevronDown, Users, Calendar, DollarSign, Bot, Sparkles, ChevronLeft } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { InterestAnalysis } from './InterestAnalysis';

interface AudienceFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
}

export const AudienceFilters: React.FC<AudienceFiltersProps> = ({ onFiltersChange }) => {
  const { selectedInterests, activeFilters, setActiveFilters } = useAnalysisStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [key]: value
    };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Only show if there are selected interests
  if (selectedInterests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Interest Analysis & Filters</h2>
              <p className="text-sm text-gray-600">
                {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft
              size={20}
              className={`text-gray-400 transition-transform duration-200 ${
                isExpanded ? '-rotate-90' : 'rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ${
        isExpanded ? 'max-h-[2000px]' : 'max-h-0'
      } overflow-hidden`}>
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <h3 className="font-medium text-gray-800">Campaign Settings</h3>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="13"
                  max="65"
                  value={activeFilters.age_min}
                  onChange={(e) => handleFilterChange('age_min', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="13"
                  max="65"
                  value={activeFilters.age_max}
                  onChange={(e) => handleFilterChange('age_max', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={activeFilters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget (USD)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={activeFilters.budget}
                  onChange={(e) => handleFilterChange('budget', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Campaign Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Objective
              </label>
              <select
                value={activeFilters.objective}
                onChange={(e) => handleFilterChange('objective', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CONVERSIONS">Conversions</option>
                <option value="TRAFFIC">Traffic</option>
                <option value="AWARENESS">Awareness</option>
                <option value="ENGAGEMENT">Engagement</option>
                <option value="LEADS">Lead Generation</option>
              </select>
            </div>
          </div>

          {/* Interest Analysis */}
          <div className="border-t border-gray-200 pt-6">
            <InterestAnalysis selectedInterests={selectedInterests} />
          </div>
        </div>
      </div>
    </div>
  );
};