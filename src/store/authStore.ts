import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MetaAuthState, MetaAccount } from '../types/meta';

export const useAuthStore = create<MetaAuthState>()(
  persist(
    (set) => ({
      accessToken: 'EAAWrZB71ZBz5kBO4l2M1iT4rv4Uot5neZA1UmkUKZBDcDMLNuiZAZC1n1NCUqJtim6ZBB9ZBPzwZBS3CSaRP2Hb3QPYRAui3OmMeiDFsmNzl2DlfdVznZCLR0CzBXHbLZAhoywCFOnxCqBgG7IaCZCbnOSrFPxjAIGU7ZBjSSD0Qw6zeJJCrnN7mkJkJLZCAKQfAdepY6znviNRhtZCOcZClAE0M',
      isAuthenticated: true,
      selectedAccount: null,
      isInitializing: true,
      error: null,
      login: (token: string) => set({ 
        accessToken: token, 
        isAuthenticated: true,
        error: null
      }),
      logout: () => set({ 
        accessToken: null, 
        isAuthenticated: false,
        selectedAccount: null,
        error: null
      }),
      setSelectedAccount: (account: MetaAccount | null) => set({
        selectedAccount: account
      }),
      setError: (error: string | null) => set({
        error
      }),
      setInitializing: (isInitializing: boolean) => set({
        isInitializing
      })
    }),
    {
      name: 'auth-storage',
      skipHydration: true
    }
  )
);

export const initializeAuthStore = async () => {
  const store = useAuthStore.getState();
  store.setInitializing(true);

  try {
    // Validate token
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${store.accessToken}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Invalid token');
    }
  } catch (err) {
    console.error('Failed to initialize auth store:', err);
    localStorage.removeItem('auth-storage');
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      selectedAccount: null,
      error: 'Session expired. Please login again.',
      isInitializing: false
    });
  } finally {
    store.setInitializing(false);
  }
};