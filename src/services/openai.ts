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

  static async generateResponse(message: string, context?: string): Promise<string> {
    return this.makeRequest(async () => {
      let systemPrompt = `You are a Meta Ads and marketing expert AI assistant. Your responses should be:

1. Focused on actionable marketing insights
2. Based on current Meta Ads best practices
3. Clear and structured with bullet points when appropriate
4. Practical and implementation-ready
5. Backed by industry knowledge

Always maintain a professional and data-driven approach.`;

      if (context) {
        systemPrompt += `\n\nContext for this analysis:\n${context}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate an analysis. Please try again.";
    });
  }

  static async generateInterestSuggestions(currentInterests: string[]): Promise<string[]> {
    return this.makeRequest(async () => {
      if (!currentInterests.length) {
        throw new Error('At least one interest is required');
      }

      const cacheKey = currentInterests.sort().join(',');
      const cached = this.suggestionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      const prompt = `Based on these Meta Ads interests: ${currentInterests.join(', ')}

Please suggest 5 additional highly relevant targeting interests that are:
1. Directly related to the given interests
2. Available in Meta Ads targeting
3. Have high audience potential
4. Show commercial intent

Format each suggestion in [brackets], one per line.

Example format:
[Interest1]
[Interest2]
[Interest3]
[Interest4]
[Interest5]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting expert. Provide only interests in [brackets], one per line. Focus on interests available in Meta Ads targeting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const suggestions = response.choices[0].message.content
        ?.match(/\[(.*?)\]/g)
        ?.map(match => match.slice(1, -1))
        ?.filter(s => s && !currentInterests.includes(s))
        ?.slice(0, 5) || [];

      if (!suggestions.length) {
        throw new Error('No valid suggestions could be generated');
      }

      this.suggestionCache.set(cacheKey, {
        data: suggestions,
        timestamp: Date.now()
      });

      return suggestions;
    });
  }

  static async exploreInterest(interest: string): Promise<string> {
    return this.makeRequest(async () => {
      const cacheKey = `explore_${interest}`;
      const cached = this.suggestionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data[0];
      }

      const prompt = `Analyze this Meta Ads interest or set of interests: "${interest}"

Provide targeting recommendations in this exact format:

Primary Interests:
[Interest1]
[Interest2]
[Interest3]

Demographics:
[Age: range]
[Gender: type]
[Education: level]

Behaviors:
[Behavior1]
[Behavior2]
[Behavior3]

Focus on practical Meta Ads targeting options that are actually available in the platform.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a Meta Ads targeting expert. Provide recommendations in brackets, focusing on actionable targeting options available in Meta Ads."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const result = response.choices[0].message.content || "No recommendations available.";

      this.suggestionCache.set(cacheKey, {
        data: [result],
        timestamp: Date.now()
      });

      return result;
    });
  }
}