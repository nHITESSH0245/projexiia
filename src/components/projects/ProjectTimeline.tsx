
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Plus, PencilIcon, Trash2, AlertTriangle, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format, isPast, formatDistance } from 'date-fns';
import { MilestoneForm } from './MilestoneForm';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProjectMilestones, 
  markMilestoneAsCompleted, 
  deleteProjectMilestone,
  updateMilestoneDocument
} from '@/lib/supabase';
import { uploadDocument } from '@/lib/document'; // Add this import
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TimelineDocumentUploader } from './TimelineDocumentUploader';

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  document_id: string | null;
}

interface ProjectTimelineProps {
  projectId: string;
  status: string;
}

export const ProjectTimeline = ({ projectId, status }: ProjectTimelineProps) => {
  const { role } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);
  const [uploadingMilestoneId, setUploadingMilestoneId] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState<string | null>(null);
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';
  const isProjectActive = status !== 'approved';

  const fetchMilestones = async () => {
    setIsLoading(true);
    try {
      const { milestones, error } = await getProjectMilestones(projectId);
      
      if (error) {
        console.error('Error fetching milestones:', error);
        toast.error('Failed to load project timeline');
      } else {
        setMilestones(milestones as Milestone[]);
      }
    } catch (error) {
      console.error('Error in fetchMilestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const handleAddMilestone = () => {
    setSelectedMilestone(null);
    setIsFormDialogOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsFormDialogOpen(true);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setMilestoneToDelete(milestoneId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMilestone = async () => {
    if (milestoneToDelete) {
      try {
        const { error } = await deleteProjectMilestone(milestoneToDelete);
        if (!error) {
          fetchMilestones();
          toast.success('Milestone deleted successfully');
        } else {
          toast.error('Failed to delete milestone');
        }
      } catch (error) {
        console.error('Error deleting milestone:', error);
        toast.error('An error occurred while deleting milestone');
      } finally {
        setDeleteDialogOpen(false);
        setMilestoneToDelete(null);
      }
    }
  };

  const handleToggleComplete = async (milestoneId: string, currentCompletedStatus: boolean) => {
    try {
      await markMilestoneAsCompleted(milestoneId, !currentCompletedStatus);
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone status:', error);
    }
  };

  const handleFileUpload = async (milestoneId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingMilestoneId(milestoneId);
    
    try {
      const { document, error } = await uploadDocument(projectId, file);
      
      if (error) {
        throw error;
      }
      
      if (document) {
        const result = await updateMilestoneDocument(milestoneId, document.id);
        if (result.error) {
          throw result.error;
        }
        toast.success('Document uploaded successfully! Waiting for faculty approval.');
        fetchMilestones();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingMilestoneId(null);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleUploadComplete = () => {
    setShowUploader(null);
    fetchMilestones();
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter(m => m.completed_at).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.completed_at) {
      return {
        badge: <Badge variant="success">Completed</Badge>,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      };
    }
    
    if (milestone.document_id && !milestone.completed_at) {
      return {
        badge: <Badge variant="secondary">Pending Approval</Badge>,
        icon: <Clock className="h-5 w-5 text-amber-500" />
      };
    }
    
    if (isPast(new Date(milestone.due_date)) && !milestone.completed_at) {
      return {
        badge: <Badge variant="destructive">Overdue</Badge>,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />
      };
    }
    
    return {
      badge: <Badge variant="outline">Pending</Badge>,
      icon: <Clock className="h-5 w-5 text-gray-400" />
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Timeline</CardTitle>
          <div className="mt-2 flex items-center space-x-2">
            <Progress value={calculateProgress()} className="w-40 h-2" />
            <span className="text-sm text-muted-foreground">{calculateProgress()}% Complete</span>
          </div>
        </div>
        
        {isFaculty && isProjectActive && (
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddMilestone} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <MilestoneForm
                projectId={projectId}
                milestoneId={selectedMilestone?.id}
                initialData={selectedMilestone ? {
                  title: selectedMilestone.title,
                  description: selectedMilestone.description,
                  due_date: new Date(selectedMilestone.due_date)
                } : undefined}
                onSuccess={() => {
                  setIsFormDialogOpen(false);
                  fetchMilestones();
                }}
                onCancel={() => setIsFormDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No milestones have been created for this project yet.</p>
            {isFaculty && isProjectActive && (
              <Button onClick={handleAddMilestone} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-1" />
                Add First Milestone
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6 relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
            
            {milestones.map((milestone, index) => {
              const isCompleted = !!milestone.completed_at;
              const isDue = isPast(new Date(milestone.due_date)) && !isCompleted;
              const hasDocument = !!milestone.document_id;
              const status = getMilestoneStatus(milestone);
              const isUploading = uploadingMilestoneId === milestone.id;
              const isShowingUploader = showUploader === milestone.id;
              
              return (
                <div key={milestone.id} className="relative pl-8">
                  <div className={`absolute left-[14px] h-3 w-3 rounded-full mt-1.5 transform -translate-x-1/2 ${
                    isCompleted ? 'bg-green-500' : hasDocument ? 'bg-amber-500' : isDue ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{milestone.title}</h4>
                        <div className="flex items-center mt-1 space-x-3">
                          {status.badge}
                          <span className="text-sm text-muted-foreground">
                            Due: {format(new Date(milestone.due_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        
                        {milestone.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed {formatDistance(new Date(milestone.completed_at), new Date(), { addSuffix: true })}
                          </p>
                        )}
                        
                        {!milestone.completed_at && isPast(new Date(milestone.due_date)) && (
                          <p className="text-xs text-red-500 mt-1">
                            Overdue by {formatDistance(new Date(milestone.due_date), new Date())}
                          </p>
                        )}
                        
                        {milestone.description && (
                          <p className="text-sm mt-2">{milestone.description}</p>
                        )}

                        {isShowingUploader && isStudent && isProjectActive && !isCompleted && !hasDocument && (
                          <div className="mt-3 border rounded p-3 bg-background">
                            <TimelineDocumentUploader 
                              projectId={projectId} 
                              milestoneId={milestone.id}
                              onUploadComplete={handleUploadComplete}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {isStudent && isProjectActive && !isCompleted && !hasDocument && !isShowingUploader && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUploader(milestone.id)}
                            className="gap-1"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Button>
                        )}

                        {isShowingUploader && !hasDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUploader(null)}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {isStudent && isProjectActive && isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Completed
                          </Button>
                        )}
                        
                        {isStudent && isProjectActive && !isCompleted && hasDocument && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            <Clock className="h-4 w-4 mr-2 text-amber-500" />
                            Awaiting Approval
                          </Button>
                        )}
                        
                        {isFaculty && isProjectActive && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMilestone(milestone)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            {hasDocument && !isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleComplete(milestone.id, isCompleted)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            )}
                            {isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleComplete(milestone.id, isCompleted)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Revoke Approval
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this milestone from the project timeline.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMilestone} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
