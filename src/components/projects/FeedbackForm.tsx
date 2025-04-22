
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { provideFeedback } from '@/lib/supabase';
import { toast } from 'sonner';

interface FeedbackFormProps {
  projectId: string;
  taskId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FeedbackForm = ({ projectId, taskId, onSuccess, onCancel }: FeedbackFormProps) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please enter feedback');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { feedback, error } = await provideFeedback(
        projectId,
        comment,
        taskId
      );
      
      if (error) {
        throw error;
      }
      
      toast.success('Feedback submitted successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Provide Feedback</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your feedback here..."
            rows={5}
            required
          />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
