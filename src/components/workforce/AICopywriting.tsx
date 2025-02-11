import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Sparkles, Send, Loader2, Bot, AlertCircle, Info } from 'lucide-react';
import { OpenAIService } from '../../services/openai';
import { CopywritingAnalyzer } from '../../services/copywritingAnalyzer';
import { CopyAnalytics } from '../CopyAnalytics';
import { EditorPanel } from '../EditorPanel';

interface AdCopy {
  headline: string;
  subheadline: string;
  description: string;
  cta: string;
}

interface AICopywritingProps {
  onBack: () => void;
}

export const AICopywriting: React.FC<AICopywritingProps> = ({ onBack }) => {
  const [copy, setCopy] = useState<AdCopy>({
    headline: '',
    subheadline: '',
    description: '',
    cta: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [objective, setObjective] = useState('CONVERSIONS');
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  const characterLimits = {
    headline: 40,
    subheadline: 30,
    description: 125,
    cta: 20
  };

  const handleGenerate = async () => {
    if (!businessDescription.trim()) {
      setError('Please enter a business description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Create compelling Meta Ads copy components for:

Business: ${businessDescription}
Target Audience: ${targetAudience}
Objective: ${objective}

Requirements:
1. Headline (max ${characterLimits.headline} chars): Attention-grabbing, clear value proposition
2. Subheadline (max ${characterLimits.subheadline} chars): Supporting message
3. Description (max ${characterLimits.description} chars): Engaging details and benefits
4. Call-to-Action (max ${characterLimits.cta} chars): Action-oriented button text

Format the response exactly as:
Headline:
[headline text]

Subheadline:
[subheadline text]

Description:
[description text]

CTA:
[cta text]`;

      const response = await OpenAIService.generateResponse(prompt);
      
      // Parse the response
      const sections = response.split('\n\n');
      const newCopy: AdCopy = {
        headline: '',
        subheadline: '',
        description: '',
        cta: ''
      };

      sections.forEach(section => {
        const [label, content] = section.split(':\n');
        if (content) {
          const key = label.toLowerCase() as keyof AdCopy;
          newCopy[key] = content.trim();
        }
      });

      setCopy(newCopy);

      // Add to editor
      const editorContent = `Generated Copy:

Headline:
${newCopy.headline}

Subheadline:
${newCopy.subheadline}

Description:
${newCopy.description}

CTA:
${newCopy.cta}`;

      // Find editor textarea and update its value
      const editorTextarea = document.querySelector('.editor-panel textarea') as HTMLTextAreaElement;
      if (editorTextarea) {
        const currentContent = editorTextarea.value;
        editorTextarea.value = currentContent ? `${currentContent}\n\n${editorContent}` : editorContent;
        // Trigger change event
        editorTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate copy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!copy.headline || !copy.description) {
      setError('Please generate or enter copy first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const fullCopy = `${copy.headline}\n${copy.subheadline}\n${copy.description}\n${copy.cta}`;
      const result = await CopywritingAnalyzer.analyzeCopy(fullCopy, {
        businessDescription,
        targetAudience,
        objective
      });
      setAnalysis(result);

      // Add analysis to editor
      const editorContent = `Analysis Results:

Overall Score: ${result.score}/100
Rating: ${CopywritingAnalyzer.getScoreLabel(result.score)}

Persuasiveness (${result.feedback.persuasiveness.score}/100):
${result.feedback.persuasiveness.feedback.map(f => `• ${f}`).join('\n')}

Engagement (${result.feedback.engagement.score}/100):
${result.feedback.engagement.feedback.map(f => `• ${f}`).join('\n')}

Relevance (${result.feedback.relevance.score}/100):
${result.feedback.relevance.feedback.map(f => `• ${f}`).join('\n')}

Suggestions:
${result.suggestions.map(s => `• ${s}`).join('\n')}`;

      // Find editor textarea and update its value
      const editorTextarea = document.querySelector('.editor-panel textarea') as HTMLTextAreaElement;
      if (editorTextarea) {
        const currentContent = editorTextarea.value;
        editorTextarea.value = currentContent ? `${currentContent}\n\n${editorContent}` : editorContent;
        // Trigger change event
        editorTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze copy. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (field: keyof AdCopy, value: string) => {
    if (value.length <= characterLimits[field]) {
      setCopy(prev => ({ ...prev, [field]: value }));
    }
  };

  const getCharacterCount = (field: keyof AdCopy) => {
    return `${copy[field].length}/${characterLimits[field]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Meta Ads Copywriting</h1>
                  <p className="text-sm text-gray-600">Create optimized ad copy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-4xl mx-auto px-6 py-6 transition-all duration-300 ${
        isEditorCollapsed ? 'mr-[60px]' : 'mr-[400px]'
      }`}>
        <div className="space-y-6">
          {/* Context Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot size={20} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Campaign Context</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="E.g., We sell premium coffee beans with 24-hour delivery service"
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="E.g., Coffee enthusiasts aged 25-45 who value quality and convenience"
                  className="w-full h-20 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Objective
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="CONVERSIONS">Conversions</option>
                  <option value="TRAFFIC">Traffic</option>
                  <option value="AWARENESS">Awareness</option>
                  <option value="ENGAGEMENT">Engagement</option>
                  <option value="LEADS">Lead Generation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Copy Editor */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ad Copy</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !businessDescription.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isGenerating || !businessDescription.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !copy.headline || !copy.description}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isAnalyzing || !copy.headline || !copy.description
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Headline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Headline
                      <Info size={14} className="text-gray-400" />
                    </label>
                    <span className={`text-xs ${
                      copy.headline.length >= characterLimits.headline
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {getCharacterCount('headline')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={copy.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="Enter attention-grabbing headline..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Subheadline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Subheadline
                      <Info size={14} className="text-gray-400" />
                    </label>
                    <span className={`text-xs ${
                      copy.subheadline.length >= characterLimits.subheadline
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {getCharacterCount('subheadline')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={copy.subheadline}
                    onChange={(e) => handleInputChange('subheadline', e.target.value)}
                    placeholder="Enter supporting message..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Description
                      <Info size={14} className="text-gray-400" />
                    </label>
                    <span className={`text-xs ${
                      copy.description.length >= characterLimits.description
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {getCharacterCount('description')}
                    </span>
                  </div>
                  <textarea
                    value={copy.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter engaging ad description..."
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* CTA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Call-to-Action
                      <Info size={14} className="text-gray-400" />
                    </label>
                    <span className={`text-xs ${
                      copy.cta.length >= characterLimits.cta
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {getCharacterCount('cta')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={copy.cta}
                    onChange={(e) => handleInputChange('cta', e.target.value)}
                    placeholder="Enter call-to-action button text..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <EditorPanel
        isCollapsed={isEditorCollapsed}
        onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
      />

      {/* Analysis Modal */}
      {analysis && (
        <CopyAnalytics
          analysis={analysis}
          onClose={() => setAnalysis(null)}
        />
      )}
    </div>
  );
};