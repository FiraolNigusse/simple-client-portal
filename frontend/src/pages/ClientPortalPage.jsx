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
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-portal-muted uppercase tracking-widest">Loading Portal</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-20 w-20 rounded-2xl bg-portal-error/10 flex items-center justify-center text-portal-error mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-portal-muted mb-8 max-w-sm">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const { client, projects } = data ?? {};

  return (
    <div className="min-h-screen bg-background text-portal-text font-sans">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        {/* Portal Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Secure Client Portal
            </div>
            <h1 className="text-4xl font-black text-white">{client?.name} <span className="text-primary">.</span></h1>
            <p className="text-lg text-portal-muted">{client?.company || "Project Dashboard"}</p>
          </div>
          <div className="bg-surface border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            <div className="text-right">
              <p className="text-xs font-bold text-portal-muted uppercase tracking-tighter">Freelancer</p>
              <p className="text-sm font-bold text-white">Your Dedicated Partner</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar / Project Nav */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-portal-muted uppercase tracking-widest">Active Projects</p>
              <div className="space-y-2">
                {projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                      activeProject?.id === p.id 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-surface border border-slate-800 text-portal-muted hover:border-slate-700 hover:text-portal-text"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <h4 className="text-xs font-bold text-primary uppercase mb-2">Need Help?</h4>
              <p className="text-xs text-portal-muted italic">Use the message board to reach out directly to your freelancer.</p>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {activeProject ? (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Files Card */}
                  <Card className="md:col-span-2 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 00-2-2h4l2 2h4a2 2 0 012 2v1" />
                        </svg>
                        Shared Assets
                      </h3>
                      <Badge variant="indigo">{files.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                          <span className="text-sm font-medium text-portal-text truncate">{file.file_name}</span>
                          <a href={file.file} download className="text-primary hover:text-indigo-400 text-xs font-bold uppercase tracking-wider">Download</a>
                        </div>
                      ))}
                      {files.length === 0 && <p className="text-sm text-portal-muted italic py-4">No files shared yet.</p>}
                    </div>
                  </Card>

                  {/* Status Card */}
                  <Card className="md:col-span-1 bg-surface border-slate-800">
                    <h3 className="text-xs font-bold text-portal-muted uppercase tracking-widest mb-4">Project Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-white uppercase">{activeProject.status}</span>
                        <div className="h-2 w-2 rounded-full bg-accent mb-2 animate-pulse" />
                      </div>
                      <p className="text-xs text-portal-muted">{activeProject.description || "Active collaboration workspace."}</p>
                    </div>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Tasks */}
                  <Card>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Development Tasks
                    </h3>
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-[#0B1220]">
                          <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-accent' : 'bg-slate-700'}`} />
                          <span className={`text-sm ${task.status === 'completed' ? 'text-portal-muted line-through' : 'text-portal-text'}`}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.length === 0 && <p className="text-sm text-portal-muted italic">Queue is currently empty.</p>}
                    </div>
                  </Card>

                  {/* Invoices */}
                  <Card>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Settlement
                    </h3>
                    <div className="space-y-3">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#0B1220]">
                          <div>
                            <p className="text-sm font-bold text-white">${inv.amount}</p>
                            <p className="text-[10px] text-portal-muted uppercase">Due {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                        </div>
                      ))}
                      {invoices.length === 0 && <p className="text-sm text-portal-muted italic">No outstanding invoices.</p>}
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-portal-muted">Waiting for project assignments...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
