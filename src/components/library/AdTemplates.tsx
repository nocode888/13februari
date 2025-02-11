import React from 'react';
import { Layout, Download, Eye, ArrowRight } from 'lucide-react';

interface AdTemplatesProps {
  formats: Array<{
    id: string;
    name: string;
    icon: any;
    bestPractices: string[];
  }>;
}

export const AdTemplates: React.FC<AdTemplatesProps> = ({ formats }) => {
  return (
    <div className="space-y-6">
      {formats.map((format) => (
        <div key={format.id} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <format.icon size={20} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{format.name} Templates</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Eye size={16} />
                Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((template) => (
              <div key={template} className="bg-gray-50 rounded-lg p-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Template {template}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Professional template optimized for {format.name.toLowerCase()}
                </p>
                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  Use Template
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {format.bestPractices.map((practice, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-gray-600">{practice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};