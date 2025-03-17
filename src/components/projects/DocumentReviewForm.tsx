
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateDocumentStatus } from '@/lib/document';
import { Document, DocumentStatus } from '@/types';
import { formatBytes } from '@/lib/utils';
import { Check, X, File, FileText, FileImage, FilePresentation } from 'lucide-react';

interface DocumentReviewFormProps {
  document: Document & { url: string };
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  status: DocumentStatus;
  remarks: string;
}

export function DocumentReviewForm({ document, onSuccess, onCancel }: DocumentReviewFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      status: 'approved',
      remarks: '',
    },
  });
  
  const { handleSubmit, control, formState: { isSubmitting } } = form;
  
  const onSubmit = async (values: FormValues) => {
    try {
      const { document: updatedDocument, error } = await updateDocumentStatus(
        document.id,
        values.status,
        values.remarks
      );
      
      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };
  
  const renderFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (
      fileType.includes('presentation') || 
      fileType.includes('powerpoint') || 
      fileType.includes('ppt')
    ) {
      return <FilePresentation className="h-6 w-6 text-orange-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Review Document</h2>
      
      <div className="mb-6 p-4 border rounded-md bg-muted/30">
        <div className="flex items-center space-x-3">
          {renderFileIcon(document.file_type)}
          <div>
            <h3 className="font-medium">{document.name}</h3>
            <p className="text-sm text-muted-foreground">{formatBytes(document.file_size)}</p>
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(document.url, '_blank')}
          >
            View Document
          </Button>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Document Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="approved" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Approve Document
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="rejected" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center">
                        <X className="h-4 w-4 mr-2 text-red-500" />
                        Reject Document
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add your feedback or comments about this document"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The student will see these remarks along with your decision.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Submit Review
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
