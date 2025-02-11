import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Bot, X, Loader2, Filter, Search, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { useMetaComments } from '../../hooks/useMetaComments';

export const CommentList: React.FC = () => {
  // Load comments from last 90 days
  const { comments, isLoading, error, hasMore, loadMore, handleComment } = useMetaComments(90);
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Comments
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter('handled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'handled'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <div key={comment.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={20} className="text-gray-600" />
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
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <ThumbsUp size={14} />
                        Positive
                      </span>
                    )}
                    {comment.sentiment === 'negative' && (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
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
                <p className="text-gray-700 mb-4">{comment.message}</p>

                {responseText[comment.id] && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Generated Response</span>
                      <button
                        onClick={() => setResponseText(prev => {
                          const newState = { ...prev };
                          delete newState[comment.id];
                          return newState;
                        })}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{responseText[comment.id]}</p>
                    <button
                      onClick={() => handleSendResponse(comment.id)}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors"
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
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
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

          {filteredComments.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try different search terms' : 'Comments will appear here'}
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </div>
                ) : (
                  'Load More Comments'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};