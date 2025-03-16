
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Project } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const getStatusBadge = () => {
    switch (project.status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'in_review':
        return <Badge variant="secondary"><Pencil className="mr-1 h-3 w-3" /> In Review</Badge>;
      case 'changes_requested':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Changes Requested</Badge>;
      case 'approved':
        return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Created on {formatDate(project.created_at)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-muted-foreground">{project.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
