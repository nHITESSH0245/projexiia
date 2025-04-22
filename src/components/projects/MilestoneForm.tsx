
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createProjectMilestone, updateProjectMilestone } from '@/lib/supabase';

interface MilestoneFormProps {
  projectId: string;
  milestoneId?: string;
  initialData?: {
    title: string;
    description: string;
    due_date: Date;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const MilestoneForm = ({ 
  projectId, 
  milestoneId, 
  initialData, 
  onSuccess, 
  onCancel 
}: MilestoneFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData?.due_date);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!milestoneId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !dueDate) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditMode && milestoneId) {
        await updateProjectMilestone(milestoneId, {
          title,
          description,
          due_date: dueDate
        });
      } else {
        await createProjectMilestone(projectId, title, description, dueDate);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Milestone form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Milestone' : 'Add Project Milestone'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title</Label>
            <Input
              id="title"
              placeholder="Enter milestone title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this milestone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title || !dueDate}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Milestone' : 'Create Milestone'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
