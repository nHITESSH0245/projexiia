import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { FolderPlus, Calendar, BarChart3, List, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getStudentProjects } from '@/lib/supabase';
import { Project, Task } from '@/types';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  
  const fetchData = async () => {
    setIsLoading(true);
    const { projects, error } = await getStudentProjects();
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(projects);
      
      const allTasks: Task[] = [];
      projects.forEach(project => {
        if (project.tasks && Array.isArray(project.tasks)) {
          project.tasks.forEach(task => {
            if (task.status !== 'completed') {
              allTasks.push(task);
            }
          });
        }
      });
      
      const sortedTasks = allTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      
      setActiveTasks(sortedTasks);
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleNewProject = () => {
    setIsProjectDialogOpen(true);
  };

  const handleProjectCreated = () => {
    setIsProjectDialogOpen(false);
    fetchData();
  };

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <DashboardHeader
          title={`Welcome, ${user?.name}!`}
          description="Manage your projects and tasks"
          className="mb-6"
        >
          <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewProject}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <ProjectForm 
                onSuccess={handleProjectCreated}
                onCancel={() => setIsProjectDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </DashboardHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <FolderPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Tasks
                  </CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeTasks.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved Projects
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'approved').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Deadlines
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeTasks.filter(t => {
                      const dueDate = new Date(t.due_date);
                      const today = new Date();
                      const diffTime = dueDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7 && diffDays >= 0;
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your most recently updated projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : projects.length === 0 ? (
                    <EmptyState
                      title="No projects yet"
                      description="Create your first project to get started"
                      icon={FolderPlus}
                      action={{
                        label: "New Project",
                        onClick: handleNewProject,
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : activeTasks.length === 0 ? (
                    <EmptyState
                      title="No upcoming tasks"
                      description="You're all caught up!"
                      icon={Calendar}
                    />
                  ) : (
                    <div className="space-y-4">
                      {activeTasks
                        .filter(task => {
                          const dueDate = new Date(task.due_date);
                          const today = new Date();
                          const diffTime = dueDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 7;
                        })
                        .slice(0, 5)
                        .map((task) => (
                          <Card key={task.id} className="p-3">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {task.description}
                                </p>
                              </div>
                              <Badge
                                className="ml-2"
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
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage and track all your projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <EmptyState
                    title="No projects yet"
                    description="Create your first project to get started on your academic journey"
                    icon={FolderPlus}
                    action={{
                      label: "Create Project",
                      onClick: handleNewProject,
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Your Tasks</CardTitle>
                <CardDescription>View and manage your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : activeTasks.length === 0 ? (
                  <EmptyState
                    title="No tasks yet"
                    description="Tasks assigned by faculty will appear here"
                    icon={List}
                  />
                ) : (
                  <div className="space-y-4">
                    {activeTasks.map((task) => (
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
                          </div>
                          <Badge
                            className="ml-2"
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
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Project Calendar</CardTitle>
                <CardDescription>View your deadlines and scheduled tasks</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <EmptyState
                  title="Calendar coming soon"
                  description="Your project timeline will be visible here"
                  icon={Calendar}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
