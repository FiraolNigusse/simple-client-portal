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
      api.getTasks(id),
      api.getProjectFiles(id)
    ])
    .then(([projRes, taskRes, fileRes]) => {
      setProject(projRes.data);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.results || []);
      setFiles(Array.isArray(fileRes.data) ? fileRes.data : fileRes.data.results || []);
    })
    .catch(() => navigate("/projects"))
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateProject(id, { status: newStatus });
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

  if (loading) return <div className="p-8 space-y-6"><Skeleton height="200px" /><Skeleton height="400px" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="-ml-3 rounded-xl hover:bg-white/5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Badge variant="primary" className="rounded-lg tracking-[0.1em] font-black uppercase text-[10px]">{project.client_name}</Badge>
          </div>
          <h2 className="text-4xl font-black text-portal-text tracking-tighter uppercase">{project.title}</h2>
          <p className="text-sm text-portal-muted max-w-2xl font-medium opacity-80">{project.description || "No project description provided."}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
          <Badge variant={project.status === 'active' ? 'success' : 'default'} className="px-4 py-2 text-[10px] font-black tracking-widest rounded-xl">
            {project.status.toUpperCase()}
          </Badge>
          <div className="h-4 w-[1px] bg-white/10" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleStatusChange(project.status === 'active' ? 'completed' : 'active')}
            className="text-primary hover:bg-primary/10 rounded-xl font-bold"
          >
            Mark as {project.status === 'active' ? 'Completed' : 'Active'}
          </Button>
        </div>
      </div>

      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-portal-muted hover:text-portal-text hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-4">
        {activeTab === "files" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="bg-white/[0.02] border-dashed border-2 border-white/10 p-10 flex flex-col items-center justify-center">
              <FileUploader projectId={id} onUploaded={handleFileUploaded} />
            </Card>
            <FileList files={files} />
          </div>
        )}
        {activeTab === "messages" && (
          <div className="animate-in fade-in duration-500">
            <ChatWindow projectId={id} senderType="freelancer" />
          </div>
        )}
        {activeTab === "tasks" && (
          <div className="animate-in fade-in duration-500">
            <TaskBoard tasks={tasks} setTasks={setTasks} projectId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
