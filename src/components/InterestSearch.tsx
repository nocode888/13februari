import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, AlertCircle, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';
import { useSearchCache } from '../hooks/useSearchCache';
import type { MetaAudience } from '../types/meta';

interface InterestSearchProps {
  onInterestSelect?: (interest: MetaAudience) => void;
}

export const InterestSearch: React.FC<InterestSearchProps> = ({
  onInterestSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MetaAudience[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { accessToken } = useAuthStore();
  const { getCachedResult, setCacheResult } = useSearchCache();
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (term: string) => {
    if (!term.trim() || term.length < 3) {
      setResults([]);
      return;
    }

    if (!accessToken) {
      setError('Please connect your Meta account to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = `search_${term.toLowerCase()}`;
      const cachedResults = getCachedResult(cacheKey);
      
      if (cachedResults) {
        setResults(cachedResults);
        setIsLoading(false);
        return;
      }

      const metaApi = new MetaApiService(accessToken);
      const searchResults = await metaApi.searchPublicInterests(term);

      setResults(searchResults);
      setCacheResult(cacheKey, searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search interests';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length >= 3) {
      searchTimeout.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    } else {
      setResults([]);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div ref={searchContainerRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search interests (e.g., 'iPhone', 'Fashion', 'Travel')..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={20} className="text-blue-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid gap-4">
        {results.map((interest) => (
          <div
            key={interest.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{interest.name}</h3>
                {interest.path && (
                  <span className="text-sm text-gray-500">
                    {interest.path}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onInterestSelect?.(interest)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  Add Interest
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Users size={16} />
                  <span className="text-sm font-medium">Audience Size</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(interest.size)}
                </p>
                <p className="text-sm text-gray-500">Estimated reach</p>
              </div>

              {interest.demographics && interest.demographics.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users size={16} />
                    <span className="text-sm font-medium">Demographics</span>
                  </div>
                  <div className="space-y-1">
                    {interest.demographics.map((demo, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {demo.type}: {(demo.percentage * 100).toFixed(1)}%
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && !error && searchTerm.length >= 3 && results.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interests found</h3>
          <p className="text-gray-600">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
};