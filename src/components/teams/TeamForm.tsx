
import { useState } from 'react';
import { toast } from 'sonner';
import { createTeam } from '@/lib/team';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TeamFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TeamForm = ({ onSuccess, onCancel }: TeamFormProps) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { team, error } = await createTeam(name);
      
      if (error) {
        toast.error(`Failed to create team: ${error.message}`);
      } else {
        toast.success('Team created successfully!');
        setName('');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Team creation error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Team</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="Enter team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                Creating...
              </>
            ) : (
              'Create Team'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
