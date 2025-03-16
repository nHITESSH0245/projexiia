
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, isLoading, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    <>
      {role === 'student' && <StudentDashboard />}
      {role === 'faculty' && <FacultyDashboard />}
    </>
  );
};

export default Dashboard;
