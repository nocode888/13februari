import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Loader2, AlertCircle, X, Bot, Sparkles, Tag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';
import { useSearchCache } from '../hooks/useSearchCache';
import { OpenAIService } from '../services/openai';
import type { MetaAudience } from '../types/meta';

interface AudienceSearchProps {
  onSearchResults: (results: MetaAudience[]) => void;
}

export const AudienceSearch: React.FC<AudienceSearchProps> = ({
  onSearchResults
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [showAddInterest, setShowAddInterest] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { getCachedResult, setCacheResult } = useSearchCache();
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (term: string) => {
    if (!term.trim() || !isAuthenticated) return;

    setIsSearching(true);
    setError(null);

    try {
      const cacheKey = `search_${term.toLowerCase()}`;
      const cachedResults = getCachedResult(cacheKey);
      
      if (cachedResults) {
        onSearchResults(cachedResults);
        setIsSearching(false);
        return;
      }

      const metaApi = new MetaApiService(accessToken!);
      const results = await metaApi.searchPublicInterests(term);
      
      setCacheResult(cacheKey, results);
      onSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search interests');
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowAddInterest(value.length > 0);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    } else {
      onSearchResults([]); // Clear results if input is too short
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder={isAuthenticated ? "Search interests..." : "Please connect your Meta account first"}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={!isAuthenticated}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={20} className="text-blue-600 animate-spin" />
              </div>
            )}
          </div>

          {showAddInterest && (
            <button
              onClick={() => handleSearch(searchInput)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium">Search</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};