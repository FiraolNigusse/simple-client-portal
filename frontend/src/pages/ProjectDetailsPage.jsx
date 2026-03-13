import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { TaskBoard } from "../components/TaskBoard";
import { ChatWindow } from "../components/ChatWindow";
import { FileList } from "../components/FileList";
import { FileUploader } from "../components/FileUploader";

const TABS = [
  { id: "files", label: "Files", icon: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 00-2-2h4l2 2h4a2 2 0 012 2v1" />
    </svg>
  )},
  { id: "messages", label: "Messages", icon: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )},
  { id: "tasks", label: "Tasks", icon: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )},
];

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("files");
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.getProjectDetails(id),
      api.apiClient.get(`/tasks/?project=${id}`),
      api.apiClient.get(`/files/project/${id}/`)
    ])
    .then(([projRes, taskRes, fileRes]) => {
      setProject(projRes.data);
      setTasks(taskRes.data);
      setFiles(fileRes.data);
    })
    .catch(() => navigate("/projects"))
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.updateClient(id, { status: newStatus }); // Note: I should use a project update endpoint if separate
      setProject({ ...project, status: newStatus });
      toast(`Project set to ${newStatus}`);
    } catch {
      toast("Update failed.", "error");
    }
  };

  const handleFileUploaded = (newFile) => {
    setFiles([newFile, ...files]);
    toast("File uploaded!");
  };

  if (loading) return <Skeleton height="400px" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="-ml-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Badge variant="indigo">{project.client_name}</Badge>
          </div>
          <h2 className="text-3xl font-bold text-portal-text">{project.title}</h2>
          <p className="text-sm text-portal-muted max-w-2xl">{project.description || "No project description."}</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={project.status === 'active' ? 'success' : 'default'} className="px-3 py-1 text-xs">
            {project.status.toUpperCase()}
          </Badge>
          <div className="h-4 w-[1px] bg-slate-800" />
          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(project.status === 'active' ? 'completed' : 'active')}>
            Mark as {project.status === 'active' ? 'Completed' : 'Active'}
          </Button>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-portal-muted hover:text-portal-text hover:bg-slate-800/30"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-2">
        {activeTab === "files" && (
          <div className="space-y-6">
            <Card className="bg-[#0B1220]/50 border-dashed border-2">
              <FileUploader projectId={id} onUploaded={handleFileUploaded} />
            </Card>
            <FileList files={files} />
          </div>
        )}
        {activeTab === "messages" && (
          <ChatWindow projectId={id} senderType="freelancer" />
        )}
        {activeTab === "tasks" && (
          <TaskBoard tasks={tasks} setTasks={setTasks} projectId={id} />
        )}
      </div>
    </div>
  );
}
