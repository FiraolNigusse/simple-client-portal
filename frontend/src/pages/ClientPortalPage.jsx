import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

// ---------------------------------------------------------------------------
// Portal API helpers — no JWT, just ?token= query param
// ---------------------------------------------------------------------------
const portalGet = (token, path, params = {}) =>
  apiClient.get(`/portal/${token}${path}`, {
    params: { token, ...params },
    headers: { Authorization: undefined },
  });

const portalPost = (token, path, data = {}) =>
  apiClient.post(`/portal/${token}${path}`, data, {
    params: { token },
    headers: { Authorization: undefined },
  });

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function ClientPortalPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProject, setActiveProject] = useState(null);

  const [files, setFiles] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    portalGet(token, "/")
      .then((r) => {
        setData(r.data);
        const first = r.data.projects?.[0];
        if (first) setActiveProject(first);
      })
      .catch(() => setError("Invalid or expired portal link."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!activeProject) return;
    const pid = activeProject.id;
    Promise.all([
      portalGet(token, "/files/", { project: pid }),
      portalGet(token, "/invoices/"),
      portalGet(token, "/tasks/", { project: pid }),
    ]).then(([f, inv, t]) => {
      setFiles(f.data);
      setInvoices(inv.data);
      setTasks(t.data);
    });
  }, [token, activeProject]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-white/5 border-t-accent rounded-full animate-spin" />
            <div className="absolute inset-0 h-20 w-20 border-4 border-transparent border-b-primary rounded-full animate-spin [animation-duration:2s]" />
          </div>
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em] ml-2 animate-pulse">Initializing Workspace</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-32 w-32 rounded-[3rem] bg-portal-error/10 border border-portal-error/20 flex items-center justify-center text-portal-error mb-10 shadow-2xl shadow-portal-error/10 aurora-glow">
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-portal-text mb-4 uppercase tracking-tighter">Gateway Closed</h2>
        <p className="text-portal-muted mb-12 max-w-sm font-medium opacity-80">{error}</p>
        <Button onClick={() => window.location.reload()} size="lg">Verify Access</Button>
      </div>
    );
  }

  const { client, projects } = data ?? {};

  return (
    <div className="min-h-screen bg-background text-portal-text font-sans selection:bg-primary/10">
      <div className="mx-auto max-w-6xl px-8 py-16 space-y-16">
        {/* Portal Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-white/5 pb-16 aurora-glow">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-accent/5">
              Secure Partner Terminal
            </div>
            <h1 className="text-6xl font-black text-portal-text tracking-tighter">{client?.name} <span className="text-accent">.</span></h1>
            <p className="text-xl text-portal-muted font-black uppercase tracking-widest opacity-60">{client?.company || "Project Dashboard"}</p>
          </div>
          <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex items-center gap-8 shadow-3xl shadow-black/80 aurora-border">
            <div className="text-right">
              <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] mb-2 opacity-60">Verified Consultant</p>
              <p className="text-base font-black text-portal-text tracking-tight uppercase">Aurora Workspace</p>
            </div>
            <div className="h-16 w-16 rounded-[20px] bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-2xl shadow-primary/40 p-1">
              <div className="h-full w-full rounded-[19px] bg-sidebar flex items-center justify-center">
                <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar / Project Nav */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">Active Projects</p>
              <div className="space-y-3">
                {projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full text-left px-6 py-5 rounded-[20px] transition-all duration-500 font-black text-xs uppercase tracking-widest ${
                      activeProject?.id === p.id 
                        ? "bg-gradient-to-tr from-primary to-accent text-white shadow-2xl shadow-primary/30 scale-[1.02]" 
                        : "bg-surface/50 border border-white/5 text-portal-muted hover:border-white/10 hover:text-portal-text hover:bg-white/5"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/10 p-6">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Resource Center</h4>
              <p className="text-xs text-portal-muted font-medium leading-relaxed">Need updates or have questions? Use the message board inside each project.</p>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            {activeProject ? (
              <>
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Files Card */}
                  <Card className="md:col-span-2 overflow-hidden shadow-3xl shadow-black/60 bg-surface/50 aurora-glow">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-portal-text flex items-center gap-4 uppercase tracking-tighter">
                        <div className="p-2.5 rounded-xl bg-accent/10">
                          <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 00-2-2h4l2 2h4a2 2 0 012 2v1" />
                          </svg>
                        </div>
                        Shared Assets
                      </h3>
                      <Badge variant="indigo" className="bg-accent/20 text-accent border-accent/20 rounded-lg">{files.length} Files</Badge>
                    </div>
                    <div className="space-y-3">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-5 rounded-[20px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 group">
                          <span className="text-sm font-bold text-portal-text truncate">{file.file_name}</span>
                          <a href={file.file} download className="text-accent hover:text-white text-xs font-black uppercase tracking-[0.1em] transition-colors">Download</a>
                        </div>
                      ))}
                      {files.length === 0 && <p className="text-sm text-portal-muted italic py-10 text-center border-2 border-dashed border-white/5 rounded-[32px] opacity-40">No files shared yet.</p>}
                    </div>
                  </Card>

                  {/* Status Card */}
                  <Card className="md:col-span-1 shadow-3xl shadow-black/60 bg-surface/50 flex flex-col justify-between border-white/5 aurora-glow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.3em] mb-8 opacity-60">Status Protocol</p>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-4 w-4 rounded-full bg-accent animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
                        <span className="text-4xl font-black text-portal-text uppercase tracking-tighter">{activeProject.status}</span>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm text-portal-muted font-bold leading-relaxed opacity-80">{activeProject.description || "Project parameters are actively monitored."}</p>
                    </div>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Tasks */}
                  <Card className="shadow-3xl shadow-black/60 bg-surface/50 border-white/5">
                    <h3 className="text-xl font-black text-portal-text mb-10 flex items-center gap-4 uppercase tracking-tighter">
                      <div className="p-2.5 rounded-xl bg-secondary/10">
                        <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      Milestones
                    </h3>
                    <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-5 p-5 rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all duration-300">
                          <div className={`h-4 w-4 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-portal-success shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'border-2 border-white/10'}`} />
                          <span className={`text-sm font-black tracking-tight ${task.status === 'completed' ? 'text-portal-muted line-through opacity-40' : 'text-portal-text'}`}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.length === 0 && <p className="text-sm text-portal-muted italic text-center py-10 border-2 border-dashed border-white/5 rounded-[32px] opacity-40">Workflow sequence loading.</p>}
                    </div>
                  </Card>

                  {/* Invoices */}
                  <Card className="shadow-3xl shadow-black/60 bg-surface/50 border-white/5 overflow-hidden relative">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-portal-success/5 rounded-full -mr-24 -mb-24 blur-3xl" />
                    <h3 className="text-xl font-black text-portal-text mb-10 flex items-center gap-4 uppercase tracking-tighter relative z-10">
                      <div className="p-2.5 rounded-xl bg-portal-success/10">
                        <svg className="h-6 w-6 text-portal-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Financials
                    </h3>
                    <div className="space-y-4 relative z-10">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-5 rounded-[20px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 group">
                          <div>
                            <p className="text-xl font-black text-portal-text tracking-tight group-hover:text-accent transition-colors">${inv.amount}</p>
                            <p className="text-[10px] text-portal-muted font-black uppercase tracking-[0.2em] opacity-60">Maturing {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="rounded-lg">{inv.status}</Badge>
                        </div>
                      ))}
                      {invoices.length === 0 && <p className="text-sm text-portal-muted italic text-center py-10 border-2 border-dashed border-white/5 rounded-[32px] opacity-40">No billing events captured.</p>}
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-32 border-4 border-dashed border-gray-100 rounded-[3rem]">
                <p className="text-xl font-bold text-portal-muted">Waiting for project initiation...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
