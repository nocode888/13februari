import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class OpenAIService {
  private static suggestionCache = new Map<string, {
    data: string[];
    timestamp: number;
  }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000;

  private static async makeRequest<T>(operation: () => Promise<T>): Promise<T> {
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }
      return await operation();
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof Error) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while calling OpenAI API');
    }
  }

  static async generateResponse(prompt: string, context?: string) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful Meta Ads assistant that provides insights and recommendations."
          },
          {
            role: "user",
            content: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt
          }
        ],
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0]?.message?.content || 'No response generated';
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  static async generateInterestSuggestions(interests: string[]) {
    try {
      const prompt = `Based on these interests: ${interests.join(', ')}, suggest 5 related interests that would work well for Meta Ads targeting. Format the response as a list with brackets: [interest1], [interest2], etc.`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting specialist."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo",
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Extract interests from response
      const matches = response.match(/\[(.*?)\]/g) || [];
      return matches.map(match => match.slice(1, -1));

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate interest suggestions');
    }
  }

  static async exploreInterest(interest: string) {
    try {
      const prompt = `Analyze this Meta Ads interest: "${interest}". Provide:
1. Related Interests: [interest1], [interest2], [interest3]
2. Audience Characteristics
3. Content Recommendations
4. Targeting Tips`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting specialist."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0]?.message?.content || '';

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to explore interest');
    }
  }
}