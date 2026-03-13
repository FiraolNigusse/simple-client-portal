import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { TaskBoard } from "../components/TaskBoard";
import { CreateTaskModal } from "../components/CreateTaskModal";

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${id}/`)
      .then((response) => {
        setProject(response.data);
      })
      .catch(() => {
        navigate("/projects", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api, id, navigate]);

  useEffect(() => {
    api
      .get("/tasks/", { params: { project: id } })
      .then((response) => {
        setTasks(response.data);
      })
      .finally(() => {
        setTasksLoading(false);
      });
  }, [api, id]);

  const handleStatusChange = async (event) => {
    const status = event.target.value;
    setUpdatingStatus(true);
    try {
      const response = await api.patch(`/projects/${id}/`, { status });
      setProject(response.data);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateTask = async (data, resetForm) => {
    setCreatingTask(true);
    try {
      const payload = {
        project: id,
        title: data.title,
        description: data.description,
        due_date: data.due_date || null
      };
      const response = await api.post("/tasks/", payload);
      setTasks((prev) => [response.data, ...prev]);
      resetForm();
      setTaskModalOpen(false);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (task, status) => {
    const previous = task.status;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
    try {
      const response = await api.patch(`/tasks/${task.id}/`, { status });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? response.data : t))
      );
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: previous } : t))
      );
    }
  };

  const handleTaskDelete = async (task) => {
    const current = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.delete(`/tasks/${task.id}/`);
    } catch {
      setTasks(current);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading project...</p>;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="text-xs text-slate-400 hover:text-slate-200"
      >
        ← Back to projects
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          {project.title}
        </h1>
        {project.description && (
          <p className="text-sm text-slate-300 max-w-2xl">
            {project.description}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-100">
              Project status
            </p>
            <p className="text-xs text-slate-400">
              Update the current state of this project.
            </p>
          </div>
          <select
            value={project.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 outline-none ring-emerald-500/20 focus:ring"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-100">
              Tasks
            </p>
            <p className="text-xs text-slate-400">
              Organize work for this project in a simple kanban board.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="inline-flex items-center rounded-md bg-emerald-500/80 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400/80"
          >
            New task
          </button>
        </div>
        {tasksLoading ? (
          <p className="text-sm text-slate-400">Loading tasks...</p>
        ) : (
          <TaskBoard
            tasks={tasks}
            onStatusChange={handleTaskStatusChange}
            onDelete={handleTaskDelete}
          />
        )}
      </div>

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreate={handleCreateTask}
        loading={creatingTask}
      />
    </div>
  );
}

