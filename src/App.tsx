import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginButton } from './components/LoginButton';
import { AudienceSearch } from './components/AudienceSearch';
import { AudienceResults } from './components/AudienceResults';
import { AudienceFilters } from './components/AudienceFilters';
import { useAuthStore } from './store/authStore';
import { Bot, FlaskConical, MessageSquare, Search, Library, Zap, Sparkles, Settings } from 'lucide-react';
import { AIChatbot } from './components/AIChatbot';
import { DataIntelligenceCenter } from './components/DataIntelligenceCenter';
import { DashboardHome } from './components/DashboardHome';
import { EditorPanel } from './components/EditorPanel';
import { Workforce } from './components/Workforce';
import { InterestAnalysis } from './components/InterestAnalysis';
import type { MetaAudience } from './types/meta';
import { SharedAnalyticsDashboard } from './components/SharedAnalyticsDashboard';
import { AdLibrary } from './components/library/AdLibrary';
import { AdsCopilot } from './components/ai/AdsCopilot';
import { AICustomerService } from './components/ai/AICustomerService';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Shared Analytics Route - Must come before main routes */}
        <Route path="/analytics/shared/:token" element={<SharedAnalyticsDashboard />} />
        
        {/* Main App Routes */}
        <Route path="/" element={<MainApp />} />
        
        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Separate MainApp component for better organization
function MainApp() {
  const { isAuthenticated, setInitializing } = useAuthStore();
  const [audiences, setAudiences] = React.useState<MetaAudience[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'home' | 'intelligence' | 'workforce' | 'research' | 'copilot'>('home');
  const [activeResearchTab, setActiveResearchTab] = React.useState<'explorer' | 'library'>('explorer');
  const [activeCopilotTab, setActiveCopilotTab] = React.useState<'automation' | 'comments'>('automation');

  React.useEffect(() => {
    const validateAuth = async () => {
      setInitializing(true);
      try {
        const authData = localStorage.getItem('auth-storage');
        if (!authData) {
          throw new Error('No auth data found');
        }

        const { state } = JSON.parse(authData);
        if (!state?.accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch('https://graph.facebook.com/v18.0/me', {
          headers: {
            Authorization: `Bearer ${state.accessToken}`
          }
        });
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
      } catch (err) {
        console.error('Auth validation error:', err);
        localStorage.removeItem('auth-storage');
        useAuthStore.setState({
          accessToken: null,
          isAuthenticated: false,
          selectedAccount: null,
          error: 'Session expired. Please login again.',
          isInitializing: false
        });
      } finally {
        setInitializing(false);
        setIsInitialized(true);
      }
    };

    validateAuth();
  }, [setInitializing]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="p-8">
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl">
                  <Bot size={28} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                Audience Explorer
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Connect your account to explore audience insights
              </p>

              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl">
                <Bot size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600">
                  Audience Explorer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveView('home')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeView === 'home'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveView('research')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'research'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FlaskConical size={16} />
                  Research Lab
                </button>

                <button
                  onClick={() => setActiveView('intelligence')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'intelligence'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Zap size={16} />
                  Ads Intelligence
                </button>

                <button
                  onClick={() => setActiveView('copilot')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'copilot'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Bot size={16} />
                  Ads Copilot
                </button>

                <button
                  onClick={() => setActiveView('workforce')}
                  className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeView === 'workforce'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Sparkles size={16} />
                  Workforce
                </button>
              </div>
              <LoginButton />
            </div>
          </div>

          {/* Research Lab Submenu */}
          {activeView === 'research' && (
            <div className="border-t border-gray-200">
              <div className="flex items-center gap-4 h-12">
                <button
                  onClick={() => setActiveResearchTab('explorer')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeResearchTab === 'explorer'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Search size={16} />
                  Audience Explorer
                </button>
                <button
                  onClick={() => setActiveResearchTab('library')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeResearchTab === 'library'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Library size={16} />
                  Library Ads
                </button>
              </div>
            </div>
          )}

          {/* Ads Copilot Submenu */}
          {activeView === 'copilot' && (
            <div className="border-t border-gray-200">
              <div className="flex items-center gap-4 h-12">
                <button
                  onClick={() => setActiveCopilotTab('automation')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeCopilotTab === 'automation'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings size={16} />
                  Automation
                </button>
                <button
                  onClick={() => setActiveCopilotTab('comments')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeCopilotTab === 'comments'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare size={16} />
                  Comments AI
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {activeView === 'home' ? (
        <DashboardHome />
      ) : activeView === 'workforce' ? (
        <Workforce />
      ) : activeView === 'intelligence' ? (
        <DataIntelligenceCenter />
      ) : activeView === 'copilot' ? (
        activeCopilotTab === 'automation' ? (
          <AdsCopilot />
        ) : (
          <AICustomerService />
        )
      ) : activeView === 'research' ? (
        <div className="relative">
          {activeResearchTab === 'explorer' ? (
            <div className="flex">
              <AIChatbot 
                type="audience"
                onInterestsGenerated={(interests) => {
                  console.log('Generated interests:', interests);
                }}
              />

              <div className={`flex-1 transition-all duration-300 ${
                isSidebarCollapsed ? 'ml-[60px]' : 'ml-[350px]'
              } ${isEditorCollapsed ? 'mr-[60px]' : 'mr-[400px]'}`}>
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                  <div className="bg-white/80 rounded-2xl border border-gray-200/50 shadow-sm backdrop-blur-sm p-6">
                    <AudienceSearch 
                      onSearchResults={setAudiences} 
                    />
                  </div>

                  <AudienceFilters />
                  <AudienceResults audiences={audiences} />
                </div>
              </div>

              <EditorPanel
                isCollapsed={isEditorCollapsed}
                onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
              />
            </div>
          ) : (
            <AdLibrary />
          )}
        </div>
      ) : null}
    </div>
  );
}