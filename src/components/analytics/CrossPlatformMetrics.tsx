import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

export const CrossPlatformMetrics: React.FC = () => {
  const data = [
    { name: 'Facebook', value: 45, color: '#1877F2' },
    { name: 'Instagram', value: 30, color: '#E4405F' },
    { name: 'Messenger', value: 15, color: '#0084FF' },
    { name: 'WhatsApp', value: 10, color: '#25D366' }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook size={16} className="text-[#1877F2]" />;
      case 'Instagram':
        return <Instagram size={16} className="text-[#E4405F]" />;
      case 'Messenger':
        return <MessageCircle size={16} className="text-[#0084FF]" />;
      case 'WhatsApp':
        return <Phone size={16} className="text-[#25D366]" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((platform) => (
          <div key={platform.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getPlatformIcon(platform.name)}
              <span className="font-medium text-gray-900">{platform.name}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{platform.value}%</div>
            <div className="text-sm text-gray-600">of total spend</div>
          </div>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};