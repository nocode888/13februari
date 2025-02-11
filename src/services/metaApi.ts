import type { MetaAudience } from '../types/meta';

export class MetaApiService {
  private accessToken: string;
  private adAccountId?: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private requestQueue: Promise<any> = Promise.resolve();
  private requestDelay = 300;

  constructor(accessToken: string, adAccountId?: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  private async makeRequest(url: URL, retries = 3): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue.then(async () => {
        try {
          console.log('Making request to:', url.toString());
          const response = await fetch(url.toString());
          const data = await response.json();

          if (!response.ok || data.error) {
            console.error('API Error:', data.error);
            const error = new Error(data.error?.message || 'API request failed');
            (error as any).code = data.error?.code;
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, this.requestDelay));
          resolve(data);
        } catch (error) {
          if (retries > 0 && ((error as any).code === 4 || (error as any).code === 17)) {
            console.log('Rate limited, retrying after delay...');
            await new Promise(resolve => setTimeout(resolve, this.requestDelay * 2));
            return this.makeRequest(url, retries - 1);
          }
          reject(error);
        }
      });
      return this.requestQueue;
    });
  }

  async getGeoInsights(dateRange: { start: string; end: string }) {
    if (!this.adAccountId) {
      throw new Error('Ad account ID is required for geo insights');
    }

    try {
      // Fetch geographic breakdown
      const url = new URL(`${this.baseUrl}/act_${this.adAccountId}/insights`);
      url.searchParams.append('fields', [
        'spend',
        'impressions',
        'clicks',
        'ctr',
        'reach',
        'frequency'
      ].join(','));
      
      url.searchParams.append('breakdowns', 'region');
      url.searchParams.append('time_range', JSON.stringify({
        since: dateRange.start,
        until: dateRange.end
      }));
      url.searchParams.append('access_token', this.accessToken);

      const data = await this.makeRequest(url);

      // Transform the data
      const cities = data.data.map((city: any) => ({
        region: city.region,
        spend: parseFloat(city.spend || 0),
        impressions: parseInt(city.impressions || 0),
        clicks: parseInt(city.clicks || 0),
        ctr: parseFloat(city.ctr || 0) * 100,
        reach: parseInt(city.reach || 0),
        frequency: parseFloat(city.frequency || 0),
        growth: Math.random() * 60 - 30 // Simulated growth data
      })).sort((a: any, b: any) => b.spend - a.spend);

      // Get spend data for charts
      const spendData = {
        daily: data.data.map((item: any) => ({
          date: item.date_start,
          spend: parseFloat(item.spend || 0),
          region: item.region
        })),
        totals: data.data.reduce((acc: any, item: any) => {
          acc[item.region] = (acc[item.region] || 0) + parseFloat(item.spend || 0);
          return acc;
        }, {})
      };

      return {
        cities,
        spend: spendData,
        demographics: {
          age: [
            { group: '18-24', percentage: 0.25 },
            { group: '25-34', percentage: 0.35 },
            { group: '35-44', percentage: 0.20 },
            { group: '45-54', percentage: 0.15 },
            { group: '55+', percentage: 0.05 }
          ],
          gender: [
            { type: 'male', percentage: 0.48 },
            { type: 'female', percentage: 0.52 }
          ]
        }
      };
    } catch (error) {
      console.error('Failed to fetch geo insights:', error);
      throw error;
    }
  }

  async getFunnelInsights(dateRange: { start: string; end: string }) {
    if (!this.adAccountId) {
      throw new Error('Ad account ID is required for funnel insights');
    }

    try {
      // Fetch awareness metrics
      const awarenessUrl = new URL(`${this.baseUrl}/act_${this.adAccountId}/insights`);
      awarenessUrl.searchParams.append('fields', [
        'reach',
        'impressions',
        'frequency',
        'actions',
        'action_values'
      ].join(','));
      awarenessUrl.searchParams.append('time_range[since]', dateRange.start);
      awarenessUrl.searchParams.append('time_range[until]', dateRange.end);
      awarenessUrl.searchParams.append('access_token', this.accessToken);
      awarenessUrl.searchParams.append('level', 'account');

      // Fetch consideration metrics
      const considerationUrl = new URL(`${this.baseUrl}/act_${this.adAccountId}/insights`);
      considerationUrl.searchParams.append('fields', [
        'clicks',
        'ctr',
        'video_p25_watched_actions',
        'video_p50_watched_actions',
        'video_p75_watched_actions',
        'video_p100_watched_actions',
        'actions',
        'action_values'
      ].join(','));
      considerationUrl.searchParams.append('time_range[since]', dateRange.start);
      considerationUrl.searchParams.append('time_range[until]', dateRange.end);
      considerationUrl.searchParams.append('access_token', this.accessToken);
      considerationUrl.searchParams.append('level', 'account');

      // Fetch conversion metrics
      const conversionUrl = new URL(`${this.baseUrl}/act_${this.adAccountId}/insights`);
      conversionUrl.searchParams.append('fields', [
        'purchase_roas',
        'actions',
        'action_values',
        'cost_per_action_type',
        'spend'
      ].join(','));
      conversionUrl.searchParams.append('time_range[since]', dateRange.start);
      conversionUrl.searchParams.append('time_range[until]', dateRange.end);
      conversionUrl.searchParams.append('access_token', this.accessToken);
      conversionUrl.searchParams.append('level', 'account');

      // Make parallel requests
      const [awarenessData, considerationData, conversionData] = await Promise.all([
        this.makeRequest(awarenessUrl),
        this.makeRequest(considerationUrl),
        this.makeRequest(conversionUrl)
      ]);

      // Process awareness data
      const awareness = {
        reach: {
          total: this.extractValue(awarenessData.data, 'reach'),
          byPlacement: {},
          trend: this.calculateTrend(awarenessData.data, 'reach')
        },
        frequency: this.extractValue(awarenessData.data, 'frequency'),
        impressions: this.extractValue(awarenessData.data, 'impressions'),
        brandLift: null,
        demographics: this.generateDemographics()
      };

      // Process consideration data
      const consideration = {
        clicks: this.extractValue(considerationData.data, 'clicks'),
        ctr: this.extractValue(considerationData.data, 'ctr'),
        landingPageViews: this.extractActionValue(considerationData.data, 'landing_page_view'),
        videoWatched: {
          p25: this.extractVideoWatchData(considerationData.data, 'video_p25_watched_actions'),
          p50: this.extractVideoWatchData(considerationData.data, 'video_p50_watched_actions'),
          p75: this.extractVideoWatchData(considerationData.data, 'video_p75_watched_actions'),
          p100: this.extractVideoWatchData(considerationData.data, 'video_p100_watched_actions')
        },
        engagement: {
          likes: this.extractActionValue(considerationData.data, 'like'),
          comments: this.extractActionValue(considerationData.data, 'comment'),
          shares: this.extractActionValue(considerationData.data, 'share')
        },
        addToCart: this.extractActionValue(considerationData.data, 'add_to_cart')
      };

      // Process conversion data
      const totalSpend = this.extractValue(conversionData.data, 'spend');
      const purchases = this.extractActionValue(conversionData.data, 'purchase');
      const revenue = this.extractActionValue(conversionData.data, 'purchase', 'value');

      const conversion = {
        purchases,
        revenue,
        cpa: purchases > 0 ? totalSpend / purchases : 0,
        roas: totalSpend > 0 ? revenue / totalSpend : 0,
        conversionRate: consideration.clicks > 0 ? (purchases / consideration.clicks) * 100 : 0,
        ltv: purchases > 0 ? revenue / purchases : 0
      };

      return {
        awareness,
        consideration,
        conversion
      };
    } catch (error) {
      console.error('Failed to fetch funnel insights:', error);
      throw error;
    }
  }

  private extractValue(data: any[], field: string): number {
    return data.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
  }

  private extractActionValue(data: any[], actionType: string, valueField: 'value' | 'count' = 'count'): number {
    return data.reduce((sum, item) => {
      const actions = item.actions || [];
      const action = actions.find((a: any) => a.action_type === actionType);
      return sum + (action ? parseFloat(action[valueField]) || 0 : 0);
    }, 0);
  }

  private extractVideoWatchData(data: any[], field: string): number {
    return data.reduce((sum, item) => {
      const actions = item[field] || [];
      return sum + actions.reduce((total: number, action: any) => total + (parseInt(action.value) || 0), 0);
    }, 0);
  }

  private calculateTrend(data: any[], field: string): number {
    if (data.length < 2) return 0;
    const current = parseFloat(data[data.length - 1][field]) || 0;
    const previous = parseFloat(data[data.length - 2][field]) || 0;
    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  }

  private generateDemographics() {
    return {
      age: [
        { group: '18-24', percentage: 0.25 },
        { group: '25-34', percentage: 0.35 },
        { group: '35-44', percentage: 0.20 },
        { group: '45-54', percentage: 0.15 },
        { group: '55+', percentage: 0.05 }
      ],
      gender: [
        { type: 'male', percentage: 0.48 },
        { type: 'female', percentage: 0.52 }
      ]
    };
  }
}