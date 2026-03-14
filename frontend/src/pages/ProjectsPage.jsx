import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge, Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { UpgradeBanner } from "../components/UpgradeBanner";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({ client: "", title: "", description: "" });
  
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.getProjects(), api.getClients()])
      .then(([projRes, clientRes]) => {
        setProjects(projRes.data);
        setClients(clientRes.data);
      })
      .catch(() => toast("Failed to load data.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.client) return toast("Please select a client.", "warning");
    
    setCreating(true);
    setFormError(null);
    try {
      const res = await api.createProject(formData);
      setProjects([res.data, ...projects]);
      setModalOpen(false);
      setFormData({ client: "", title: "", description: "" });
      toast("Project created!");
    } catch (err) {
      if (err.response?.data?.code === "plan_limit_reached") {
        setFormError(err.response.data);
      } else {
        toast("Error creating project.", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Projects</h2>
          <p className="text-sm text-portal-muted font-medium">Track your active work and deliverables.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} height="160px" />)}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project.id} className="group hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="mb-3 flex items-start justify-between">
                <Badge variant={project.status === "active" ? "success" : "default"}>
                  {project.status}
                </Badge>
                <span className="text-[10px] text-portal-muted uppercase tracking-widest font-semibold">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-black tracking-tight text-portal-text group-hover:text-accent transition-colors">{project.title}</h3>
              <p className="text-[10px] text-portal-muted mb-4 font-black uppercase tracking-[0.2em] opacity-60">{project.client_name}</p>
              
              <p className="line-clamp-2 text-sm text-portal-muted mb-6 font-medium">
                {project.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-accent/20 border-2 border-surface flex items-center justify-center text-[10px] font-black text-accent">
                    {project.client_name?.[0]}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-portal-muted font-black uppercase tracking-widest group-hover:text-accent transition-colors">
                  Details
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 text-center border-white/5 bg-surface/30 aurora-glow">
          <div className="mb-8 rounded-[32px] bg-white/5 p-10 text-white/10 shadow-2xl shadow-black/20">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-portal-text uppercase tracking-widest">No Projects Found</h3>
          <p className="max-w-xs text-sm text-portal-muted mb-10 font-medium">Create a project for one of your clients to start sharing files and tasks.</p>
          <Button onClick={() => setModalOpen(true)} size="lg">Create Your First Project</Button>
        </Card>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Start New Project"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Launch Project</Button>
          </>
        )}
      >
        <form onSubmit={handleCreate} className="space-y-4 py-2">
          {formError && (
            <UpgradeBanner 
              resource={formError.resource} 
              limit={formError.limit} 
              plan={formError.plan} 
            />
          )}
          <Select 
            label="Client" 
            required 
            value={formData.client}
            onChange={e => setFormData({...formData, client: e.target.value})}
          >
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
          </Select>
          <Input 
            label="Project Title" 
            placeholder="e.g. Website Redesign" 
            required 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">Description</label>
            <textarea
              className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all focus:bg-white/10 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20 placeholder:text-portal-muted/40"
              placeholder="What are the goals of this project?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
