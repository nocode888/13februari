import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export const BudgetAllocation: React.FC = () => {
  const data = [
    {
      category: 'Awareness',
      allocated: 5000,
      spent: 4200,
      remaining: 800
    },
    {
      category: 'Consideration',
      allocated: 8000,
      spent: 6800,
      remaining: 1200
    },
    {
      category: 'Conversion',
      allocated: 12000,
      spent: 9600,
      remaining: 2400
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-blue-600" />
            <span className="font-medium text-gray-900">Total Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$25,000</div>
          <div className="text-sm text-blue-600">Monthly allocation</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="font-medium text-gray-900">Spent</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$20,600</div>
          <div className="text-sm text-green-600">82.4% of budget</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-yellow-600" />
            <span className="font-medium text-gray-900">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$4,400</div>
          <div className="text-sm text-yellow-600">17.6% available</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
            <Bar dataKey="spent" fill="#10b981" name="Spent" />
            <Bar dataKey="remaining" fill="#eab308" name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};