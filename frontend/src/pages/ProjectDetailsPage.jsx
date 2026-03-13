import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { TaskBoard } from "../components/TaskBoard";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { FileUploader } from "../components/FileUploader";
import { FileList } from "../components/FileList";
import { ChatWindow } from "../components/ChatWindow";

const TABS = ["Files", "Messages", "Tasks"];

function TabBar({ active, setActive, tasks, files, messages }) {
  const counts = { Files: files.length, Messages: messages, Tasks: tasks.length };
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/50 p-1">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setActive(t)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            active === t
              ? "bg-slate-800 text-slate-100 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t}
          {counts[t] > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              active === t ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-600"
            }`}>
              {counts[t]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function SkeletonLine({ w = "w-full", h = "h-4" }) {
  return <div className={`animate-pulse rounded ${h} ${w} bg-slate-800`} />;
}

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Files");

  useEffect(() => {
    api
      .get(`/projects/${id}/`)
      .then((r) => setProject(r.data))
      .catch(() => navigate("/projects", { replace: true }))
      .finally(() => setLoading(false));
  }, [api, id, navigate]);

  useEffect(() => {
    api
      .get("/tasks/", { params: { project: id } })
      .then((r) => {
        const d = r.data;
        setTasks(Array.isArray(d) ? d : d.results ?? []);
      })
      .finally(() => setTasksLoading(false));
  }, [api, id]);

  useEffect(() => {
    api
      .get(`/files/project/${id}/`)
      .then((r) => {
        const d = r.data;
        setFiles(Array.isArray(d) ? d : d.results ?? []);
      })
      .finally(() => setFilesLoading(false));
  }, [api, id]);

  const handleFileUploaded = useCallback((f) => setFiles((p) => [f, ...p]), []);

  const handleStatusChange = async (e) => {
    setUpdatingStatus(true);
    try {
      const r = await api.patch(`/projects/${id}/`, { status: e.target.value });
      setProject(r.data);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateTask = async (data, resetForm) => {
    setCreatingTask(true);
    try {
      const r = await api.post("/tasks/", {
        project: id,
        title: data.title,
        description: data.description,
        due_date: data.due_date || null,
      });
      setTasks((p) => [r.data, ...p]);
      resetForm();
      setTaskModalOpen(false);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (task, status) => {
    const prev = task.status;
    setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const r = await api.patch(`/tasks/${task.id}/`, { status });
      setTasks((p) => p.map((t) => (t.id === task.id ? r.data : t)));
    } catch {
      setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, status: prev } : t)));
    }
  };

  const handleTaskDelete = async (task) => {
    const current = tasks;
    setTasks((p) => p.filter((t) => t.id !== task.id));
    try { await api.delete(`/tasks/${task.id}/`); }
    catch { setTasks(current); }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonLine w="w-24" h="h-3" />
        <SkeletonLine w="w-48" h="h-7" />
        <SkeletonLine w="w-64" h="h-4" />
        <div className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
      </div>
    );
  }

  if (!project) return null;

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Projects
      </button>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {project.client_name && (
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {project.client_name}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{project.title}</h1>
          {project.description && (
            <p className="max-w-xl text-sm text-slate-400">{project.description}</p>
          )}
        </div>

        {/* Inline status toggle + chips */}
        <div className="flex shrink-0 items-center gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={updatingStatus || project.status === opt.value}
              onClick={() => handleStatusChange({ target: { value: opt.value } })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                project.status === opt.value
                  ? opt.value === "completed"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "border-sky-500/40 bg-sky-500/15 text-sky-400"
                  : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
              } disabled:cursor-default`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <TabBar
        active={activeTab}
        setActive={setActiveTab}
        tasks={tasks}
        files={files}
        messages={0}
      />

      {/* Tab content */}
      {activeTab === "Files" && (
        <div className="space-y-3">
          <FileUploader projectId={id} onUploaded={handleFileUploaded} />
          <FileList files={files} loading={filesLoading} />
        </div>
      )}

      {activeTab === "Messages" && (
        <ChatWindow projectId={id} senderType="freelancer" />
      )}

      {activeTab === "Tasks" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500/80"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New task
            </button>
          </div>
          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-12 animate-pulse rounded-xl bg-slate-800/50" />
              ))}
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onStatusChange={handleTaskStatusChange}
              onDelete={handleTaskDelete}
            />
          )}
        </div>
      )}

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onCreate={handleCreateTask}
        loading={creatingTask}
      />
    </div>
  );
}
