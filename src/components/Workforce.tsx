import React, { useState } from 'react';
import { Bot, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { AICopywriting } from './workforce/AICopywriting';
import { DiscoverChat } from './workforce/DiscoverChat';

export const Workforce: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<'copywriting' | 'discover' | null>(null);

  if (selectedTool === 'copywriting') {
    return <AICopywriting onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'discover') {
    return <DiscoverChat onBack={() => setSelectedTool(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Workforce</h1>
              <p className="text-gray-600">Powerful AI tools to enhance your creative workflow</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Copywriting Assistant */}
          <button
            onClick={() => setSelectedTool('copywriting')}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Copywriting Assistant</h2>
                <p className="text-sm text-gray-600">Create compelling marketing copy</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Professional writing tools and templates</p>
              <p>• Optimized for Meta Ads</p>
              <p>• A/B testing variations</p>
              <p>• Performance analysis</p>
            </div>
          </button>

          {/* Discover Chat */}
          <button
            onClick={() => setSelectedTool('discover')}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Discover Chat</h2>
                <p className="text-sm text-gray-600">Your creative brainstorming companion</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Generate fresh ideas and perspectives</p>
              <p>• Explore writing possibilities</p>
              <p>• Get instant feedback</p>
              <p>• Develop creative solutions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};