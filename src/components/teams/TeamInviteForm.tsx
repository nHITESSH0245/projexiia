
import { useState } from 'react';
import { toast } from 'sonner';
import { inviteToTeam } from '@/lib/team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TeamInviteFormProps {
  teamId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TeamInviteForm = ({ teamId, onSuccess, onCancel }: TeamInviteFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { invite, error } = await inviteToTeam(teamId, email);
      
      if (error) {
        toast.error(`Failed to send invitation: ${error.message}`);
      } else {
        toast.success('Invitation sent successfully!');
        setEmail('');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Team invitation error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Student Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter student email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
