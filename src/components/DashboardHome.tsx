import React from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  BarChart3, 
  MousePointer, 
  Target, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  ChevronRight,
  LayoutDashboard,
  PenTool,
  HelpCircle,
  LogOut
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { selectedAccount } = useAuthStore();
  const userName = selectedAccount?.name?.split(' ')[0] || 'there';

  const quickStats = [
    {
      label: 'Active Campaigns',
      value: '5',
      icon: Target,
      trend: '+2 this week',
      color: 'blue'
    },
    {
      label: 'Recent Clicks',
      value: '1,230',
      icon: MousePointer,
      trend: '+15% vs last week',
      color: 'green'
    },
    {
      label: 'Conversions',
      value: '150',
      icon: Users,
      trend: '+8% conversion rate',
      color: 'purple'
    }
  ];

  const aiSuggestions = [
    {
      title: 'Audience Optimization',
      description: 'Target interest "Fitness Enthusiasts" for better reach',
      action: '/audience-explorer'
    },
    {
      title: 'Placement Strategy',
      description: 'Optimize placement for "Instagram Stories"',
      action: '/analytics'
    },
    {
      title: 'Budget Allocation',
      description: 'Increase budget for best-performing campaign',
      action: '/analytics'
    }
  ];

  const features = [
    {
      title: 'Audience Explorer',
      description: 'Discover your perfect audience',
      icon: Target,
      color: 'blue',
      action: '/audience-explorer',
      buttonText: 'Explore Now'
    },
    {
      title: 'Analytics',
      description: 'View performance insights',
      icon: LayoutDashboard,
      color: 'purple',
      action: '/analytics',
      buttonText: 'Analyze'
    },
    {
      title: 'Create Campaign',
      description: 'Launch a new campaign',
      icon: PenTool,
      color: 'green',
      action: '/create',
      buttonText: 'Create'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Welcome Back, {userName}! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl">
              Unlock the full potential of your Meta Ads campaigns today.
              Let's create something amazing together.
            </p>
            <a 
              href="/audience-explorer"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Explore Audiences
              <ArrowRight size={20} />
            </a>
          </div>
          
          {/* Abstract Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon size={24} className={`text-${stat.color}-600`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg text-white">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your AI Assistant Suggestions</h2>
              <p className="text-gray-600">Personalized recommendations to optimize your campaigns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="group bg-purple-50 rounded-xl p-6 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Sparkles size={20} />
                  <h3 className="font-medium">{suggestion.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{suggestion.description}</p>
                <a
                  href={suggestion.action}
                  className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 group-hover:gap-2 transition-all"
                >
                  Apply Now
                  <ChevronRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-50 mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className={`text-${feature.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <a
                href={feature.action}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-${feature.color}-50 text-${feature.color}-600 hover:bg-${feature.color}-100 transition-colors`}
              >
                {feature.buttonText}
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Quick Links Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">What do you want to do today?</h3>
            <div className="flex flex-wrap items-center gap-3">
              <a 
                href="/create"
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                Create Campaign
              </a>
              <a 
                href="/audience-explorer"
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                Optimize Audience
              </a>
              <a 
                href="/analytics"
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                Analyze Performance
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <a href="/help" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <HelpCircle size={16} />
              Help Center
            </a>
            <a href="/contact" className="hover:text-gray-900 transition-colors">Contact Us</a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">Terms & Conditions</a>
            <button 
              onClick={() => {/* Add logout handler */}} 
              className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};