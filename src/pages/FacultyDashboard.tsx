import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { Users, ClipboardCheck, Search, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getAllProjects } from '@/lib/project';
import { Project } from '@/types';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewRequests, setReviewRequests] = useState<Project[]>([]);
  
  const fetchData = async () => {
    setIsLoading(true);
    const { projects, error } = await getAllProjects();
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(projects);
      
      // Filter projects that need review
      const pending = projects.filter(
        project => project.status === 'in_review' || project.status === 'pending'
      );
      setReviewRequests(pending);
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleViewAllProjects = () => {
    setActiveTab('projects');
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
                  <div className="text-2xl font-bold">{projects.length}</div>
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
                  <div className="text-2xl font-bold">{reviewRequests.length}</div>
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
                  <div className="text-2xl font-bold">
                    {new Set(projects.map(p => p.student_id)).size}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {projects.length ? 
                      Math.round((projects.filter(p => p.status === 'approved').length / projects.length) * 100)
                      : 0}%
                  </div>
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
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : projects.length === 0 ? (
                    <EmptyState
                      title="No projects yet"
                      description="Student projects will appear here once created"
                      icon={ClipboardCheck}
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
                  <CardTitle>Pending Reviews</CardTitle>
                  <CardDescription>Projects waiting for your feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : reviewRequests.length === 0 ? (
                    <EmptyState
                      title="No pending reviews"
                      description="You're all caught up!"
                      icon={Search}
                    />
                  ) : (
                    <div className="space-y-3">
                      {reviewRequests.slice(0, 5).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-muted-foreground">
                              By {project.profiles?.name || 'Unknown student'}
                            </p>
                          </div>
                          <Link to={`/projects/${project.id}`}>
                            <Button size="sm">Review</Button>
                          </Link>
                        </div>
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
                <CardTitle>All Student Projects</CardTitle>
                <CardDescription>View and monitor all student projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <EmptyState
                    title="No projects yet"
                    description="Student projects will appear here once created"
                    icon={ClipboardCheck}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Title</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{project.profiles?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                project.status === 'approved'
                                  ? 'success'
                                  : project.status === 'changes_requested'
                                  ? 'destructive'
                                  : project.status === 'in_review'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.tasks ? Array.isArray(project.tasks) ? project.tasks.length : 0 : 0}
                          </TableCell>
                          <TableCell>
                            {new Date(project.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm">
                              <Link to={`/projects/${project.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : reviewRequests.length === 0 ? (
                  <EmptyState
                    title="No review requests"
                    description="Review requests from students will appear here"
                    icon={Search}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Title</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewRequests.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{project.profiles?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                project.status === 'in_review'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(project.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm">
                              <Link to={`/projects/${project.id}`}>Review</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <EmptyState
                    title="No students registered yet"
                    description="Student information will appear here once they register"
                    icon={Users}
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(
                        new Map(
                          projects.map(project => [
                            project.student_id,
                            {
                              id: project.student_id,
                              name: project.profiles?.name || 'Unknown',
                              email: project.profiles?.email || 'No email',
                              projectCount: projects.filter(p => p.student_id === project.student_id).length
                            }
                          ])
                        ).values()
                      ).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.projectCount}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" disabled>
                              View Projects
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
