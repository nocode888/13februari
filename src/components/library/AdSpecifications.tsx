import React from 'react';
import { Table, FileText, Info } from 'lucide-react';

interface AdSpecificationsProps {
  formats: Array<{
    id: string;
    name: string;
    specs: Record<string, string>;
  }>;
}

export const AdSpecifications: React.FC<AdSpecificationsProps> = ({ formats }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <FileText size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Technical Specifications</h2>
            <p className="text-gray-600">Detailed requirements for each ad format</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Format</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dimensions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">File Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Format</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Other</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formats.map((format) => (
                <tr key={format.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{format.name}</span>
                  </td>
                  {Object.entries(format.specs).map(([key, value]) => (
                    <td key={key} className="py-3 px-4 text-sm text-gray-600">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex gap-3">
            <Info size={20} className="text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• All images should be high-quality and properly compressed</li>
                <li>• Text overlay should not exceed 20% of the image area</li>
                <li>• Videos should include captions for accessibility</li>
                <li>• Consider mobile-first design for all formats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};