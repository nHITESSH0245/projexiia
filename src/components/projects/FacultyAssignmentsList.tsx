
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProjectFacultyAssignments, removeFacultyAssignment, FacultyAssignment } from '@/lib/facultyAssignment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FacultyAssignmentForm } from './FacultyAssignmentForm';
import { Loader2, Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistance } from 'date-fns';

interface FacultyAssignmentsListProps {
  projectId: string;
}

export function FacultyAssignmentsList({ projectId }: FacultyAssignmentsListProps) {
  const { role } = useAuth();
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const { assignments, error } = await getProjectFacultyAssignments(projectId);
      if (error) {
        throw error;
      }
      setAssignments(assignments);
    } catch (error) {
      console.error('Error fetching faculty assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [projectId]);

  const handleRemoveAssignment = async (assignmentId: string) => {
    setIsRemoving(assignmentId);
    try {
      const { success, error } = await removeFacultyAssignment(assignmentId);
      if (error) {
        throw error;
      }
      if (success) {
        await fetchAssignments();
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRelativeTime = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Assignments</CardTitle>
        <CardDescription>
          Faculty members assigned to review this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {role === 'student' && (
          <div className="mb-4">
            <FacultyAssignmentForm 
              projectId={projectId} 
              onSuccess={fetchAssignments} 
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No faculty members have been assigned to this project yet.
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{assignment.faculty_email}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getStatusBadge(assignment.status)}
                      <span>Assigned {getRelativeTime(assignment.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {role === 'student' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    disabled={isRemoving === assignment.id}
                  >
                    {isRemoving === assignment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
