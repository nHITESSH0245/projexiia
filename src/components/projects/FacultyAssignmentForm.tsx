
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, UserPlus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { assignFacultyToProject } from '@/lib/facultyAssignment';
import { toast } from 'sonner';

interface FacultyAssignmentFormProps {
  projectId: string;
  onSuccess: () => void;
}

const formSchema = z.object({
  facultyEmail: z.string().email('Please enter a valid email address')
});

type FormValues = z.infer<typeof formSchema>;

export function FacultyAssignmentForm({ projectId, onSuccess }: FacultyAssignmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facultyEmail: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await assignFacultyToProject(projectId, data.facultyEmail);
      
      if (result.error) {
        throw result.error;
      }
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error assigning faculty:', error);
      toast.error('Failed to assign faculty. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="facultyEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty Email</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter faculty email address" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
