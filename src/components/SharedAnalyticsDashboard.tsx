import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

export const SharedAnalyticsDashboard: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const validateShareToken = () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error('Invalid share link');
        }

        // Decode and parse the token
        const decodedString = decodeURIComponent(atob(token));
        console.log('Decoded token:', decodedString); // Debug log
        const tokenData = JSON.parse(decodedString);

        // Validate token structure
        if (!tokenData.id || !tokenData.access || !tokenData.expires || !tokenData.timestamp) {
          throw new Error('Invalid share link format');
        }

        // Check expiration
        if (tokenData.expires !== 'never') {
          const expirationTime = tokenData.timestamp + getExpirationTime(tokenData.expires);
          if (Date.now() > expirationTime) {
            throw new Error('This share link has expired');
          }
        }

        // Set dashboard data
        setDashboardData({
          id: tokenData.id,
          accessType: tokenData.access,
          expiresIn: tokenData.expires
        });
      } catch (err) {
        console.error('Share link validation error:', err);
        setError('This share link is invalid or has expired');
        // Redirect to home after 3 seconds on error
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    validateShareToken();
  }, [token, navigate]);

  const getExpirationTime = (expires: string): number => {
    const day = 24 * 60 * 60 * 1000; // milliseconds in a day
    switch (expires) {
      case '1d': return day;
      case '7d': return 7 * day;
      case '30d': return 30 * day;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading shared dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard isShared dashboardData={dashboardData} />;
};