import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, ArrowUpDown, AlertCircle, MessageSquare, ThumbsUp, ThumbsDown, ExternalLink, Loader2 } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { useAuthStore } from '../../store/authStore';

interface CommentReportProps {
  campaignId?: string;
}

export const CommentReport: React.FC<CommentReportProps> = ({ campaignId }) => {
  const { comments, isLoading, error } = useComments();
  const [sortField, setSortField] = useState<'date' | 'sentiment'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'replied' | 'pending'>('all');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  // Filter and sort comments
  const processedComments = React.useMemo(() => {
    let filtered = [...comments];

    // Apply campaign filter if specified
    if (campaignId) {
      filtered = filtered.filter(comment => comment.adId.startsWith(campaignId));
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(comment => 
        filterStatus === 'replied' ? comment.status === 'handled' : comment.status === 'pending'
      );
    }

    // Apply sentiment filter
    if (filterSentiment !== 'all') {
      filtered = filtered.filter(comment => comment.sentiment === filterSentiment);
    }

    // Sort comments
    filtered.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.created_time).getTime();
        const dateB = new Date(b.created_time).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const sentimentOrder = { positive: 3, neutral: 2, negative: 1, spam: 0 };
        const scoreA = sentimentOrder[a.sentiment || 'neutral'];
        const scoreB = sentimentOrder[b.sentiment || 'neutral'];
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
    });

    return filtered;
  }, [comments, campaignId, filterStatus, filterSentiment, sortField, sortDirection]);

  const generateCSV = () => {
    const headers = ['Date', 'User', 'Comment', 'Sentiment', 'Status', 'URL'];
    const rows = processedComments.map(comment => [
      new Date(comment.created_time).toLocaleString(),
      comment.from.name,
      comment.message,
      comment.sentiment,
      comment.status,
      `https://facebook.com/${comment.id}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comments-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={32} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Comments Report</h2>
            <p className="text-gray-600">
              {processedComments.length} comments {campaignId ? 'for this campaign' : 'total'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="replied">Replied</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Sentiment</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <button
              onClick={generateCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Comments Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => {
                      if (sortField === 'date') {
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('date');
                        setSortDirection('desc');
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500"
                  >
                    <Calendar size={14} />
                    Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Comment</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => {
                      if (sortField === 'sentiment') {
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField('sentiment');
                        setSortDirection('desc');
                      }
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500"
                  >
                    Sentiment
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedComments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(comment.created_time).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{comment.from.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-600 line-clamp-2">{comment.message}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {comment.sentiment === 'positive' && (
                        <ThumbsUp size={14} className="text-green-600" />
                      )}
                      {comment.sentiment === 'negative' && (
                        <ThumbsDown size={14} className="text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        comment.sentiment === 'positive' ? 'text-green-600' :
                        comment.sentiment === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {comment.sentiment?.charAt(0).toUpperCase() + comment.sentiment?.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comment.status === 'handled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.status === 'handled' ? 'Replied' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`https://facebook.com/${comment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink size={14} />
                      <span className="text-sm">View</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedComments.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
            <p className="text-gray-600">
              {filterStatus !== 'all' || filterSentiment !== 'all'
                ? 'Try adjusting your filters'
                : 'Comments will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};