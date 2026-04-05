import { useState } from "react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";

export function TaskBoard({ tasks, setTasks, projectId }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const api = useApi();
  const toast = useToast();

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/tasks/", { ...formData, project: projectId });
      setTasks([res.data, ...tasks]);
      setModalOpen(false);
      setFormData({ title: "", description: "" });
      toast("Task added!");
    } catch {
      toast("Failed to add task.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await api.patch(`/tasks/${task.id}/`, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch {
      toast("Update failed.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
      toast("Task removed.");
    } catch {
      toast("Delete failed.", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 aurora-glow">
        <div>
          <h4 className="font-bold text-portal-text">Project Tasks</h4>
          <p className="text-[10px] text-portal-muted uppercase font-black tracking-widest mt-0.5">{tasks.length} Action Items</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)} className="rounded-xl px-5">Add Task</Button>
      </div>

      <div className="grid gap-3">
        {tasks.map(task => (
          <Card key={task.id} className="flex items-center gap-4 py-3.5 border-white/5 hover:border-primary/50 transition-all group hover:shadow-[0_0_20px_var(--primary-glow)]">
            <button 
              onClick={() => handleToggle(task)}
              className={`h-6 w-6 rounded-lg border-2 border-white/10 flex items-center justify-center transition-all ${
                task.status === "completed" ? "bg-primary border-primary text-white shadow-[0_0_10px_var(--primary-glow)]" : "hover:border-primary bg-white/5"
              }`}
            >
              {task.status === "completed" && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold transition-all ${task.status === "completed" ? "text-portal-muted/40 line-through" : "text-portal-text group-hover:text-primary transition-colors"}`}>
                {task.title}
              </p>
              {task.description && (
                <p className={`text-xs mt-0.5 line-clamp-1 ${task.status === "completed" ? "text-portal-muted/20" : "text-portal-muted font-medium"}`}>{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={task.status === "completed" ? "success" : "default"}>{task.status === "completed" ? "Done" : "To Do"}</Badge>
              <button 
                onClick={() => handleDelete(task.id)}
                className="text-portal-muted/30 hover:text-portal-error transition-all p-1.5 hover:bg-portal-error/10 rounded-lg opacity-0 group-hover:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[24px]">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-portal-muted">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-black text-portal-text uppercase tracking-widest">No tasks identified</p>
            <p className="text-xs text-portal-muted mt-2">Initialize your workflow by adding the first action item.</p>
          </div>
        )}
      </div>


      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Add Project Task"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} loading={loading}>Add Task</Button>
          </>
        )}
      >
        <form onSubmit={handleCreateTask} className="space-y-4 py-2">
          <Input 
            label="Task Title" 
            placeholder="e.g. Design homepage" 
            required 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <Input 
            label="Description (Optional)" 
            placeholder="What needs to be done?" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}
