
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { NewTaskDialog } from "./NewTaskDialog";
import { UserRole } from "@/types";

interface TaskType {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
}

interface TaskListProps {
  projectId: string;
  userRole: UserRole;
}

export function TaskList({ projectId, userRole }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!error) setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [projectId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading tasks...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Tasks</div>
        {userRole === "student" && (
          <Button size="sm" onClick={() => setShowNewTask(true)}>New Task</Button>
        )}
      </div>
      {tasks.length === 0 ? (
        <div className="text-muted-foreground">No tasks for this project yet.</div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{task.title}</CardTitle>
                <span className={"text-xs py-1 px-2 rounded " + (
                  task.status === "todo" ? "bg-yellow-100 text-yellow-600" :
                  task.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                  task.status === "completed" ? "bg-green-100 text-green-600" : ""
                )}>
                  {task.status}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{task.description}</div>
                <div className="text-xs mt-1 text-muted-foreground">Due: {task.due_date}</div>
                <div className="text-xs">Priority: {task.priority}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {userRole === "student" && (
        <NewTaskDialog
          projectId={projectId}
          open={showNewTask}
          onOpenChange={setShowNewTask}
          onTaskCreated={fetchTasks}
        />
      )}
    </div>
  );
}
