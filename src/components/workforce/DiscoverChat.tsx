import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, ArrowLeft, Sparkles, MessageSquare, Search, ChevronDown, Star, Clock, Bookmark, Plus, Paperclip, Wand2, Image, FileText, Mic, Video, Library } from 'lucide-react';
import { OpenAIService } from '../../services/openai';
import { EditorPanel } from '../EditorPanel';

interface Prompt {
  id: string;
  category: string;
  text: string;
  isStarred?: boolean;
  lastUsed?: Date;
}

interface PromptCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompts: Prompt[];
}

export const DiscoverChat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [starredPrompts, setStarredPrompts] = useState<Set<string>>(new Set());
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const enhanceMenuRef = useRef<HTMLDivElement>(null);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
      if (enhanceMenuRef.current && !enhanceMenuRef.current.contains(event.target as Node)) {
        setShowEnhanceMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }]);

    try {
      const response = await OpenAIService.generateResponse(userMessage);
      
      // Add AI response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }]);

      // Add response to editor
      const editorTextarea = document.querySelector('.editor-panel textarea') as HTMLTextAreaElement;
      if (editorTextarea) {
        const currentContent = editorTextarea.value;
        const newContent = `AI Response:\n${response}`;
        editorTextarea.value = currentContent ? `${currentContent}\n\n${newContent}` : newContent;
        editorTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file upload
        console.log('File selected:', file);
        setShowAttachMenu(false);
      }
    };

    input.click();
  };

  const handleEnhance = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const prompt = `Enhance this message for clarity and effectiveness: "${input}"
      
      Provide the enhanced version only, no explanations.`;
      
      const enhanced = await OpenAIService.generateResponse(prompt);
      setInput(enhanced);
    } catch (error) {
      console.error('Enhancement error:', error);
    } finally {
      setIsLoading(false);
      setShowEnhanceMenu(false);
    }
  };

  const promptCategories: PromptCategory[] = [
    {
      id: 'recent',
      name: 'Recently Used',
      icon: <Clock size={16} className="text-blue-600" />,
      prompts: [
        {
          id: 'recent-1',
          category: 'recent',
          text: 'Analyze the market trends for [industry]',
          lastUsed: new Date()
        },
        {
          id: 'recent-2',
          category: 'recent',
          text: 'Generate creative ideas for [topic]',
          lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 'analysis',
      name: 'Analysis & Research',
      icon: <Search size={16} className="text-purple-600" />,
      prompts: [
        {
          id: 'analysis-1',
          category: 'analysis',
          text: 'What are the key factors driving [topic] in the current market?'
        },
        {
          id: 'analysis-2',
          category: 'analysis',
          text: 'Compare and contrast the advantages of [option1] vs [option2]'
        }
      ]
    },
    {
      id: 'creative',
      name: 'Creative Writing',
      icon: <Sparkles size={16} className="text-yellow-600" />,
      prompts: [
        {
          id: 'creative-1',
          category: 'creative',
          text: 'Brainstorm innovative solutions for [problem]'
        },
        {
          id: 'creative-2',
          category: 'creative',
          text: 'Generate unique content ideas around [theme]'
        }
      ]
    }
  ];

  const handleUsePrompt = (prompt: Prompt) => {
    setInput(prompt.text);
    setShowPromptLibrary(false);
    inputRef.current?.focus();

    // Update last used timestamp
    const updatedPrompt = { ...prompt, lastUsed: new Date() };
    const categoryIndex = promptCategories.findIndex(c => c.id === prompt.category);
    if (categoryIndex !== -1) {
      const promptIndex = promptCategories[categoryIndex].prompts.findIndex(p => p.id === prompt.id);
      if (promptIndex !== -1) {
        promptCategories[categoryIndex].prompts[promptIndex] = updatedPrompt;
      }
    }
  };

  const toggleStarPrompt = (promptId: string) => {
    setStarredPrompts(prev => {
      const newStarred = new Set(prev);
      if (newStarred.has(promptId)) {
        newStarred.delete(promptId);
      } else {
        newStarred.add(promptId);
      }
      return newStarred;
    });
  };

  const filteredPrompts = promptCategories.map(category => ({
    ...category,
    prompts: category.prompts.filter(prompt =>
      prompt.text.toLowerCase().includes(promptSearch.toLowerCase())
    )
  })).filter(category => 
    selectedCategory ? category.id === selectedCategory : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div className="h-[calc(100vh-240px)] overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              {/* Attach Button */}
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Paperclip size={20} className="text-gray-500" />
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]">
                    <button
                      type="button"
                      onClick={() => handleAttach('image')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Image size={16} className="text-blue-500" />
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttach('document')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText size={16} className="text-purple-500" />
                      Document
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttach('audio')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Mic size={16} className="text-red-500" />
                      Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAttach('video')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Video size={16} className="text-green-500" />
                      Video
                    </button>
                  </div>
                )}
              </div>

              {/* Browse Prompts Button */}
              <button
                type="button"
                onClick={() => setShowPromptLibrary(!showPromptLibrary)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Library size={20} className="text-gray-500" />
              </button>

              {/* Main Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Enhance Button */}
              <div className="relative" ref={enhanceMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}
                  className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={!input.trim()}
                >
                  <Wand2 size={20} className={input.trim() ? 'text-purple-500' : 'text-gray-400'} />
                </button>

                {showEnhanceMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
                    <h4 className="font-medium text-gray-900 mb-2">Enhance Message</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Improve your message with AI suggestions for clarity and impact.
                    </p>
                    <button
                      type="button"
                      onClick={handleEnhance}
                      disabled={isLoading || !input.trim()}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLoading || !input.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Enhancing...
                        </div>
                      ) : (
                        'Enhance Message'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  !input.trim() || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Prompt Library Modal */}
      {showPromptLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Browse Prompts</h3>
                <button
                  onClick={() => setShowPromptLibrary(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search & Categories */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {promptCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompts List */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {filteredPrompts.map(category => (
                <div key={category.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    {category.icon}
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <div className="space-y-2">
                    {category.prompts.map(prompt => (
                      <div
                        key={prompt.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="text-gray-700">{prompt.text}</p>
                          {prompt.lastUsed && (
                            <p className="text-xs text-gray-500 mt-1">
                              Last used: {prompt.lastUsed.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleStarPrompt(prompt.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              starredPrompts.has(prompt.id)
                                ? 'text-yellow-500 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Star size={16} />
                          </button>
                          <button
                            onClick={() => handleUsePrompt(prompt)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Use Prompt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Panel */}
      <EditorPanel
        isCollapsed={isEditorCollapsed}
        onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
      />
    </div>
  );
};