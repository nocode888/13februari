import React from 'react';
import { ArrowRight, DivideIcon as LucideIcon } from 'lucide-react';

interface AdFormatCardProps {
  format: {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    platforms: string[];
    specs: Record<string, string>;
    bestPractices: string[];
  };
  onSelect: () => void;
}

export const AdFormatCard: React.FC<AdFormatCardProps> = ({ format, onSelect }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <format.icon size={20} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{format.name}</h3>
      </div>

      <p className="text-gray-600 mb-4">{format.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {format.platforms.map((platform) => (
          <span
            key={platform}
            className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {platform}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Specifications</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(format.specs).slice(0, 4).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-500">{key}: </span>
                <span className="text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onSelect}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          View Details
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};