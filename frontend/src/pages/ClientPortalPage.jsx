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
        setFiles(r.data.files || []);
        setInvoices(r.data.invoices || []);
        const first = r.data.projects?.[0];
        if (first) {
          setActiveProject(first);
        }
      })
      .catch(() => setError("Invalid or expired portal link."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!activeProject || !token) return;
    // Fetch only tasks as they are project-specific and not in the main blob yet
    portalGet(token, "/tasks/", { project: activeProject.id })
      .then(t => setTasks(Array.isArray(t.data) ? t.data : t.data.results || []));
  }, [token, activeProject]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 h-20 w-20 border-4 border-transparent border-b-accent rounded-full animate-spin [animation-duration:2s]" />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-2 animate-pulse">Initializing Interface</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-32 w-32 rounded-[3rem] bg-portal-error/10 border border-portal-error/20 flex items-center justify-center text-portal-error mb-10 shadow-2xl shadow-portal-error/10">
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
      <div className="mx-auto max-w-7xl px-8 py-16 space-y-16">
        {/* Portal Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
              Secure Partner Terminal
            </div>
            <h1 className="text-7xl font-black text-portal-text tracking-tighter uppercase">{client?.name} <span className="text-primary">.</span></h1>
            <p className="text-xl text-portal-muted font-black uppercase tracking-[0.2em] opacity-40">{client?.company || "Project Dashboard"}</p>
          </div>
          <div className="bg-card-bg border border-white/10 rounded-[32px] p-10 flex items-center gap-10 shadow-3xl shadow-black/80">
            <div className="text-right">
              <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.3em] mb-3 opacity-40">Verified Consultant</p>
              <p className="text-xl font-black text-portal-text tracking-tight uppercase">FinDesk Workspace</p>
            </div>
            <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-white p-1 shadow-2xl shadow-primary/20">
              <div className="h-full w-full rounded-[23px] bg-bg-secondary flex items-center justify-center">
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar / Project Nav */}
          <div className="lg:col-span-1 space-y-10">
            <div className="space-y-6">
              <p className="text-xs font-black text-portal-muted uppercase tracking-[0.3em] opacity-40 ml-4">Deployment Log</p>
              <div className="space-y-4">
                {projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full text-left px-8 py-6 rounded-3xl transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden group ${
                      activeProject?.id === p.id 
                        ? "bg-primary text-white shadow-2xl scale-[1.03]" 
                        : "bg-white/[0.02] border border-white/5 text-portal-muted hover:border-white/10 hover:text-portal-text hover:bg-white/5"
                    }`}
                  >
                    <span className="relative z-10">{p.title}</span>
                    {activeProject?.id === p.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/10 p-8 rounded-3xl">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Support Protocol</h4>
              <p className="text-sm text-portal-muted font-medium leading-relaxed opacity-80 italic">Direct communication is enabled within specific project environments for optimized orchestration.</p>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000">
            {activeProject ? (
              <>
                <div className="grid md:grid-cols-3 gap-10">
                  {/* Files Card */}
                  <Card className="md:col-span-2 overflow-hidden shadow-3xl shadow-black/80 bg-white/[0.01] border-white/5">
                    <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                      <h3 className="text-2xl font-black text-portal-text flex items-center gap-5 uppercase tracking-tighter">
                        <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
                          <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 00-2-2h4l2 2h4a2 2 0 012 2v1" />
                          </svg>
                        </div>
                        Shared Artifacts
                      </h3>
                      <Badge variant="accent" className="rounded-xl px-4 py-2 font-black text-[10px] tracking-widest">{files.length} ITEMS</Badge>
                    </div>
                    <div className="space-y-4">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-500 group">
                          <span className="text-sm font-black text-portal-text tracking-tight truncate group-hover:text-primary transition-colors">{file.filename}</span>
                          <a href={file.file} download className="text-accent hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-accent/10 hover:bg-accent px-4 py-2 rounded-xl">Extract</a>
                        </div>
                      ))}
                      {files.length === 0 && <p className="text-sm text-portal-muted italic py-16 text-center border-2 border-dashed border-white/5 rounded-[40px] opacity-20">Awaiting asset deployment.</p>}
                    </div>
                  </Card>

                  {/* Status Card */}
                  <Card className="md:col-span-1 shadow-3xl shadow-black/80 bg-white/[0.01] flex flex-col justify-between border-white/5 relative overflow-hidden p-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.4em] mb-12 opacity-40">Orchestration Phase</p>
                      <div className="flex items-center gap-5 mb-12">
                        <div className="h-5 w-5 rounded-full bg-accent animate-pulse shadow-[0_0_15px_var(--accent)]" />
                        <span className="text-5xl font-black text-portal-text uppercase tracking-tighter">{activeProject.status}</span>
                      </div>
                    </div>
                    <div className="relative z-10 p-6 bg-white/[0.03] rounded-3xl border border-white/5 border-dashed">
                      <p className="text-sm text-portal-muted font-bold leading-relaxed opacity-60 italic">{activeProject.description || "Operational parameters are within expected thresholds."}</p>
                    </div>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Tasks */}
                  <Card className="shadow-3xl shadow-black/80 bg-white/[0.01] border-white/5 p-8">
                    <h3 className="text-2xl font-black text-portal-text mb-12 flex items-center gap-5 uppercase tracking-tighter">
                      <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20">
                        <svg className="h-7 w-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      Workflow
                    </h3>
                    <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
                          <div className={`h-5 w-5 rounded-xl shrink-0 transition-all duration-500 ${task.status === 'completed' ? 'bg-success shadow-lg shadow-success/20' : 'border-2 border-white/10 bg-white/5'}`} />
                          <span className={`text-sm font-black tracking-tight ${task.status === 'completed' ? 'text-portal-muted line-through opacity-30 shadow-none' : 'text-portal-text'}`}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.length === 0 && <p className="text-sm text-portal-muted italic text-center py-16 border-2 border-dashed border-white/5 rounded-[40px] opacity-20">Sequence parameters loading.</p>}
                    </div>
                  </Card>

                  {/* Invoices */}
                  <Card className="shadow-3xl shadow-black/60 bg-white/[0.01] border-white/5 overflow-hidden relative p-8">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-success/10 rounded-full -mr-32 -mb-32 blur-3xl opacity-30" />
                    <h3 className="text-2xl font-black text-portal-text mb-12 flex items-center gap-5 uppercase tracking-tighter relative z-10">
                      <div className="p-3 rounded-2xl bg-success/10 border border-success/20">
                        <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Settlements
                    </h3>
                    <div className="space-y-4 relative z-10">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-500 group">
                          <div>
                            <p className="text-2xl font-black text-portal-text tracking-tighter group-hover:text-primary transition-colors">
                              <span className="text-[10px] text-portal-muted mr-3 opacity-30 font-black uppercase tracking-widest leading-none align-middle">ID: {inv.id}</span>
                              ${inv.amount}
                            </p>
                            <p className="text-[9px] text-portal-muted font-black uppercase tracking-[0.3em] opacity-40 mt-1">Maturation Profile: {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="rounded-xl px-4 py-2 font-black text-[9px] tracking-[0.2em] uppercase">{inv.status}</Badge>
                        </div>
                      ))}
                      {invoices.length === 0 && <p className="text-sm text-portal-muted italic text-center py-16 border-2 border-dashed border-white/5 rounded-[40px] opacity-20">Financial log cleared.</p>}
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-40 border-4 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
                <div className="mb-10 inline-flex h-24 w-24 items-center justify-center rounded-[3rem] bg-white/5 text-white/5 shadow-2xl">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-portal-text uppercase tracking-tighter mb-4">Awaiting Project Allocation</h3>
                <p className="text-portal-muted max-w-sm mx-auto font-medium opacity-60">The secure terminal will initialize once the consultant assigns an operational project to your identity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
