
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, MessageSquare, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistance } from 'date-fns';
import { Project, Task } from '@/types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/projects/TaskForm';
import { FeedbackForm } from '@/components/projects/FeedbackForm';
import { FeedbackList } from '@/components/projects/FeedbackList';
import { DocumentsList } from '@/components/projects/DocumentsList';
import { DocumentUploader } from '@/components/projects/DocumentUploader';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { updateTaskStatus, updateProjectStatus } from '@/lib/supabase';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [documentsRefreshTrigger, setDocumentsRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            tasks(*),
            profiles!projects_student_id_fkey(name, email, avatar_url)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProject(data as Project);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  const refreshProject = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*),
          profiles!projects_student_id_fkey(name, email, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setProject(data as Project);
    } catch (err: any) {
      console.error('Error refreshing project:', err);
      toast.error('Failed to refresh project data');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    try {
      const { task, error } = await updateTaskStatus(taskId, status);
      
      if (error) {
        throw error;
      }
      
      toast.success('Task status updated');
      refreshProject();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const handleUpdateProjectStatus = async (status: 'pending' | 'in_review' | 'changes_requested' | 'approved') => {
    setIsUpdatingStatus(true);
    try {
      const { project: updatedProject, error } = await updateProjectStatus(id!, status);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Project is now ${status.replace('_', ' ')}`);
      refreshProject();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update project status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitForReview = () => {
    handleUpdateProjectStatus('in_review');
  };

  const handleDocumentUploadComplete = () => {
    setDocumentsRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || 'Project not found'}</p>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_review':
        return <Badge variant="secondary">In Review</Badge>;
      case 'changes_requested':
        return <Badge variant="destructive">Changes Requested</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRelativeTime = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  const sortedTasks = project.tasks && Array.isArray(project.tasks)
    ? [...project.tasks].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
    : [];

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center mt-2 space-x-2">
                {getStatusBadge(project.status)}
                <p className="text-sm text-muted-foreground">
                  Created {getRelativeTime(project.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {role === 'faculty' && (
                <>
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <TaskForm 
                        projectId={project.id} 
                        onSuccess={() => {
                          setIsTaskDialogOpen(false);
                          refreshProject();
                        }}
                        onCancel={() => setIsTaskDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <FeedbackForm 
                        projectId={project.id}
                        taskId={selectedTaskId}
                        onSuccess={() => {
                          setIsFeedbackDialogOpen(false);
                          setSelectedTaskId(undefined);
                          refreshProject();
                        }}
                        onCancel={() => {
                          setIsFeedbackDialogOpen(false);
                          setSelectedTaskId(undefined);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {project.status !== 'approved' && (
                    <Select 
                      value={project.status} 
                      onValueChange={(value) => handleUpdateProjectStatus(value as any)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="changes_requested">Request Changes</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
              
              {role === 'student' && project.status === 'pending' && (
                <Button onClick={handleSubmitForReview} disabled={isUpdatingStatus}>
                  Submit for Review
                </Button>
              )}
              
              {role === 'student' && project.status === 'changes_requested' && (
                <Button onClick={() => handleUpdateProjectStatus('in_review')} disabled={isUpdatingStatus}>
                  Resubmit Project
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{project.description}</p>
              </CardContent>
            </Card>
            
            {role === 'student' && (
              <DocumentUploader 
                projectId={project.id}
                onUploadComplete={handleDocumentUploadComplete}
              />
            )}
            
            <DocumentsList 
              projectId={project.id} 
              refreshTrigger={documentsRefreshTrigger}
            />
            
            {/* Add Project Timeline component */}
            <ProjectTimeline 
              projectId={project.id} 
              status={project.status} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Tasks assigned to this project</CardDescription>
              </CardHeader>
              <CardContent>
                {sortedTasks.length === 0 ? (
                  <p className="text-muted-foreground">No tasks have been assigned to this project yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sortedTasks.map((task: Task) => (
                      <Card key={task.id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                            
                            {role === 'student' && (
                              <div className="mt-3">
                                <Select 
                                  value={task.status} 
                                  onValueChange={(value) => handleUpdateTaskStatus(task.id, value as any)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge
                              variant={
                                task.priority === 'high'
                                  ? 'destructive'
                                  : task.priority === 'medium'
                                  ? 'default'
                                  : 'outline'
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'success'
                                  : task.status === 'in_progress'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                            
                            {role === 'faculty' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTaskId(task.id);
                                  setIsFeedbackDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Feedback
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <FeedbackList projectId={project.id} />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {project.profiles?.name || 'Unknown'}</p>
                  <p><span className="font-medium">Email:</span> {project.profiles?.email || 'No email'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-medium">Status:</span> {project.status.replace('_', ' ')}</p>
                  <p><span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(project.updated_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Tasks:</span> {project.tasks ? Array.isArray(project.tasks) ? project.tasks.length : 0 : 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
