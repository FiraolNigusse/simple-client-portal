import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import { CreateProjectModal } from "../components/CreateProjectModal";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    api.getProjects()
      .then((projRes) => {
        setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data.results || []);
      })
      .catch(() => toast("Failed to load projects.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (formData, onSuccess) => {
    setCreating(true);
    try {
      const res = await api.createProject(formData);
      setProjects([res.data, ...projects]);
      setModalOpen(false);
      onSuccess();
      toast("Project created!");
    } catch (err) {
      toast("Error creating project.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Projects</h2>
          <p className="text-sm text-[#8B93A1]">Track your active work and deliverables.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
            <div key={project.id} className="fin-card p-6 flex flex-col cursor-pointer transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="mb-4 flex items-center justify-between">
                <Badge variant={project.status === "active" ? "success" : "default"}>
                  {project.status.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-[#8B93A1]">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold tracking-tight text-white mb-1">{project.title}</h3>
              <p className="text-xs text-[#8B93A1] mb-4">{project.client_name}</p>
              
              <p className="line-clamp-2 text-sm text-[#8B93A1] mb-6 min-h-[40px]">
                {project.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-medium text-[#8B93A1]">
                    {project.client_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[11px] text-[#8B93A1] font-medium">Details</span>
                </div>
                <svg className="h-3.5 w-3.5 text-[#8B93A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fin-card flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 rounded-full bg-white/[0.02] p-6 text-[#8B93A1]">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white">No projects found</h3>
          <p className="max-w-xs text-sm text-[#8B93A1] mt-2 mb-8">Create a project for one of your clients to start sharing files and tasks.</p>
          <Button onClick={() => setModalOpen(true)}>Create Your First Project</Button>
        </div>
      )}

      <CreateProjectModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onCreate={handleCreate} 
        loading={creating} 
      />
    </div>
  );
}

