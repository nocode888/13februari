import React, { useState } from 'react';
import { MessageSquare, Users, RefreshCw, Filter, Search, Bot, ThumbsUp, ThumbsDown, Eye, X, AlertCircle, Loader2, BarChart, Calendar } from 'lucide-react';
import { useMetaComments } from '../../hooks/useMetaComments';
import { useAuthStore } from '../../store/authStore';
import { CommentReport } from '../reports/CommentReport';

export const AICustomerService: React.FC = () => {
  const [activeView, setActiveView] = useState<'manage' | 'report'>('manage');
  const { selectedAccount } = useAuthStore();
  const { comments, isLoading, error, handleComment } = useMetaComments();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'handled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingResponse, setGeneratingResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const filteredComments = comments.filter(comment => {
    if (activeFilter !== 'all' && comment.status !== activeFilter) return false;
    if (searchTerm && !comment.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleGenerateResponse = async (commentId: string) => {
    setGeneratingResponse(commentId);
    try {
      // Simple response templates based on sentiment
      const comment = comments.find(c => c.id === commentId);
      let response = '';

      if (comment) {
        switch (comment.sentiment) {
          case 'positive':
            response = `Thank you for your positive feedback! We're glad you're enjoying our product/service. Your support means a lot to us.`;
            break;
          case 'negative':
            response = `We apologize for any inconvenience. We take your feedback seriously and would like to help resolve your concerns. Please DM us with more details.`;
            break;
          default:
            response = `Thank you for your comment. We appreciate your feedback and are here to help if you have any questions.`;
        }
      }

      setResponseText(prev => ({ ...prev, [commentId]: response }));
    } catch (error) {
      console.error('Failed to generate response:', error);
    } finally {
      setGeneratingResponse(null);
    }
  };

  const handleSendResponse = async (commentId: string) => {
    const response = responseText[commentId];
    if (!response) return;

    try {
      await handleComment(commentId, 'reply', response);
      setResponseText(prev => {
        const newState = { ...prev };
        delete newState[commentId];
        return newState;
      });
    } catch (error) {
      console.error('Failed to send response:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl text-white">
                <MessageSquare size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Comments AI Manager</h1>
                <p className="text-gray-600">Automated comment management and response system</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('manage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'manage'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={16} />
                Manage Comments
              </button>
              <button
                onClick={() => setActiveView('report')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'report'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart size={16} />
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {activeView === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <MessageSquare size={20} />
                <span className="font-medium">Total Comments</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{comments.length}</div>
              <div className="text-sm text-blue-600 mt-1">All time</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Calendar size={20} />
                <span className="font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-700">
                {comments.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600 mt-1">Require attention</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <ThumbsUp size={20} />
                <span className="font-medium">Positive</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {comments.filter(c => c.sentiment === 'positive').length}
              </div>
              <div className="text-sm text-green-600 mt-1">Positive sentiment</div>
            </div>

            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ThumbsDown size={20} />
                <span className="font-medium">Negative</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {comments.filter(c => c.sentiment === 'negative').length}
              </div>
              <div className="text-sm text-red-600 mt-1">Require attention</div>
            </div>
          </div>
        )}

        {activeView === 'manage' ? (
          <div>
            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Comments
                  </button>
                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveFilter('handled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === 'handled'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Handled
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search comments..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Filter size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <RefreshCw size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 space-y-6">
                {filteredComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{comment.from.name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.created_time).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.sentiment === 'positive' && (
                            <span className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-1 rounded-full">
                              <ThumbsUp size={14} />
                              Positive
                            </span>
                          )}
                          {comment.sentiment === 'negative' && (
                            <span className="flex items-center gap-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-full">
                              <ThumbsDown size={14} />
                              Negative
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {comment.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">{comment.message}</p>

                      {responseText[comment.id] && (
                        <div className="mb-4 bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">AI Generated Response</span>
                            <button
                              onClick={() => setResponseText(prev => {
                                const newState = { ...prev };
                                delete newState[comment.id];
                                return newState;
                              })}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-blue-600">{responseText[comment.id]}</p>
                          <button
                            onClick={() => handleSendResponse(comment.id)}
                            className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                          >
                            Send Response
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateResponse(comment.id)}
                          disabled={generatingResponse === comment.id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            generatingResponse === comment.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                          }`}
                        >
                          {generatingResponse === comment.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Bot size={14} />
                              Generate Response
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleComment(comment.id, 'hide')}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Hide Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredComments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try different search terms' : 'Comments will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <CommentReport />
        )}
      </div>
    </div>
  );
};