import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  onChange: (range: { start: string; end: string }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last7days');

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    setIsOpen(false);
    
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        start = today;
        break;
      case 'yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        break;
      case 'last7days':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'last30days':
        start = new Date(today.setDate(today.getDate() - 30));
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
    }
    
    onChange({
      start: start.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  const getRangeLabel = () => {
    switch (selectedRange) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      case 'last30days':
        return 'Last 30 Days';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      default:
        return 'Select Range';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar size={18} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{getRangeLabel()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'last7days', label: 'Last 7 Days' },
            { value: 'last30days', label: 'Last 30 Days' },
            { value: 'thisMonth', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleRangeSelect(value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                selectedRange === value
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};