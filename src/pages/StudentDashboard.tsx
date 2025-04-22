import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { FolderPlus, Calendar, BarChart3, List, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";
import { ProjectList } from '@/components/projects/ProjectList';
import { NewProjectDialog } from '@/components/projects/NewProjectDialog';

const StudentDashboard = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);

  // Fetch projects for student
  const fetchProjects = async () => {
    if (!user?.id) return;
    
    setLoadingProjects(true);
    console.log("Fetching projects for user ID:", user.id);
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      console.log("Projects fetched:", data);
      setProjects(data ?? []);
    }
    
    setLoadingProjects(false);
  };

  useEffect(() => {
    if (user?.id) fetchProjects();
  }, [user?.id]);

  const handleNewProject = () => setShowNewProject(true);

  // Dummy summary card counts for now, but show real project count
  const projectCount = projects.length;
  const approvedCount = projects.filter((p: any) => p.status === "approved").length;

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <DashboardHeader
          title={`Welcome, ${user?.name}!`}
          description="Manage your projects and tasks"
          className="mb-6"
        >
          <Button onClick={handleNewProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Project
          </Button>
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
                  <div className="text-2xl font-bold">{projectCount}</div>
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
                  <div className="text-2xl font-bold">0</div>
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
                  <div className="text-2xl font-bold">{approvedCount}</div>
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
                  <div className="text-2xl font-bold">0</div>
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
                  {loadingProjects ? (
                    <div>Loading...</div>
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
                    <ProjectList projects={projects} userRole={role || "student"} />
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No upcoming tasks"
                    description="You're all caught up!"
                    icon={Calendar}
                  />
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
                {loadingProjects ? (
                  <div>Loading...</div>
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
                  <ProjectList projects={projects} userRole={role || "student"} />
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
                <EmptyState
                  title="No tasks yet"
                  description="Tasks assigned by faculty will appear here"
                  icon={List}
                />
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
        <NewProjectDialog
          open={showNewProject}
          onOpenChange={setShowNewProject}
          onProjectCreated={fetchProjects}
        />
      </div>
    </Layout>
  );
};

export default StudentDashboard;
