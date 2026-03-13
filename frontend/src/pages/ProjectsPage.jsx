import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { ProjectCard } from "../components/ProjectCard";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { useToast } from "../context/ToastContext";

export function ProjectsPage() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api
      .get("/projects/")
      .then((response) => {
        setProjects(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api]);

  const handleCreateProject = async (data, resetForm) => {
    setCreating(true);
    try {
      const payload = { client: data.client, title: data.title, description: data.description };
      const response = await api.post("/projects/", payload);
      setProjects((prev) => [response.data, ...prev]);
      resetForm();
      setModalOpen(false);
      toast("Project created!");
    } catch {
      toast("Failed to create project.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Projects
          </h1>
          <p className="text-sm text-slate-400">
            Track work you are doing for each client.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-md bg-emerald-500/80 px-3 py-2 text-xs font-medium text-slate-900 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400/80"
        >
          New project
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-slate-400">
          You don&apos;t have any projects yet. Create your first one to get
          started.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
        loading={creating}
      />
    </div>
  );
}

