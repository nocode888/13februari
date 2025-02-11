import React from 'react';
import { ArrowUp, ArrowDown, MoreVertical, ExternalLink } from 'lucide-react';

interface CampaignTableProps {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
  }>;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns }) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No campaign data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-sm font-medium text-gray-500 pb-3">Campaign</th>
            <th className="text-left text-sm font-medium text-gray-500 pb-3">Status</th>
            <th className="text-right text-sm font-medium text-gray-500 pb-3">Budget</th>
            <th className="text-right text-sm font-medium text-gray-500 pb-3">Spend</th>
            <th className="text-right text-sm font-medium text-gray-500 pb-3">Impressions</th>
            <th className="text-right text-sm font-medium text-gray-500 pb-3">CTR</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="group hover:bg-gray-50">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </div>
              </td>
              <td>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  campaign.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status}
                </span>
              </td>
              <td className="text-right text-sm text-gray-900">
                ${campaign.budget.toLocaleString()}
              </td>
              <td className="text-right text-sm text-gray-900">
                ${campaign.spend.toLocaleString()}
              </td>
              <td className="text-right text-sm text-gray-900">
                {campaign.impressions.toLocaleString()}
              </td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-sm text-gray-900">
                    {campaign.ctr.toFixed(2)}%
                  </span>
                  {campaign.ctr > 2 ? (
                    <ArrowUp size={14} className="text-green-500" />
                  ) : (
                    <ArrowDown size={14} className="text-red-500" />
                  )}
                </div>
              </td>
              <td>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={14} className="text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};