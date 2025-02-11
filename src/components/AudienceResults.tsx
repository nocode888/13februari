import React, { useState } from 'react';
import { Plus, Users, ChevronRight, Bot, Info, Sparkles } from 'lucide-react';
import type { MetaAudience } from '../types/meta';
import { useAnalysisStore } from '../store/analysisStore';
import { OpenAIService } from '../services/openai';

interface AudienceResultsProps {
  audiences: MetaAudience[];
  activeFilters: Record<string, string>;
}

export const AudienceResults: React.FC<AudienceResultsProps> = ({ 
  audiences,
  activeFilters
}) => {
  const { selectedInterests, setSelectedInterests } = useAnalysisStore();
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);
  const [hoveredAge, setHoveredAge] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGenderDistribution = (audience: MetaAudience) => {
    const defaultDistribution = { male: 48, female: 52 };
    const genderDemo = audience.demographics?.find(d => d.type === 'gender');
    if (!genderDemo) return defaultDistribution;

    return {
      male: Math.round(genderDemo.percentage * 100),
      female: Math.round((1 - genderDemo.percentage) * 100)
    };
  };

  const getAgeDistribution = (audience: MetaAudience) => {
    const defaultDistribution = [
      { range: '18-24', percentage: 20 },
      { range: '25-34', percentage: 30 },
      { range: '35-44', percentage: 25 },
      { range: '45-54', percentage: 15 },
      { range: '55+', percentage: 10 }
    ];

    const ageDemo = audience.demographics?.find(d => d.type === 'age');
    if (!ageDemo) return defaultDistribution;

    return defaultDistribution;
  };

  const handleAddInterest = (audience: MetaAudience) => {
    // Check if already selected
    if (selectedInterests.some(i => i.id === audience.id)) {
      // Remove if already selected
      setSelectedInterests(selectedInterests.filter(i => i.id !== audience.id));
      return;
    }

    // Add to selected interests
    setSelectedInterests([...selectedInterests, audience]);

    // Animate the button
    const button = document.querySelector(`[data-audience-id="${audience.id}"]`);
    if (button) {
      button.classList.add('animate-success');
      setTimeout(() => {
        button.classList.remove('animate-success');
      }, 500);
    }
  };

  const isInterestSelected = (audienceId: string) => {
    return selectedInterests.some(i => i.id === audienceId);
  };

  return (
    <div className="space-y-6">
      {/* Results Grid */}
      <div className="grid gap-4">
        {audiences.map((audience) => (
          <div key={audience.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  data-audience-id={audience.id}
                  onClick={() => handleAddInterest(audience)}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    isInterestSelected(audience.id)
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Plus 
                    size={20} 
                    className={`transition-transform ${isInterestSelected(audience.id) ? 'rotate-45' : ''}`} 
                  />
                </button>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{audience.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatNumber(audience.size)} monthly active users</span>
                    {audience.path && (
                      <>
                        <ChevronRight size={16} />
                        <span>{audience.path}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Gender Distribution
                    <Info 
                      size={14} 
                      className="text-gray-400 cursor-help"
                      onMouseEnter={() => setHoveredGender(audience.id)}
                      onMouseLeave={() => setHoveredGender(null)}
                    />
                  </h4>
                </div>

                {hoveredGender === audience.id && (
                  <div className="absolute -top-2 left-full ml-2 w-48 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Male</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getGenderDistribution(audience).male}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Female</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getGenderDistribution(audience).female}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${getGenderDistribution(audience).male}%` }}
                  />
                </div>
                
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Male {getGenderDistribution(audience).male}%</span>
                  <span>Female {getGenderDistribution(audience).female}%</span>
                </div>
              </div>

              {/* Age Distribution */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Age Distribution
                    <Info 
                      size={14} 
                      className="text-gray-400 cursor-help"
                      onMouseEnter={() => setHoveredAge(audience.id)}
                      onMouseLeave={() => setHoveredAge(null)}
                    />
                  </h4>
                </div>

                {hoveredAge === audience.id && (
                  <div className="absolute -top-2 left-full ml-2 w-48 p-3 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="space-y-2">
                      {getAgeDistribution(audience).map((age) => (
                        <div key={age.range} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{age.range}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {age.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex h-4 rounded-full overflow-hidden">
                  {getAgeDistribution(audience).map((age, index) => (
                    <div
                      key={age.range}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                      style={{
                        width: `${age.percentage}%`,
                        backgroundColor: `hsl(${200 + index * 30}, 70%, 60%)`
                      }}
                    />
                  ))}
                </div>

                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>18-24</span>
                  <span>25-34</span>
                  <span>35-44</span>
                  <span>45-54</span>
                  <span>55+</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};