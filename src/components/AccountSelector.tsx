import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';
import type { MetaAccount } from '../types/meta';

export const AccountSelector: React.FC = () => {
  const { accessToken, selectedAccount, setSelectedAccount, setError } = useAuthStore();
  const [accounts, setAccounts] = useState<MetaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchAccounts();
    }
  }, [accessToken]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const metaApi = new MetaApiService(accessToken!);
      const adAccounts = await metaApi.getAdAccounts();
      setAccounts(adAccounts);
      
      // Auto-select if only one account
      if (adAccounts.length === 1 && !selectedAccount) {
        setSelectedAccount(adAccounts[0]);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError('Failed to load ad accounts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
        <Loader2 size={16} className="text-blue-600 animate-spin" />
        <span className="text-sm text-gray-600">Loading accounts...</span>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle size={16} className="text-red-600" />
        <span className="text-sm text-red-600">No ad accounts found</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {selectedAccount ? (
          <>
            <span className="text-sm text-gray-700">{selectedAccount.name}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </>
        ) : (
          <span className="text-sm text-gray-700">Select Account</span>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                setSelectedAccount(account);
                setShowMenu(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                selectedAccount?.id === account.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              {account.name}
            </button>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={() => window.open('https://business.facebook.com/select/', '_blank')}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};