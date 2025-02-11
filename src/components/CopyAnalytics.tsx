import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb, Target, TrendingUp, MessageSquare, Scale } from 'lucide-react';
import type { CopyAnalysis } from '../services/copywritingAnalyzer';
import { CopywritingAnalyzer } from '../services/copywritingAnalyzer';

interface CopyAnalyticsProps {
  analysis: CopyAnalysis;
  onClose: () => void;
  showABTestingInsights?: boolean;
}

export const CopyAnalytics: React.FC<CopyAnalyticsProps> = ({ 
  analysis, 
  onClose,
  showABTestingInsights = false
}) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>('persuasiveness');

  const renderScoreBar = (score: number) => (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div 
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
  );

  const renderSection = (
    title: string,
    score: number,
    feedback: string[],
    icon: React.ReactNode
  ) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === title.toLowerCase() ? null : title.toLowerCase())}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-500">Score: {score}/100</div>
          </div>
        </div>
        {expandedSection === title.toLowerCase() ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${
        expandedSection === title.toLowerCase() ? 'max-h-[500px]' : 'max-h-0'
      }`}>
        <div className="p-4 bg-gray-50 space-y-3">
          {feedback.map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-600 mt-1">•</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Copy Analysis</h3>
                <p className="text-sm text-gray-500">Detailed feedback and suggestions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <AlertCircle size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Overall Score</h4>
                <p className="text-sm text-gray-600">Based on persuasiveness, engagement, and relevance</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                CopywritingAnalyzer.getScoreColor(analysis.score)
              }`}>
                {CopywritingAnalyzer.getScoreLabel(analysis.score)}
              </div>
            </div>
            {renderScoreBar(analysis.score)}
          </div>

          {/* A/B Testing Insights */}
          {showABTestingInsights && analysis.abTestingInsights && (
            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Scale size={20} className="text-purple-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">A/B Testing Insights</h4>
                  <p className="text-sm text-gray-600">
                    Confidence Score: {analysis.abTestingInsights.confidenceScore}%
                  </p>
                </div>
              </div>

              {analysis.abTestingInsights.winner && (
                <div className="bg-white/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-700">
                    Predicted Winner: Variation {analysis.abTestingInsights.winner}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {analysis.abTestingInsights.recommendations.map((rec, index) => (
                  <p key={index} className="text-sm text-purple-800">• {rec}</p>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          <div className="space-y-4">
            {renderSection(
              'Persuasiveness',
              analysis.feedback.persuasiveness.score,
              analysis.feedback.persuasiveness.feedback,
              <MessageSquare size={20} className="text-blue-600" />
            )}

            {renderSection(
              'Engagement',
              analysis.feedback.engagement.score,
              analysis.feedback.engagement.feedback,
              <TrendingUp size={20} className="text-blue-600" />
            )}

            {renderSection(
              'Relevance',
              analysis.feedback.relevance.score,
              analysis.feedback.relevance.feedback,
              <Target size={20} className="text-blue-600" />
            )}
          </div>

          {/* Suggestions */}
          <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Suggestions for Improvement</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <p key={index} className="text-sm text-yellow-800">• {suggestion}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};