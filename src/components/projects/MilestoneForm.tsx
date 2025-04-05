
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Milestone } from '@/types';
import { createProjectMilestone, updateProjectMilestone } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MilestoneFormProps {
  projectId: string;
  milestone?: Milestone;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MilestoneForm = ({ projectId, milestone, onSuccess, onCancel }: MilestoneFormProps) => {
  const [title, setTitle] = useState(milestone?.title || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    milestone?.due_date ? new Date(milestone.due_date) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (milestone) {
        // Update existing milestone
        const { milestone: updatedMilestone, error } = await updateProjectMilestone(milestone.id, {
          title,
          description: description || null,
          due_date: dueDate.toISOString()
        });
        
        if (error) throw error;
        
        toast.success('Milestone updated successfully');
      } else {
        // Create new milestone
        const { milestone: newMilestone, error } = await createProjectMilestone(
          projectId,
          title,
          description || null,
          dueDate.toISOString()
        );
        
        if (error) throw error;
        
        toast.success('Milestone created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Milestone form error:', error);
      toast.error('Failed to save milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {milestone ? 'Edit Milestone' : 'Add New Milestone'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {milestone ? 'Update the details of this milestone' : 'Create a new milestone for this project'}
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter milestone title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Due Date <span className="text-destructive">*</span>
        </label>
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
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
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
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter milestone description (optional)"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {milestone ? 'Update' : 'Create'} Milestone
        </Button>
      </div>
    </form>
  );
};
