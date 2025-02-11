import React from 'react';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MousePointer, ShoppingCart, CreditCard } from 'lucide-react';

export const ConversionFunnel: React.FC = () => {
  const data = [
    {
      name: 'Impressions',
      value: 100000,
      fill: '#3b82f6'
    },
    {
      name: 'Clicks',
      value: 25000,
      fill: '#10b981'
    },
    {
      name: 'Add to Cart',
      value: 5000,
      fill: '#8b5cf6'
    },
    {
      name: 'Purchases',
      value: 1000,
      fill: '#f59e0b'
    }
  ];

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Impressions':
        return <Users size={16} />;
      case 'Clicks':
        return <MousePointer size={16} />;
      case 'Add to Cart':
        return <ShoppingCart size={16} />;
      case 'Purchases':
        return <CreditCard size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((stage) => (
          <div key={stage.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getStageIcon(stage.name)}
              <span className="font-medium text-gray-900">{stage.name}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stage.value.toLocaleString()}
            </div>
            {stage.name !== 'Impressions' && (
              <div className="text-sm text-gray-600">
                {((stage.value / data[0].value) * 100).toFixed(1)}% conversion
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel
              data={data}
              dataKey="value"
              nameKey="name"
              gradientRatio={0.2}
            >
              <LabelList
                position="right"
                fill="#374151"
                stroke="none"
                dataKey="name"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};