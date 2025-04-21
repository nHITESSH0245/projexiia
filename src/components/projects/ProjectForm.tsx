
import { useState } from 'react';
import { toast } from 'sonner';
import { createProject } from '@/lib/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  teamId?: string;
}

export const ProjectForm = ({ onSuccess, onCancel, teamId }: ProjectFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting project form:', { title, description, teamId });
      const { project, error } = await createProject(title, description, 'planning', teamId);
      
      if (error) {
        console.error('Project creation error:', error);
        toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
      } else {
        console.log('Project created:', project);
        toast.success(`Project created successfully!${teamId ? ' Team members can now contribute to it.' : ''}`);
        setTitle('');
        setDescription('');
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Project creation error:', error);
      toast.error(`An unexpected error occurred: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{teamId ? 'Create New Team Project' : 'Create New Project'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
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
              'Create Project'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
