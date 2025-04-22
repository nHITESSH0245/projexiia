
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { TaskList } from "../tasks/TaskList";
import { Button } from "../ui/button";
import { UserRole } from "@/types";

export interface ProjectType {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface ProjectListProps {
  projects: ProjectType[];
  userRole: UserRole;
}

export function ProjectList({ projects, userRole }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  if (projects.length === 0) {
    return (
      <div className="text-center text-muted-foreground">No projects yet.</div>
    );
  }

  console.log("Rendering ProjectList with projects:", projects);

  return (
    <div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {projects.map(project => (
          <Card 
            key={project.id}
            className={`cursor-pointer group ${selectedProject?.id === project.id ? "border-primary" : ""}`}
            onClick={() => setSelectedProject(project)}
          >
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
              <div className="mt-1 text-xs text-muted-foreground">
                Status: {project.status}
              </div>
            </CardHeader>
            <CardContent>
              <Button size="sm" onClick={e => { e.stopPropagation(); setSelectedProject(project); }}>
                View Tasks
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedProject && (
        <div className="mt-6">
          <TaskList projectId={selectedProject.id} userRole={userRole} />
        </div>
      )}
    </div>
  );
}
