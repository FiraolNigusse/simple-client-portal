import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PortalChatWindow } from "../components/PortalChatWindow";

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
      <div className="flex min-h-screen items-center justify-center bg-[#0F1115]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#8B93A1]">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F1115] p-6 text-center">
        <div className="mb-6 rounded-full bg-red-500/10 p-6 text-red-400">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Portal Access Error</h2>
        <p className="text-[#8B93A1] mb-8 max-w-sm">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const { client, projects } = data ?? {};

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-8 py-12 space-y-12">
        {/* Portal Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/[0.04] pb-10">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">{client?.name}</h1>
            <p className="text-sm text-[#8B93A1] mt-1">{client?.company || "Client Portal"}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8B93A1] font-medium bg-white/[0.02] px-4 py-2 rounded-md border border-white/[0.04]">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Active Session
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sidebar / Project Nav */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-[#8B93A1] uppercase tracking-wider ml-1">Projects</h3>
              <div className="space-y-1">
                {projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeProject?.id === p.id 
                        ? "bg-white text-black" 
                        : "text-[#8B93A1] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="fin-card p-6 bg-white/[0.02]">
              <h4 className="text-xs font-semibold text-white mb-3">Support</h4>
              <p className="text-xs text-[#8B93A1] leading-relaxed">
                Contact your consultant directly for any questions or support regarding these projects.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-10">
            {activeProject ? (
              <>
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Status Card */}
                  <div className="md:col-span-1 fin-card p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#8B93A1] uppercase tracking-wider mb-6">Status</h4>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        <span className="text-2xl font-semibold text-white tracking-tight">{activeProject.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/[0.04]">
                      <p className="text-xs text-[#8B93A1] italic leading-relaxed">
                        {activeProject.description || "No project description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Files Card */}
                  <div className="md:col-span-2 fin-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                      <h3 className="text-sm font-semibold text-white">Files</h3>
                      <Badge variant="default">{files.length} FILES</Badge>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-6 py-4 list-row-hover group">
                          <span className="text-sm font-medium text-white transition-colors">{file.filename}</span>
                          <a href={file.file} download className="text-xs font-semibold text-[#8B93A1] hover:text-white transition-colors">Download</a>
                        </div>
                      ))}
                      {files.length === 0 && (
                        <div className="px-6 py-12 text-center text-[#8B93A1] text-sm italic">
                          No files shared yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Tasks */}
                  <div className="fin-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                      <h3 className="text-sm font-semibold text-white">Project Tasks</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 px-6 py-4">
                          <div className={`h-4 w-4 rounded border shrink-0 transition-colors ${task.status === 'completed' ? 'bg-white border-white text-black flex items-center justify-center' : 'border-white/20'}`}>
                            {task.status === 'completed' && (
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-[#8B93A1] line-through opacity-50' : 'text-white'}`}>{task.title}</span>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="px-6 py-12 text-center text-[#8B93A1] text-sm italic">
                          No tasks found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoices */}
                  <div className="fin-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                      <h3 className="text-sm font-semibold text-white">Invoices</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between px-6 py-4 list-row-hover group">
                          <div>
                            <p className="text-sm font-semibold text-white tracking-tight">${inv.amount}</p>
                            <p className="text-[10px] text-[#8B93A1] uppercase tracking-wider mt-0.5">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                            {inv.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                      {invoices.length === 0 && (
                        <div className="px-6 py-12 text-center text-[#8B93A1] text-sm italic">
                          No invoices found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messaging Channel */}
                  <div className="md:col-span-2">
                    <PortalChatWindow token={token} projectId={activeProject.id} />
                  </div>
                </div>
              </>
            ) : (
              <div className="fin-card flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 rounded-full bg-white/[0.02] p-8 text-[#8B93A1]">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Awaiting Project Assignment</h3>
                <p className="text-[#8B93A1] max-w-sm mx-auto">Selected projects and shared documents will appear here once they are assigned to your portal.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
