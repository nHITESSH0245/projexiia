
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewTaskDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

export function NewTaskDialog({ projectId, open, onOpenChange, onTaskCreated }: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !dueDate) {
      toast({ title: "Missing info", description: "Enter all fields", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from("tasks").insert([
      {
        project_id: projectId,
        title,
        description,
        status: "todo",
        priority,
        due_date: dueDate,
      }
    ]);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created!", variant: "success" });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      onOpenChange(false);
      onTaskCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full px-2 py-2 border rounded"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
