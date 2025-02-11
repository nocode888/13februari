import { MetaApiService } from './metaApi';
import { OpenAIService } from './openai';

interface Comment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'spam';
  status?: 'pending' | 'handled';
  adId?: string;
}

export class MetaCommentService {
  private accessToken: string;
  private adAccountId: string;
  private commentCache = new Map<string, Comment>();
  private commentHandlers = new Set<(comment: Comment) => void>();

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
    this.startPolling();
  }

  private async startPolling() {
    setInterval(async () => {
      await this.fetchNewComments();
    }, 30000); // Poll every 30 seconds
  }

  private async fetchNewComments() {
    try {
      const url = new URL(`https://graph.facebook.com/v18.0/act_${this.adAccountId}/ads`);
      url.searchParams.append('fields', 'id,comments{id,message,from,created_time}');
      url.searchParams.append('access_token', this.accessToken);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Process new comments
      for (const ad of data.data) {
        if (ad.comments && ad.comments.data) {
          for (const comment of ad.comments.data) {
            if (!this.commentCache.has(comment.id)) {
              const enrichedComment = await this.processComment({
                ...comment,
                adId: ad.id,
                status: 'pending'
              });
              this.commentCache.set(comment.id, enrichedComment);
              this.notifyHandlers(enrichedComment);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }

  private async processComment(comment: Comment): Promise<Comment> {
    // Analyze sentiment using OpenAI
    const prompt = `Analyze this comment sentiment and classify it as 'positive', 'negative', 'neutral', or 'spam'. Comment: "${comment.message}"`;
    
    try {
      const response = await OpenAIService.generateResponse(prompt);
      const sentiment = response.toLowerCase().match(/(positive|negative|neutral|spam)/)?.[0] as Comment['sentiment'] || 'neutral';
      
      return {
        ...comment,
        sentiment
      };
    } catch (error) {
      console.error('Failed to analyze comment:', error);
      return {
        ...comment,
        sentiment: 'neutral'
      };
    }
  }

  async generateResponse(comment: Comment): Promise<string> {
    const prompt = `Generate a professional and friendly response to this ${comment.sentiment} comment on a Meta ad: "${comment.message}"

Guidelines:
- Be empathetic and understanding
- Address the specific points raised
- Keep responses concise but helpful
- Maintain brand voice
- Include a call to action when appropriate

Response format: Just the response text, no explanations.`;

    try {
      return await OpenAIService.generateResponse(prompt);
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  }

  async replyToComment(commentId: string, message: string): Promise<void> {
    try {
      const url = new URL(`https://graph.facebook.com/v18.0/${commentId}/comments`);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          access_token: this.accessToken
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      // Update comment status in cache
      const comment = this.commentCache.get(commentId);
      if (comment) {
        comment.status = 'handled';
        this.commentCache.set(commentId, comment);
      }
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      throw error;
    }
  }

  async hideComment(commentId: string): Promise<void> {
    try {
      const url = new URL(`https://graph.facebook.com/v18.0/${commentId}`);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_hidden: true,
          access_token: this.accessToken
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (error) {
      console.error('Failed to hide comment:', error);
      throw error;
    }
  }

  onNewComment(handler: (comment: Comment) => void) {
    this.commentHandlers.add(handler);
    return () => this.commentHandlers.delete(handler);
  }

  private notifyHandlers(comment: Comment) {
    this.commentHandlers.forEach(handler => handler(comment));
  }

  getComments(filter?: { status?: 'pending' | 'handled'; sentiment?: Comment['sentiment'] }) {
    const comments = Array.from(this.commentCache.values());
    
    if (filter) {
      return comments.filter(comment => {
        if (filter.status && comment.status !== filter.status) return false;
        if (filter.sentiment && comment.sentiment !== filter.sentiment) return false;
        return true;
      });
    }

    return comments;
  }
}