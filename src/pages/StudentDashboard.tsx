
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ClipboardCheck, Users } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentProjects, getStudentAnalytics } from '@/lib/supabase';
import { Project, Analytics } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch projects
      const { projects, error: projectsError } = await getStudentProjects();
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast.error('Failed to load projects');
      } else {
        setProjects(projects);
      }
      
      // Fetch analytics
      const { analytics, error: analyticsError } = await getStudentAnalytics();
      
      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
      } else {
        setAnalytics(analytics);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectCreated = () => {
    setIsProjectDialogOpen(false);
    fetchData();
    toast.success('Project created successfully');
  };

  const handleCreateProject = () => {
    setIsProjectDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <DashboardHeader
          title={`Welcome, ${user?.name || 'Student'}!`}
          description="Manage your projects and track your progress"
          className="mb-6"
        >
          <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <ProjectForm 
                onSuccess={handleProjectCreated} 
                onCancel={() => setIsProjectDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </DashboardHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {analytics && <AnalyticsOverview analytics={analytics} role="student" />}
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-full">
                    <CardHeader>
                      <CardTitle>Your Projects</CardTitle>
                      <CardDescription>
                        Recent projects you're working on
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projects.length === 0 ? (
                        <EmptyState
                          title="No projects yet"
                          description="Create your first project to get started"
                          icon={ClipboardCheck}
                          action={{
                            label: "Create Project",
                            onClick: handleCreateProject
                          }}
                        />
                      ) : (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {projects.slice(0, 6).map((project) => (
                            <ProjectCard key={project.id} project={project} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="projects" className="animate-fade-in">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>
                    Manage and track all your projects
                  </CardDescription>
                </div>
                <Button onClick={handleCreateProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
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
                    icon={ClipboardCheck}
                    action={{
                      label: "Create Project",
                      onClick: handleCreateProject
                    }}
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="teams" className="animate-fade-in">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Teams</CardTitle>
                  <CardDescription>
                    Collaborate with others on team projects
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No teams yet"
                  description="Create or join a team to collaborate with others"
                  icon={Users}
                  action={{
                    label: "Create Team",
                    onClick: () => console.log("Create team clicked")
                  }}
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
