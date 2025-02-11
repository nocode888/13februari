import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { MetaCommentService } from '../services/metaCommentService';

export function useComments() {
  const { accessToken, selectedAccount } = useAuthStore();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !selectedAccount) {
      setError('Please connect your Meta account and select an ad account');
      setIsLoading(false);
      return;
    }

    console.log('Initializing comment service with:', { 
      accessToken: accessToken.substring(0, 10) + '...',
      accountId: selectedAccount.id 
    });

    const commentService = new MetaCommentService(accessToken, selectedAccount.id);
    
    // Subscribe to new comments
    const unsubscribe = commentService.onNewComment((comment) => {
      console.log('New comment received:', comment);
      setComments(prev => [comment, ...prev]);
    });

    // Load initial comments
    const initialComments = commentService.getComments();
    console.log('Initial comments loaded:', initialComments.length);
    setComments(initialComments);
    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, [accessToken, selectedAccount]);

  const handleComment = async (commentId: string, action: 'reply' | 'hide', response?: string) => {
    if (!accessToken || !selectedAccount) {
      throw new Error('Authentication required');
    }

    console.log('Handling comment action:', { commentId, action, response });
    const commentService = new MetaCommentService(accessToken, selectedAccount.id);

    try {
      if (action === 'reply' && response) {
        await commentService.replyToComment(commentId, response);
      } else if (action === 'hide') {
        await commentService.hideComment(commentId);
      }

      // Update local comments
      const updatedComments = commentService.getComments();
      console.log('Comments updated:', updatedComments.length);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to handle comment:', error);
      throw error;
    }
  };

  const generateResponse = async (commentId: string) => {
    if (!accessToken || !selectedAccount) {
      throw new Error('Authentication required');
    }

    console.log('Generating response for comment:', commentId);
    const commentService = new MetaCommentService(accessToken, selectedAccount.id);
    const comment = comments.find(c => c.id === commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    try {
      const response = await commentService.generateResponse(comment);
      console.log('Generated response:', response);
      return response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  };

  return {
    comments,
    isLoading,
    error,
    handleComment,
    generateResponse
  };
}