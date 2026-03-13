import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { ProjectCard } from "../components/ProjectCard";

function SkeletonLine({ w = "w-full", h = "h-4" }) {
  return <div className={`animate-pulse rounded ${h} ${w} bg-slate-800`} />;
}

export function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy link");

  useEffect(() => {
    api
      .get(`/clients/${id}/`)
      .then((r) => setClient(r.data))
      .catch(() => navigate("/clients", { replace: true }))
      .finally(() => setLoading(false));
  }, [api, id, navigate]);

  useEffect(() => {
    api
      .get("/projects/", { params: { client: id } })
      .then((r) => {
        const d = r.data;
        setProjects(Array.isArray(d) ? d : d.results ?? []);
      })
      .finally(() => setProjectsLoading(false));
  }, [api, id]);

  const handleGeneratePortal = async () => {
    if (!client) return;
    setGenerating(true);
    try {
      const r = await api.post("/clients/portal/generate/", { client_id: client.id });
      setClient(r.data);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!client?.portal_link) return;
    try {
      await navigator.clipboard.writeText(client.portal_link);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy link"), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine w="w-20" h="h-3" />
        <SkeletonLine w="w-40" h="h-7" />
        <SkeletonLine w="w-56" h="h-4" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Clients
      </button>

      {/* Client header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-300">
          {client.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{client.name}</h1>
          <p className="text-sm text-slate-400">
            {client.email}{client.company ? ` · ${client.company}` : ""}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate(`/invoices?client=${client.id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          New invoice
        </button>
      </div>

      {/* Portal link section */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">Client portal</p>
            <p className="text-xs text-slate-500">
              Share a secure link — no account needed for your client.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGeneratePortal}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500/80 disabled:opacity-50"
          >
            {generating ? "Generating…" : client.portal_link ? "Regenerate" : "Generate link"}
          </button>
        </div>

        {client.portal_link && (
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-400">
              {client.portal_link}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              {copyLabel}
            </button>
            <a
              href={client.portal_link}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500 transition-colors"
              title="Open portal"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Projects for this client */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-100">Projects</p>

        {projectsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center">
            <p className="text-xs text-slate-600">No projects for this client yet.</p>
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="mt-2 text-xs text-emerald-500 hover:text-emerald-400"
            >
              Create a project →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => navigate(`/projects/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
