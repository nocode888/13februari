import React, { useEffect, useState, useRef } from 'react';
import { LogIn, LogOut, Plus, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const LoginButton: React.FC = () => {
  const { login, logout, isAuthenticated, setSelectedAccount, selectedAccount } = useAuthStore();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('initializing');
  const [jssdkError, setJssdkError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicks outside of the account menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadFacebookSDK = () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          window.FB.init({
            appId: '1596472587898777',
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          
          window.FB.getLoginStatus((response: any) => {
            setStatus(response.status);
            setJssdkError(false);
            
            if (response.status === 'connected') {
              login(response.authResponse.accessToken);
              fetchAdAccounts(response.authResponse.accessToken);
            }
          });
          
          setIsSDKLoaded(true);
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error during SDK initialization:', err);
        setJssdkError(true);
      }
    };

    loadFacebookSDK();
  }, [login]);

  const fetchAdAccounts = async (token: string) => {
    setIsLoadingAccounts(true);
    setError(null);
    try {
      const metaApi = new MetaApiService(token);
      
      // Call the Graph API to get ad accounts
      const response = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?fields=name,id,currency,timezone_name&access_token=${token}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.data || data.data.length === 0) {
        setError('No ad accounts found. Please ensure you have access to Meta Ads accounts and try again.');
        return;
      }

      const adAccounts = data.data.map((account: any) => ({
        id: account.id.replace('act_', ''),
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name
      }));

      setAccounts(adAccounts);
      
      // If there's only one account, select it automatically
      if (adAccounts.length === 1) {
        setSelectedAccount(adAccounts[0]);
      }
    } catch (err) {
      console.error('Failed to fetch ad accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ad accounts. Please check your permissions and try again.');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleLogin = () => {
    if (jssdkError) {
      return;
    }

    setError(null);
    
    if (!isSDKLoaded) {
      setError('Facebook SDK is still loading. Please try again in a moment.');
      return;
    }

    try {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            login(response.authResponse.accessToken);
            setStatus('connected');
            fetchAdAccounts(response.authResponse.accessToken);
          } else {
            setError('Login was cancelled or failed. Please try again.');
            setStatus('not_authorized');
          }
        },
        { 
          scope: 'public_profile,email,ads_management,ads_read,business_management,read_insights',
          return_scopes: true
        }
      );
    } catch (err) {
      console.error('Facebook login error:', err);
      setError('Failed to initialize login. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // First clear our local auth state
      logout();
      setStatus('unknown');
      setSelectedAccount(null);
      setAccounts([]);
      setShowAccountMenu(false);
      
      // Then try to logout of Facebook if SDK is loaded
      if (window.FB && isSDKLoaded) {
        window.FB.getLoginStatus((response: any) => {
          if (response.status === 'connected') {
            window.FB.logout(() => {
              console.log('Facebook logout successful');
            });
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAddAccount = () => {
    window.open('https://business.facebook.com/select/', '_blank');
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        disabled={jssdkError || !isSDKLoaded}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          jssdkError || !isSDKLoaded
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <LogIn size={18} />
        Connect to Meta
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Account Selector */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isLoadingAccounts ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-600">Loading accounts...</span>
            </div>
          ) : selectedAccount ? (
            <>
              <span className="text-sm text-gray-700">{selectedAccount.name}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${
                showAccountMenu ? 'rotate-180' : ''
              }`} />
            </>
          ) : (
            <span className="text-sm text-gray-700">Select Account</span>
          )}
        </button>

        {showAccountMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {isLoadingAccounts ? (
              <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading accounts...
              </div>
            ) : accounts.length > 0 ? (
              <>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowAccountMenu(false);
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
                    onClick={handleAddAccount}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add New Account
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No accounts found
                <button
                  onClick={handleAddAccount}
                  className="mt-2 w-full text-left text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 px-2 py-1 rounded"
                >
                  <Plus size={16} />
                  Add New Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isLoggingOut
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        <LogOut size={18} />
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
};