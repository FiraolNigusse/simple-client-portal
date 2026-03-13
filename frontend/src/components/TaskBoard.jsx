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
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-slate-800">
        <h4 className="font-bold text-portal-text">Tasks ({tasks.length})</h4>
        <Button size="sm" onClick={() => setModalOpen(true)}>Add Task</Button>
      </div>

      <div className="grid gap-3">
        {tasks.map(task => (
          <Card key={task.id} className="flex items-center gap-4 py-3 border-slate-800/60 hover:border-slate-700 transition-colors">
            <button 
              onClick={() => handleToggle(task)}
              className={`h-5 w-5 rounded border-2 border-slate-700 flex items-center justify-center transition-all ${
                task.status === "completed" ? "bg-accent border-accent text-white" : "hover:border-primary"
              }`}
            >
              {task.status === "completed" && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold transition-all ${task.status === "completed" ? "text-portal-muted line-through" : "text-portal-text"}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-portal-muted line-clamp-1">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={task.status === "completed" ? "success" : "default"}>{task.status}</Badge>
              <button 
                onClick={() => handleDelete(task.id)}
                className="text-portal-muted hover:text-portal-error transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="py-12 text-center text-portal-muted text-sm italic">
            No tasks found. Get started by adding one!
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
