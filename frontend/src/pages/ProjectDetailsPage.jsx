import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  if (loading) {
    return <p className="text-sm text-slate-400">Loading project...</p>;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-4">
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
    </div>
  );
}

