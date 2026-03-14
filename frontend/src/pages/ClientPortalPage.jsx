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
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Loading Portal</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="h-24 w-24 rounded-[2rem] bg-red-50 flex items-center justify-center text-portal-error mb-8 shadow-xl shadow-red-200/20">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-portal-text mb-3">Link Expired</h2>
        <p className="text-portal-muted mb-10 max-w-sm font-medium">{error}</p>
        <Button onClick={() => window.location.reload()} size="lg">Refresh Access</Button>
      </div>
    );
  }

  const { client, projects } = data ?? {};

  return (
    <div className="min-h-screen bg-background text-portal-text font-sans selection:bg-primary/10">
      <div className="mx-auto max-w-6xl px-8 py-16 space-y-16">
        {/* Portal Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
              Secure Client Workspace
            </div>
            <h1 className="text-5xl font-black text-portal-text tracking-tight">{client?.name} <span className="text-primary">.</span></h1>
            <p className="text-xl text-portal-muted font-medium">{client?.company || "Project Dashboard"}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-6 shadow-2xl shadow-gray-200/50">
            <div className="text-right">
              <p className="text-[10px] font-black text-portal-muted uppercase tracking-widest mb-1">Freelancer</p>
              <p className="text-sm font-bold text-portal-text">Your Dedicated Partner</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
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
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                      activeProject?.id === p.id 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                        : "bg-white border border-gray-100 text-portal-muted hover:border-gray-200 hover:text-portal-text hover:bg-gray-50/50"
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
                  <Card className="md:col-span-2 overflow-hidden shadow-xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-portal-text flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19v-4a2 2 0 00-2-2h4l2 2h4a2 2 0 012 2v1" />
                          </svg>
                        </div>
                        Shared Assets
                      </h3>
                      <Badge variant="indigo">{files.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-bold text-portal-text truncate">{file.file_name}</span>
                          <a href={file.file} download className="text-primary hover:text-indigo-600 text-xs font-black uppercase tracking-[0.1em]">Download</a>
                        </div>
                      ))}
                      {files.length === 0 && <p className="text-sm text-portal-muted italic py-6 text-center border-2 border-dashed border-gray-100 rounded-3xl">No files shared yet.</p>}
                    </div>
                  </Card>

                  {/* Status Card */}
                  <Card className="md:col-span-1 shadow-xl shadow-gray-200/50 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] mb-6">Current Status</p>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-3 w-3 rounded-full bg-accent animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
                        <span className="text-3xl font-black text-portal-text uppercase tracking-tight">{activeProject.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-portal-muted font-medium leading-relaxed">{activeProject.description || "Your project is currently in active development."}</p>
                    </div>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Tasks */}
                  <Card className="shadow-xl shadow-gray-200/50">
                    <h3 className="text-xl font-black text-portal-text mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-50">
                        <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      Track Deliverables
                    </h3>
                    <div className="space-y-4">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                          <div className={`h-3 w-3 rounded-full shrink-0 ${task.status === 'completed' ? 'bg-accent shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-gray-200'}`} />
                          <span className={`text-sm font-bold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-portal-text'}`}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.length === 0 && <p className="text-sm text-portal-muted italic text-center py-6 border-2 border-dashed border-gray-100 rounded-3xl">Workflow is being prepared.</p>}
                    </div>
                  </Card>

                  {/* Invoices */}
                  <Card className="shadow-xl shadow-gray-200/50">
                    <h3 className="text-xl font-black text-portal-text mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-50">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Financial Summary
                    </h3>
                    <div className="space-y-4">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                          <div>
                            <p className="text-lg font-black text-portal-text tracking-tight">${inv.amount}</p>
                            <p className="text-[10px] text-portal-muted font-black uppercase tracking-widest">Due {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                        </div>
                      ))}
                      {invoices.length === 0 && <p className="text-sm text-portal-muted italic text-center py-6 border-2 border-dashed border-gray-100 rounded-3xl">No billing records found.</p>}
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
