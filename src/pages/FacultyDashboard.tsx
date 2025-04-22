
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { Users, ClipboardCheck, Search, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Placeholder data - would be fetched from API in a real application
  const mockStudentProjects = [];
  const mockReviewRequests = [];
  
  const handleViewAllProjects = () => {
    // Will be implemented in Phase 2
    console.log('View all projects');
  };

  return (
    <Layout>
      <div className="container py-6 max-w-7xl mx-auto px-4 md:px-6">
        <DashboardHeader
          title={`Welcome, ${user?.name}!`}
          description="Monitor student projects and provide feedback"
          className="mb-6"
        >
          <Button onClick={handleViewAllProjects}>
            <Search className="mr-2 h-4 w-4" />
            View All Projects
          </Button>
        </DashboardHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Summary Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Reviews
                  </CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Project Completion
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Recently updated student projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockStudentProjects.length === 0 ? (
                    <EmptyState
                      title="No projects yet"
                      description="Student projects will appear here once created"
                      icon={ClipboardCheck}
                    />
                  ) : (
                    <div>Project list will appear here</div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                  <CardDescription>Projects waiting for your feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  {mockReviewRequests.length === 0 ? (
                    <EmptyState
                      title="No pending reviews"
                      description="You're all caught up!"
                      icon={Search}
                    />
                  ) : (
                    <div>Reviews list will appear here</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>All Student Projects</CardTitle>
                <CardDescription>View and monitor all student projects</CardDescription>
              </CardHeader>
              <CardContent>
                {mockStudentProjects.length === 0 ? (
                  <EmptyState
                    title="No projects yet"
                    description="Student projects will appear here once created"
                    icon={ClipboardCheck}
                  />
                ) : (
                  <div>Project list will appear here</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Review Requests</CardTitle>
                <CardDescription>Manage student submissions requiring your feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No review requests"
                  description="Review requests from students will appear here"
                  icon={Search}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Student Roster</CardTitle>
                <CardDescription>View and manage students</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No students registered yet"
                  description="Student information will appear here once they register"
                  icon={Users}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
