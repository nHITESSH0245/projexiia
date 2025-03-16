
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { LucideShapes, ArrowRight, GraduationCap, Users, ClipboardCheck, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <section className="py-20 px-4 md:py-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <LucideShapes className="w-4 h-4" />
                <span>Introducing Projexia</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Project Management <br /> Made <span className="text-primary">Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                A seamless platform for students and faculty to collaborate on projects,
                track progress, and achieve academic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link to="/auth/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="w-full h-[400px] bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="glass p-6 rounded-xl shadow-lg max-w-md mx-auto">
                  <div className="text-center">
                    <LucideShapes className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Projexia Dashboard</h3>
                    <p className="text-muted-foreground mb-4">Streamlined project management for academia</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-background p-3 rounded-lg flex items-center gap-2">
                        <ClipboardCheck className="text-primary h-5 w-5" />
                        <span>Track Projects</span>
                      </div>
                      <div className="bg-background p-3 rounded-lg flex items-center gap-2">
                        <Calendar className="text-primary h-5 w-5" />
                        <span>Set Deadlines</span>
                      </div>
                      <div className="bg-background p-3 rounded-lg flex items-center gap-2">
                        <GraduationCap className="text-primary h-5 w-5" />
                        <span>Student View</span>
                      </div>
                      <div className="bg-background p-3 rounded-lg flex items-center gap-2">
                        <Users className="text-primary h-5 w-5" />
                        <span>Faculty Access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed to streamline project management for academic environments
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            <div className="bg-background p-6 rounded-xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Projects</h3>
              <p className="text-muted-foreground">
                Create and manage projects, upload documents, and track progress effortlessly.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Faculty Access</h3>
              <p className="text-muted-foreground">
                Faculty can view all student projects without manual assignments and provide feedback.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeline Management</h3>
              <p className="text-muted-foreground">
                Faculty can set timelines for project tasks, which are visible to students.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Priority Tasks</h3>
              <p className="text-muted-foreground">
                Students can view tasks scheduled based on priority on their dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join Projexia today and transform how you manage academic projects
            </p>
            <Button size="lg" asChild>
              <Link to="/auth/register">
                Create an Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
