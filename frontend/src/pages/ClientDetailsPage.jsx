import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, Skeleton } from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";

export function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.getClientDetails(id),
      api.getProjects()
    ])
    .then(([clientRes, projectRes]) => {
      setClient(clientRes.data);
      const projectList = Array.isArray(projectRes.data) ? projectRes.data : projectRes.data.results || [];
      setProjects(projectList.filter(p => p.client === parseInt(id)));
    })
    .catch(() => navigate("/clients"))
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const portalLink = client?.portal_token 
    ? `${import.meta.env.VITE_APP_URL || window.location.origin}/portal/${client.portal_token}` 
    : "";

  const handleGeneratePortal = async () => {
    setGenerating(true);
    try {
      const r = await api.regeneratePortal(id);
      setClient(r.data);
      toast("Portal link updated!");
    } catch {
      toast("Failed to update link.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalLink);
    toast("Link copied to clipboard!");
  };

  if (loading) return <div className="space-y-6"><Skeleton height="200px" /><Skeleton height="400px" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-2xl font-black text-portal-text uppercase tracking-tight">Client Details</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 flex flex-col items-center text-center p-8">
          <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20 mb-4">
            {client.name[0]}
          </div>
          <h3 className="text-xl font-bold text-portal-text">{client.name}</h3>
          <p className="text-sm text-portal-muted mb-6">{client.company || "Independent"}</p>
          
          <div className="w-full space-y-3 pt-6 border-t border-white/5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-portal-muted">Email</span>
              <span className="text-portal-text">{client.email}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-portal-muted">Client since</span>
              <span className="text-portal-text">{new Date(client.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h4 className="font-black text-portal-text uppercase tracking-widest text-xs">Client Portal</h4>
            <p className="text-[10px] text-portal-muted mt-2 font-medium opacity-60">A secure workspace where this client can view files and invoices.</p>
          </div>
          <div className="p-6">
            {portalLink ? (
              <div className="space-y-4">
                <div className="bg-background border border-white/5 rounded-xl p-4 font-mono text-[10px] text-primary truncate tracking-widest">
                  {portalLink}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-lg">Copy Link</Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(portalLink)} className="rounded-lg">View Portal</Button>
                  <Button variant="ghost" size="sm" className="ml-auto text-portal-muted text-[10px] font-black uppercase tracking-widest" onClick={handleGeneratePortal} loading={generating}>Regenerate Token</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-portal-muted mb-4">No portal has been created for this client yet.</p>
                <Button onClick={handleGeneratePortal} loading={generating}>Enable Client Portal</Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-portal-text uppercase tracking-tight">Client Projects</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.length > 0 ? (
            projects.map(p => (
              <Card key={p.id} className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-portal-text group-hover:text-primary transition-colors">{p.title}</h4>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
                </div>
                <p className="text-xs text-portal-muted line-clamp-1">{p.description || "Project workspace"}</p>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-white/5 rounded-2xl opacity-40">
              <p className="text-portal-muted text-sm font-medium">No projects assigned to this client.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
