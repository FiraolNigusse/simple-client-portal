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
    const newStatus = task.status === "done" ? "todo" : "done";
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
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/[0.02] p-6 rounded-[10px] border border-white/5">
        <div>
          <h4 className="text-sm font-semibold text-white">Project Tasks</h4>
          <p className="text-xs text-[#8B93A1] mt-1">{tasks.length} items total</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>Add Task</Button>
      </div>

      <div className="grid gap-3">
        {tasks.map(task => (
          <div key={task.id} className="fin-card flex items-center gap-4 p-4 group transition-all">
            <button 
              onClick={() => handleToggle(task)}
              className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${
                task.status === "done" ? "bg-white border-white text-black" : "border-white/20 hover:border-white/40 bg-transparent"
              }`}
            >
              {task.status === "done" && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold transition-all ${task.status === "done" ? "text-[#8B93A1] line-through opacity-50" : "text-white"}`}>
                {task.title}
              </p>
              {task.description && (
                <p className={`text-xs mt-0.5 line-clamp-1 ${task.status === "done" ? "text-[#8B93A1]/40" : "text-[#8B93A1]"}`}>{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={task.status === "done" ? "success" : "default"}>{task.status === "done" ? "Done" : "Todo"}</Badge>
              <button 
                onClick={() => handleDelete(task.id)}
                className="text-[#8B93A1] hover:text-red-400 transition-all p-1.5 rounded opacity-0 group-hover:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-[10px]">
            <p className="text-sm font-semibold text-white">No tasks yet</p>
            <p className="text-xs text-[#8B93A1] mt-1">Add your first task to get started.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="New Task"
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} loading={loading}>Add Task</Button>
          </div>
        )}
      >
        <form onSubmit={handleCreateTask} className="space-y-6 py-4">
          <Input 
            label="Title" 
            placeholder="e.g. Design review" 
            required 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <Input 
            label="Description" 
            placeholder="Optional details..." 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </form>
      </Modal>
    </div>
  );
}
