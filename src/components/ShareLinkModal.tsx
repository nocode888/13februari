import React, { useState, useEffect } from 'react';
import { Link, Copy, Check, X, Loader2, AlertCircle } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, dashboardId }) => {
  const [copied, setCopied] = useState(false);
  const [accessType, setAccessType] = useState<'view' | 'edit'>('view');
  const [expiresIn, setExpiresIn] = useState('never');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && dashboardId) {
      generateShareLink();
    }
  }, [isOpen, dashboardId, accessType, expiresIn]);

  const generateShareLink = async () => {
    if (!dashboardId) {
      setError('Dashboard ID is required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a more robust token structure
      const tokenData = {
        id: dashboardId,
        access: accessType,
        expires: expiresIn,
        timestamp: Date.now()
      };

      // Convert to base64 with proper encoding
      const tokenString = JSON.stringify(tokenData);
      const shareToken = btoa(encodeURIComponent(tokenString));
      
      // Generate the full share URL
      const link = `${window.location.origin}/analytics/shared/${shareToken}`;
      setShareLink(link);
    } catch (err) {
      console.error('Failed to generate share link:', err);
      setError('Failed to generate share link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy link to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Link size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Share Dashboard</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Access Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAccessType('view')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  accessType === 'view'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                View Only
              </button>
              <button
                onClick={() => setAccessType('edit')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  accessType === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Can Edit
              </button>
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Expires
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="never">Never</option>
              <option value="1d">After 1 day</option>
              <option value="7d">After 7 days</option>
              <option value="30d">After 30 days</option>
            </select>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink || ''}
                readOnly
                placeholder={isGenerating ? 'Generating link...' : 'Share link will appear here'}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
              />
              <button
                onClick={handleCopy}
                disabled={!shareLink || isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  !shareLink || isGenerating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-blue-900 font-medium">About shared links</p>
                <p className="text-sm text-blue-800">
                  Anyone with this link can access your analytics dashboard based on the permissions you set.
                  You can revoke access at any time by disabling the link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};