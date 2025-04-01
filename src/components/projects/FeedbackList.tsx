
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Feedback } from '@/types';
import { getProjectFeedback } from '@/lib/supabase';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FeedbackListProps {
  projectId: string;
}

export const FeedbackList = ({ projectId }: FeedbackListProps) => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      setError(null); // Reset error state when fetching
      const { feedback, error: apiError } = await getProjectFeedback(projectId);
      
      if (apiError) {
        throw apiError;
      }
      
      setFeedbackItems(Array.isArray(feedback) ? feedback : []);
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      setError(err.message || 'Failed to load feedback');
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFeedback();
    }
  }, [projectId]);

  const getInitials = (name: string) => {
    if (!name) return 'F'; // Default fallback
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchFeedback} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No feedback yet"
        description="Feedback will appear here when faculty provides it"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbackItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={item.faculty?.avatar_url || ''} alt="Faculty" />
                <AvatarFallback>
                  {getInitials(item.faculty?.name || 'F')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{item.faculty?.name || 'Faculty'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(item.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <p className="mt-2 text-sm">{item.comment}</p>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
