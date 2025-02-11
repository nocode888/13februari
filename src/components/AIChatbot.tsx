import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, Reply, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { OpenAIService } from '../services/openai';
import { useAIChatStore } from '../store/aiChatStore';
import { EditorPanel } from './EditorPanel';

interface AIChatbotProps {
  onInterestsGenerated: (interests: string[]) => void;
  type: 'audience' | 'analytics';
  insights?: any;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ 
  onInterestsGenerated, 
  type,
  insights 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);

  const messages = useAIChatStore(state => 
    type === 'audience' ? state.audienceMessages : state.analyticsMessages
  );
  const addMessage = useAIChatStore(state => 
    type === 'audience' ? state.addAudienceMessage : state.addAnalyticsMessage
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  // Simulated typing effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullResponse.length) {
          setTypingText(fullResponse.slice(0, currentIndex));
          currentIndex++;
          scrollToBottom();
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          addMessage({ 
            role: 'assistant', 
            content: fullResponse,
            replyTo: replyingTo || undefined
          });
          setTypingText('');
          setFullResponse('');

          // Add response to editor
          const editorTextarea = document.querySelector('.editor-panel textarea') as HTMLTextAreaElement;
          if (editorTextarea) {
            const currentContent = editorTextarea.value;
            const newContent = `AI Response:\n${fullResponse}`;
            editorTextarea.value = currentContent ? `${currentContent}\n\n${newContent}` : newContent;
            // Trigger change event
            editorTextarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [isTyping, fullResponse, addMessage, replyingTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setError(null);
    setIsLoading(true);
    setIsTyping(true);
    setTypingText('');
    setFullResponse('');

    try {
      // Get context from the message being replied to
      let context: string | undefined;
      if (replyingTo) {
        const replyMessage = messages.find(m => m.id === replyingTo);
        if (replyMessage) {
          context = replyMessage.content;
        }
      }

      addMessage({ 
        role: 'user', 
        content: userMessage,
        replyTo: replyingTo || undefined
      });

      let prompt = userMessage;

      // Add analytics context if in analytics mode
      if (type === 'analytics' && insights) {
        prompt = `Current Analytics Data:
- CTR: ${insights?.metrics?.ctr?.toFixed(2)}%
- CPC: $${insights?.metrics?.cpc?.toFixed(2)}
- CPM: $${insights?.metrics?.cpm?.toFixed(2)}
- Total Spend: $${insights?.metrics?.spend?.toFixed(2)}
- Total Impressions: ${insights?.metrics?.impressions?.toLocaleString()}
- Total Clicks: ${insights?.metrics?.clicks?.toLocaleString()}

Question: ${userMessage}

Please analyze this data and provide insights based on the question.`;
      }

      const response = await OpenAIService.generateResponse(prompt, context);
      setFullResponse(response);
      
      // Extract interests from response if in audience mode
      if (type === 'audience') {
        const interests = response.match(/\[(.*?)\]/g)?.map(i => i.slice(1, -1)) || [];
        if (interests.length > 0) {
          onInterestsGenerated(interests);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      console.error('AI Chat error:', err);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
      setReplyingTo(null);
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    inputRef.current?.focus();
  };

  const formatMessageContent = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      const [title, ...items] = section.split('\n');
      
      if (items.length === 0) {
        return <p key={index} className="whitespace-pre-line">{section}</p>;
      }
      
      return (
        <div key={index} className="mb-4">
          <h4 className="font-medium text-inherit mb-2">{title}</h4>
          <ul className="list-disc list-inside space-y-1">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm">
                {item.trim().startsWith('•') ? item.slice(1).trim() : item.trim()}
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  const getExamplePrompts = () => {
    if (type === 'audience') {
      return [
        {
          type: 'general',
          prompts: [
            "What's the difference between CPM and CPC bidding?",
            "How do I improve my ad relevance score?",
            "What are the best practices for ad creative?"
          ]
        },
        {
          type: 'audience',
          prompts: [
            "Who should I target for a luxury fashion brand?",
            "What interests work best for fitness products?",
            "How to find lookalike audiences?"
          ]
        },
        {
          type: 'analysis',
          prompts: [
            "Analyze my current audience targeting",
            "What's the best strategy for e-commerce?",
            "How can I optimize my campaign performance?"
          ]
        }
      ];
    }

    return [
      {
        type: 'performance',
        prompts: [
          "What's causing the CTR fluctuations?",
          "How can we improve our CPC?",
          "Analyze our conversion trends"
        ]
      },
      {
        type: 'budget',
        prompts: [
          "Is our budget allocation optimal?",
          "Where should we increase spending?",
          "ROI analysis by campaign"
        ]
      },
      {
        type: 'insights',
        prompts: [
          "What are the key insights from our data?",
          "Identify growth opportunities",
          "Compare performance across platforms"
        ]
      }
    ];
  };

  return (
    <>
      <div className={`fixed top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
        isSidebarCollapsed ? 'w-[60px]' : 'w-[350px]'
      }`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-50"
          aria-label={isSidebarCollapsed ? "Expand AI chat" : "Collapse AI chat"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} className="text-gray-600" />
          ) : (
            <ChevronLeft size={18} className="text-gray-600" />
          )}
        </button>

        {/* Expanded State */}
        <div className={`h-full flex flex-col transition-opacity duration-300 ${
          isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}>
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Bot size={20} />
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                {type === 'audience' ? 'Audience Assistant' : 'Analytics Assistant'}
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              {type === 'audience' 
                ? 'Ask me about audience targeting, interests, and optimization strategies.'
                : 'Ask me about your analytics data, performance metrics, or campaign insights.'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-6">
                {getExamplePrompts().map((category, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-600" />
                      {category.type.charAt(0).toUpperCase() + category.type.slice(1)} Questions
                    </h4>
                    <div className="grid gap-2">
                      {category.prompts.map((prompt, promptIndex) => (
                        <button
                          key={promptIndex}
                          onClick={() => {
                            setMessage(prompt);
                            inputRef.current?.focus();
                          }}
                          className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 relative group ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.replyTo && (
                      <div className="text-xs text-gray-500 mb-2">
                        Replying to: {messages.find(m => m.id === msg.replyTo)?.content.slice(0, 50)}...
                      </div>
                    )}
                    {formatMessageContent(msg.content)}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleReply(msg.id)}
                        className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-50"
                      >
                        <Reply size={14} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {isTyping && typingText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-gray-100 text-gray-800 rounded-2xl p-3">
                  {formatMessageContent(typingText)}
                  <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse" />
                </div>
              </div>
            )}
            {isTyping && !typingText && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <X size={16} />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={replyingTo !== null ? "Type your reply..." : type === 'audience' ? "Ask about audience targeting..." : "Ask about analytics..."}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  disabled={isLoading}
                />
                {replyingTo !== null && (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  isLoading || !message.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Editor Panel */}
      <EditorPanel 
        isCollapsed={isEditorCollapsed}
        onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
      />
    </>
  );
};