import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface Comment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  status?: 'pending' | 'handled';
  adId?: string;
}

export function useMetaComments(daysAgo: number = 90) {
  const { accessToken, selectedAccount } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (!accessToken || !selectedAccount) {
        setError('Please connect your Meta account and select an ad account');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First, get all ads from the account
        const adsUrl = new URL('https://graph.facebook.com/v18.0/act_' + selectedAccount.id + '/ads');
        adsUrl.searchParams.append('fields', 'id,name,status,comments{id,message,from,created_time}');
        adsUrl.searchParams.append('status', ['ARCHIVED', 'PAUSED'].join(','));
        adsUrl.searchParams.append('access_token', accessToken);

        const adsResponse = await fetch(adsUrl.toString());
        const adsData = await adsResponse.json();

        if (adsData.error) {
          throw new Error(adsData.error.message);
        }

        // Extract comments from all ads
        const allComments: Comment[] = [];
        adsData.data.forEach((ad: any) => {
          if (ad.comments && ad.comments.data) {
            ad.comments.data.forEach((comment: any) => {
              // Add basic sentiment analysis based on keywords
              let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
              const message = comment.message.toLowerCase();
              
              const positiveWords = ['bagus', 'enak', 'mantap', 'suka', 'recommended', 'top', '👍', '😋', '🤤'];
              const negativeWords = ['mahal', 'kurang', 'kecewa', 'lama', 'buruk', 'jelek', '👎'];
              
              if (positiveWords.some(word => message.includes(word))) {
                sentiment = 'positive';
              } else if (negativeWords.some(word => message.includes(word))) {
                sentiment = 'negative';
              }

              allComments.push({
                ...comment,
                sentiment,
                status: 'pending',
                adId: ad.id
              });
            });
          }
        });

        // Sort comments by date (newest first)
        allComments.sort((a, b) => 
          new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
        );

        setComments(allComments);
        setHasMore(false);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [accessToken, selectedAccount]);

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;

    setIsFetchingMore(true);
    try {
      // Implement pagination if needed
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Failed to load more comments:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleComment = async (commentId: string, action: 'reply' | 'hide', response?: string) => {
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    try {
      if (action === 'reply' && response) {
        // Reply to comment
        const replyUrl = new URL(`https://graph.facebook.com/v18.0/${commentId}/comments`);
        const replyResponse = await fetch(replyUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: response,
            access_token: accessToken
          })
        });

        const replyData = await replyResponse.json();
        if (replyData.error) {
          throw new Error(replyData.error.message);
        }

        // Update local state
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, status: 'handled' }
            : comment
        ));
      } else if (action === 'hide') {
        // Hide comment
        const hideUrl = new URL(`https://graph.facebook.com/v18.0/${commentId}`);
        const hideResponse = await fetch(hideUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_hidden: true,
            access_token: accessToken
          })
        });

        const hideData = await hideResponse.json();
        if (hideData.error) {
          throw new Error(hideData.error.message);
        }

        // Update local state
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to handle comment:', error);
      throw error;
    }
  };

  return {
    comments,
    isLoading,
    error,
    hasMore,
    loadMore,
    handleComment,
    page,
    isFetchingMore
  };
}