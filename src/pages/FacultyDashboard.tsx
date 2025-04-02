
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProjects } from '@/lib/supabase';
import { getFacultyAssignedProjects } from '@/lib/facultyAssignment';
import { Project } from '@/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Loader2, UserSearch, ClipboardCheck } from 'lucide-react';
import { AnalyticsOverview } from '@/components/dashboard/AnalyticsOverview';
import { toast } from 'sonner';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all projects for faculty (this may now return fewer projects due to RLS)
      const { projects: allProjects, error: projectsError } = await getAllProjects();
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast.error('Failed to load projects');
      } else {
        setProjects(allProjects || []);
      }
      
      // Fetch projects specifically assigned to this faculty
      const { projects: facultyProjects, error: assignedError } = await getFacultyAssignedProjects();
      
      if (assignedError) {
        console.error('Error fetching assigned projects:', assignedError);
      } else {
        setAssignedProjects(facultyProjects || []);
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

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <DashboardHeader
          title={`Welcome, ${user?.name || 'Faculty'}!`}
          description="Review and manage student projects"
          className="mb-6"
        />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <AnalyticsOverview 
                  totalProjects={projects.length}
                  pendingProjects={projects.filter(p => p.status === 'pending').length}
                  inReviewProjects={projects.filter(p => p.status === 'in_review').length}
                  changesRequestedProjects={projects.filter(p => p.status === 'changes_requested').length}
                  approvedProjects={projects.filter(p => p.status === 'approved').length}
                />
                
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Projects Assigned to You</CardTitle>
                    <CardDescription>
                      Projects that students have assigned for your review
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assignedProjects.length === 0 ? (
                      <EmptyState
                        title="No assigned projects"
                        description="No students have assigned projects for your review yet"
                        icon={UserSearch}
                      />
                    ) : (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {assignedProjects.slice(0, 6).map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="assigned" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Projects Assigned to You</CardTitle>
                <CardDescription>
                  Projects that students have assigned for your review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : assignedProjects.length === 0 ? (
                  <EmptyState
                    title="No assigned projects"
                    description="No students have assigned projects for your review yet"
                    icon={UserSearch}
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {assignedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  All student projects you have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <EmptyState
                    title="No projects available"
                    description="There are no projects available for you to review"
                    icon={ClipboardCheck}
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
