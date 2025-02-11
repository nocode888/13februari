import React, { useState, useEffect } from 'react';
import { Bot, Send, Loader2, X, Reply, MessageSquare, ChevronLeft, ChevronRight, Users as UsersIcon, Target, TrendingUp, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';
import { OpenAIService } from '../services/openai';
import { useAIChatStore } from '../store/aiChatStore';
import { useAnalysisStore } from '../store/analysisStore';
import { AnalysisService } from '../services/analysisService';
import type { MetaAudience } from '../types/meta';

interface InterestAnalysisProps {
  selectedInterests: MetaAudience[];
}

export const InterestAnalysis: React.FC<InterestAnalysisProps> = ({
  selectedInterests
}) => {
  const { activeFilters, setSelectedInterests } = useAnalysisStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exploreResults, setExploreResults] = useState<string | null>(null);
  const [isExploreExpanded, setIsExploreExpanded] = useState(true);
  const addMessage = useAIChatStore(state => state.addMessage);

  useEffect(() => {
    setSelectedInterests(selectedInterests);
  }, [selectedInterests, setSelectedInterests]);

  const metrics = AnalysisService.calculateAudienceMetrics(selectedInterests, activeFilters);
  const recommendations = AnalysisService.getRecommendations(metrics);
  const effectivenessLabel = AnalysisService.getEffectivenessLabel(metrics.effectiveness);

  const handleAskAIAnalysis = async () => {
    if (isAnalyzing || selectedInterests.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const interestNames = selectedInterests.map(i => i.name).join(', ');
      const prompt = `Please analyze these Meta Ads targeting interests: ${interestNames}

Key metrics:
- Total audience size: ${metrics.totalReach.toLocaleString()}
- Estimated overlap: ${metrics.overlap.toLocaleString()}
- Number of interests: ${selectedInterests.length}

Please provide a comprehensive analysis including:
1. How these interests work together
2. Potential audience characteristics
3. Targeting recommendations
4. Budget optimization suggestions
5. Creative strategy tips

Focus on practical, actionable insights that can improve campaign performance.`;
      
      addMessage({ 
        role: 'user', 
        content: `Please analyze these interests: ${interestNames}`
      });
      
      const response = await OpenAIService.generateResponse(prompt);
      addMessage({ role: 'assistant', content: response });

      // Add response to editor
      const editorTextarea = document.querySelector('.editor-panel textarea') as HTMLTextAreaElement;
      if (editorTextarea) {
        const currentContent = editorTextarea.value;
        const newContent = `AI Analysis:\n\n${response}`;
        editorTextarea.value = currentContent ? `${currentContent}\n\n${newContent}` : newContent;
        // Trigger change event
        editorTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to generate analysis. Please check your OpenAI API key configuration and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExploreWithAI = async () => {
    setIsExploring(true);
    setExploreResults(null);
    setError(null);
    setIsExploreExpanded(true);

    try {
      const interestNames = selectedInterests.map(i => i.name).join(', ');
      const results = await OpenAIService.exploreInterest(interestNames);
      setExploreResults(results);
    } catch (err) {
      console.error('Error exploring interests:', err);
      setError('Failed to explore interests. Please try again.');
    } finally {
      setIsExploring(false);
    }
  };

  const handleItemClick = (value: string) => {
    const searchInput = document.querySelector('input[placeholder*="Search interests"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      const enterEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true
      });
      searchInput.dispatchEvent(enterEvent);
    }
  };

  if (selectedInterests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Interest Analysis</h3>
              <ChevronLeft
                size={20}
                className={`text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : '-rotate-90'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* Ask AI Analysis Button */}
            <button
              onClick={handleAskAIAnalysis}
              disabled={isAnalyzing || selectedInterests.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isAnalyzing || selectedInterests.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Bot size={18} />
                  <span>Ask AI Analysis</span>
                </>
              )}
            </button>

            {/* Explore with AI Button */}
            <button
              onClick={handleExploreWithAI}
              disabled={isExploring || selectedInterests.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isExploring || selectedInterests.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExploring ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Exploring...</span>
                </>
              ) : (
                <>
                  <MessageSquare size={18} />
                  <span>Explore with AI</span>
                </>
              )}
            </button>

            <span className="text-sm text-gray-500">
              {selectedInterests.length} interests selected
            </span>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <X size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[2000px]' : 'max-h-0'
      }`}>
        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <UsersIcon size={20} />
                <h4 className="font-medium">Total Reach</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {metrics.totalReach.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">Monthly active users</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Target size={20} />
                <h4 className="font-medium">Overlap</h4>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {metrics.overlap.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600 mt-1">Shared audience</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp size={20} />
                <h4 className="font-medium">Effectiveness</h4>
              </div>
              <p className="text-2xl font-bold text-green-700">{effectivenessLabel}</p>
              <p className="text-sm text-green-600 mt-1">Score: {metrics.effectiveness}/100</p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="flex gap-3">
                <Lightbulb className="text-yellow-600 flex-shrink-0" size={24} />
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <p key={index} className="text-sm text-yellow-800">• {rec}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Exploration Results */}
          {exploreResults && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100 overflow-hidden">
              <div className="p-4 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-blue-600" />
                  <h4 className="font-medium text-gray-900">AI-Powered Insights</h4>
                </div>
                <button
                  onClick={() => setIsExploreExpanded(!isExploreExpanded)}
                  className="p-1 hover:bg-blue-100/50 rounded-lg transition-colors"
                >
                  {isExploreExpanded ? (
                    <ChevronUp size={20} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={20} className="text-blue-600" />
                  )}
                </button>
              </div>
              <div className={`transition-all duration-300 ${
                isExploreExpanded 
                  ? 'max-h-[1000px] opacity-100' 
                  : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="p-6">
                  <div className="space-y-4">
                    {exploreResults.split('\n\n').map((section, index) => {
                      const [title, ...items] = section.split('\n');
                      return (
                        <div key={index}>
                          <h5 className="font-medium text-gray-900 mb-2">{title}</h5>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item, itemIndex) => {
                              const match = item.match(/\[(.*?)\]/);
                              if (!match) return null;
                              return (
                                <button
                                  key={itemIndex}
                                  onClick={() => handleItemClick(match[1])}
                                  className="px-3 py-1.5 bg-white/50 text-gray-700 rounded-full text-sm hover:bg-white transition-colors"
                                >
                                  {match[1]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};