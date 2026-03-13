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
      api.getProjects() // We'll filter this manually for simplicity now
    ])
    .then(([clientRes, projectRes]) => {
      setClient(clientRes.data);
      setProjects(projectRes.data.filter(p => p.client === parseInt(id)));
    })
    .catch(() => navigate("/clients"))
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleGeneratePortal = async () => {
    setGenerating(true);
    try {
      const r = await api.generatePortal(id);
      setClient({ ...client, portal_link: r.data.portal_link });
      toast("Portal link generated!");
    } catch {
      toast("Failed to generate link.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(client.portal_link);
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
        <h2 className="text-2xl font-bold text-portal-text">Client Details</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 flex flex-col items-center text-center p-8">
          <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20 mb-4">
            {client.name[0]}
          </div>
          <h3 className="text-xl font-bold text-portal-text">{client.name}</h3>
          <p className="text-sm text-portal-muted mb-6">{client.company || "Independent"}</p>
          
          <div className="w-full space-y-3 pt-6 border-t border-slate-800">
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
          <div className="p-6 border-b border-slate-800 bg-surface/50">
            <h4 className="font-bold text-portal-text">Client Portal</h4>
            <p className="text-xs text-portal-muted mt-1">A secure workspace where this client can view files and invoices.</p>
          </div>
          <div className="p-6">
            {client.portal_link ? (
              <div className="space-y-4">
                <div className="bg-background border border-slate-800 rounded-lg p-3 font-mono text-xs text-primary truncate">
                  {client.portal_link}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>Copy Link</Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(client.portal_link)}>View Portal</Button>
                  <Button variant="ghost" size="sm" className="ml-auto text-portal-muted" onClick={handleGeneratePortal} loading={generating}>Regenerate</Button>
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
        <h3 className="text-lg font-bold text-portal-text">Client Projects</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.length > 0 ? (
            projects.map(p => (
              <Card key={p.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-portal-text">{p.title}</h4>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
                </div>
                <p className="text-xs text-portal-muted line-clamp-1">{p.description || "Project workspace"}</p>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-portal-muted text-sm">No projects assigned to this client.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
