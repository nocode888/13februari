import { OpenAIService } from './openai';

export interface CopyAnalysis {
  score: number;
  feedback: {
    persuasiveness: {
      score: number;
      feedback: string[];
    };
    engagement: {
      score: number;
      feedback: string[];
    };
    relevance: {
      score: number;
      feedback: string[];
    };
  };
  suggestions: string[];
  abTestingInsights?: {
    winner: 'A' | 'B' | null;
    confidenceScore: number;
    recommendations: string[];
  };
}

export class CopywritingAnalyzer {
  static async analyzeCopy(copy: string, context: {
    businessDescription: string;
    targetAudience: string;
    objective: string;
    version?: 'A' | 'B';
  }): Promise<CopyAnalysis> {
    const prompt = `Analyze this Meta Ads copy (Version ${context.version || 'A'}) in the context of:

Business: ${context.businessDescription}
Target Audience: ${context.targetAudience}
Objective: ${context.objective}

Copy to analyze:
${copy}

Provide a detailed analysis with:
1. Overall score (0-100)
2. Scores and specific feedback for:
   - Persuasiveness (0-100): How compelling and action-driving is the copy?
   - Engagement (0-100): How well does it capture and maintain attention?
   - Relevance (0-100): How well does it match the audience and objective?
3. Actionable suggestions for improvement
4. Specific strengths and weaknesses

Format the response as:
score: number
persuasiveness_score: number
persuasiveness_feedback: list of points
engagement_score: number
engagement_feedback: list of points
relevance_score: number
relevance_feedback: list of points
suggestions: list of improvements`;

    try {
      const response = await OpenAIService.generateResponse(prompt);
      
      // Parse the response
      const lines = response.split('\n');
      const scores: Record<string, number> = {};
      const feedback: Record<string, string[]> = {};
      let suggestions: string[] = [];
      let currentSection = '';

      lines.forEach(line => {
        if (line.includes('score:')) {
          const [key, value] = line.split(':').map(s => s.trim());
          scores[key] = parseInt(value);
        } else if (line.includes('feedback:')) {
          currentSection = line.split(':')[0].trim();
          feedback[currentSection] = [];
        } else if (line.includes('suggestions:')) {
          currentSection = 'suggestions';
        } else if (line.trim().startsWith('-') && currentSection) {
          const point = line.trim().slice(2);
          if (currentSection === 'suggestions') {
            suggestions.push(point);
          } else {
            feedback[currentSection].push(point);
          }
        }
      });

      return {
        score: scores.score || 0,
        feedback: {
          persuasiveness: {
            score: scores.persuasiveness_score || 0,
            feedback: feedback.persuasiveness_feedback || []
          },
          engagement: {
            score: scores.engagement_score || 0,
            feedback: feedback.engagement_feedback || []
          },
          relevance: {
            score: scores.relevance_score || 0,
            feedback: feedback.relevance_feedback || []
          }
        },
        suggestions
      };
    } catch (error) {
      console.error('Failed to analyze copy:', error);
      throw error;
    }
  }

  static async compareVariations(
    variationA: string,
    variationB: string,
    context: {
      businessDescription: string;
      targetAudience: string;
      objective: string;
    }
  ): Promise<{
    winner: 'A' | 'B' | null;
    confidenceScore: number;
    recommendations: string[];
  }> {
    const prompt = `Compare these two Meta Ads copy variations:

Business: ${context.businessDescription}
Target Audience: ${context.targetAudience}
Objective: ${context.objective}

Variation A:
${variationA}

Variation B:
${variationB}

Analyze and compare:
1. Which variation is likely to perform better? (A, B, or Inconclusive)
2. Confidence score (0-100) in this prediction
3. Key strengths of each variation
4. Specific recommendations for testing

Format the response as:
winner: A/B/null
confidence: number
recommendations: list of points`;

    try {
      const response = await OpenAIService.generateResponse(prompt);
      
      // Parse the response
      const lines = response.split('\n');
      let winner: 'A' | 'B' | null = null;
      let confidenceScore = 0;
      const recommendations: string[] = [];

      lines.forEach(line => {
        if (line.startsWith('winner:')) {
          const value = line.split(':')[1].trim();
          winner = value === 'null' ? null : value as 'A' | 'B';
        } else if (line.startsWith('confidence:')) {
          confidenceScore = parseInt(line.split(':')[1].trim());
        } else if (line.trim().startsWith('-')) {
          recommendations.push(line.trim().slice(2));
        }
      });

      return {
        winner,
        confidenceScore,
        recommendations
      };
    } catch (error) {
      console.error('Failed to compare variations:', error);
      throw error;
    }
  }

  static getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  static getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }
}