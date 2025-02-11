import React, { useState } from 'react';
import { Search, Filter, Layout, Image, Film, Layers, MessageSquare, Target, FileText, Info, ChevronDown, ArrowRight } from 'lucide-react';
import { AdFormatCard } from './AdFormatCard';
import { AdSpecifications } from './AdSpecifications';
import { AdTemplates } from './AdTemplates';
import { useAuthStore } from '../../store/authStore';

export const AdLibrary: React.FC = () => {
  const { selectedAccount } = useAuthStore();
  const [activeView, setActiveView] = useState<'formats' | 'specs' | 'templates'>('formats');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    objective: 'all',
    industry: 'all'
  });

  const adFormats = [
    {
      id: 'image',
      name: 'Image Ads',
      icon: Image,
      description: 'Single image advertisements with text',
      platforms: ['Facebook', 'Instagram', 'Messenger'],
      specs: {
        dimensions: '1200 x 628 pixels',
        fileSize: '30MB',
        format: 'JPG or PNG',
        ratio: '1.91:1'
      },
      bestPractices: [
        'Use high-quality images',
        'Keep text minimal',
        'Include clear CTA',
        'Test different variations'
      ]
    },
    {
      id: 'video',
      name: 'Video Ads',
      icon: Film,
      description: 'Engaging video content advertisements',
      platforms: ['Facebook', 'Instagram', 'Messenger'],
      specs: {
        dimensions: '1280 x 720 pixels',
        duration: '1-240 seconds',
        fileSize: '4GB',
        format: 'MP4, MOV'
      },
      bestPractices: [
        'Capture attention in first 3 seconds',
        'Design for sound-off viewing',
        'Include captions',
        'Keep videos concise'
      ]
    },
    {
      id: 'carousel',
      name: 'Carousel Ads',
      icon: Layers,
      description: 'Multiple images or videos in a single ad',
      platforms: ['Facebook', 'Instagram'],
      specs: {
        cards: '2-10 cards',
        dimensions: '1080 x 1080 pixels',
        fileSize: '30MB per image',
        format: 'JPG, PNG'
      },
      bestPractices: [
        'Tell a cohesive story',
        'Use consistent imagery',
        'Showcase multiple products',
        'Progressive narrative'
      ]
    },
    {
      id: 'stories',
      name: 'Stories Ads',
      icon: MessageSquare,
      description: 'Full-screen vertical format ads',
      platforms: ['Facebook', 'Instagram'],
      specs: {
        dimensions: '1080 x 1920 pixels',
        duration: '1-15 seconds',
        format: 'JPG, PNG, MP4',
        ratio: '9:16'
      },
      bestPractices: [
        'Design for vertical viewing',
        'Use engaging motion',
        'Include interactive elements',
        'Keep content brief'
      ]
    },
    {
      id: 'collection',
      name: 'Collection Ads',
      icon: Layout,
      description: 'Showcase products with immersive format',
      platforms: ['Facebook', 'Instagram'],
      specs: {
        coverImage: '1200 x 628 pixels',
        products: 'Up to 50 items',
        format: 'JPG, PNG',
        layout: 'Grid or List'
      },
      bestPractices: [
        'Curate related products',
        'Strong cover image/video',
        'Clear product hierarchy',
        'Consistent theme'
      ]
    }
  ];

  const filteredFormats = adFormats.filter(format => {
    if (searchTerm) {
      return format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             format.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white">
                <Layout size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ad Library</h1>
                <p className="text-gray-600">Explore ad formats, specifications, and templates</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveView('formats')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'formats'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Ad Formats
              </button>
              <button
                onClick={() => setActiveView('specs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'specs'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveView('templates')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'templates'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Templates
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ad formats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-4">
            {/* Platform Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Platform</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Objective Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Objective</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Industry Filter */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Industry</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeView === 'formats' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormats.map((format) => (
              <AdFormatCard
                key={format.id}
                format={format}
                onSelect={() => setSelectedFormat(format.id)}
              />
            ))}
          </div>
        ) : activeView === 'specs' ? (
          <AdSpecifications formats={adFormats} />
        ) : (
          <AdTemplates formats={adFormats} />
        )}
      </div>
    </div>
  );
};