import create from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  replyTo?: string;
  timestamp: number;
  context?: string;
}

interface AIChatState {
  audienceMessages: Message[];
  analyticsMessages: Message[];
  workforceMessages: Message[];
  addAudienceMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addAnalyticsMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  addWorkforceMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearAudienceMessages: () => void;
  clearAnalyticsMessages: () => void;
  clearWorkforceMessages: () => void;
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set) => ({
      audienceMessages: [],
      analyticsMessages: [],
      workforceMessages: [],
      addAudienceMessage: (message) => set((state) => ({ 
        audienceMessages: [...state.audienceMessages, {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }]
      })),
      addAnalyticsMessage: (message) => set((state) => ({ 
        analyticsMessages: [...state.analyticsMessages, {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }]
      })),
      addWorkforceMessage: (message) => set((state) => ({ 
        workforceMessages: [...state.workforceMessages, {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }]
      })),
      clearAudienceMessages: () => set({ audienceMessages: [] }),
      clearAnalyticsMessages: () => set({ analyticsMessages: [] }),
      clearWorkforceMessages: () => set({ workforceMessages: [] }),
    }),
    {
      name: 'ai-chat-storage',
      skipHydration: true
    }
  )
);