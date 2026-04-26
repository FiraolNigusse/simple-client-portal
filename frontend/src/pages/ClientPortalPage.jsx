import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PortalChatWindow } from "../components/PortalChatWindow";
import { FilePreviewModal } from "../components/FilePreviewModal";
import { Logo } from "../components/ui/Logo";
import { PortalInvoiceDetailModal } from "../components/PortalInvoiceDetailModal";

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

  // Secure file preview state
  const [previewState, setPreviewState] = useState({
    open: false,
    url: "",
    filename: "",
    extension: "",
    fileId: null,
  });
  const [fileActionLoading, setFileActionLoading] = useState(null);

  // Invoice Detail & Filter state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // all, pending, paid, overdue

  const refreshPortalData = useCallback((isInitial = false) => {
    if (isInitial) setLoading(true);
    
    portalGet(token, "/")
      .then((r) => {
        setData(r.data);
        setFiles(r.data.files || []);
        setInvoices(r.data.invoices || []);
        
        if (isInitial) {
          const first = r.data.projects?.[0];
          if (first) setActiveProject(first);
        }

        // Update selected invoice state without triggering dependency loop
        setSelectedInvoice(current => {
          if (!current) return null;
          return r.data.invoices.find(i => i.id === current.id) || null;
        });
      })
      .catch((err) => {
        if (isInitial) setError("Invalid or expired portal link.");
        console.error("Portal fetch error:", err);
      })
      .finally(() => {
        if (isInitial) setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    refreshPortalData(true);
  }, [refreshPortalData]);

  useEffect(() => {
    if (!activeProject || !token) return;
    portalGet(token, "/tasks/", { project: activeProject.id })
      .then(t => setTasks(Array.isArray(t.data) ? t.data : t.data.results || []));
  }, [token, activeProject]);

  // Secure file handlers — fetch proxied URLs on demand
  const getFileUrl = (fileId, download = false) => {
    const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    return `${baseUrl}/portal/${token}/files/${fileId}/download/?token=${token}&download=${download}`;
  };

  const handleFilePreview = (file) => {
    setPreviewState({
      open: true,
      url: getFileUrl(file.id, false),
      filename: file.filename,
      extension: file.extension || (file.filename || "").split('.').pop() || "",
      fileId: file.id,
    });
  };

  const handleFileDownload = (fileId) => {
    // Direct link to proxy endpoint triggers browser download automatically
    window.location.href = getFileUrl(fileId, true);
  };

  const closePreview = () => {
    setPreviewState({ open: false, url: "", filename: "", extension: "", fileId: null });
  };

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

  // Determine if a file is previewable based on extension
  const isPreviewable = (file) => {
    const ext = (file.extension || file.filename?.split('.').pop() || "").toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"].includes(ext);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-8 py-12 space-y-12">
        <div className="flex justify-between items-center mb-4">
          <Logo size="sm" />
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Secured by Mela</div>
        </div>
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

                  {/* Files Card — Secure */}
                  <div className="md:col-span-2 fin-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-4">
                      <h3 className="text-sm font-semibold text-white">Files</h3>
                      <Badge variant="default">{files.length} FILES</Badge>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-6 py-4 list-row-hover group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                              {isPreviewable(file) ? (
                                <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-white truncate">{file.filename}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFilePreview(file)}
                              className="text-xs font-semibold text-[#8B93A1] hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04]"
                            >
                              Open
                            </button>
                          </div>
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
                      <div className="flex items-center gap-2">
                        {["all", "pending", "paid", "overdue"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setInvoiceFilter(f)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors ${
                              invoiceFilter === f ? "bg-white text-black" : "text-[#8B93A1] hover:text-white"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {invoices
                        .filter((inv) => {
                          if (invoiceFilter === "all") return true;
                          if (invoiceFilter === "pending") return inv.status !== "paid";
                          if (invoiceFilter === "paid") return inv.status === "paid";
                          if (invoiceFilter === "overdue") return inv.is_overdue && inv.status !== "paid";
                          return true;
                        })
                        .map((inv) => (
                          <div 
                            key={inv.id} 
                            onClick={() => setSelectedInvoice(inv)}
                            className="flex items-center justify-between px-6 py-4 list-row-hover group cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white tracking-tight">${inv.total_amount}</span>
                                {inv.is_overdue && inv.status !== 'paid' && (
                                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter bg-red-400/10 px-1.5 rounded">Urgent</span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8B93A1] uppercase tracking-wider mt-0.5">
                                {inv.invoice_number} • Due {new Date(inv.due_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right mr-2 hidden md:block">
                                <p className="text-[10px] text-[#8B93A1] uppercase font-bold tracking-widest">Balance</p>
                                <p className={`text-xs font-semibold ${parseFloat(inv.balance_due) > 0 ? 'text-white' : 'text-green-500'}`}>
                                  ${inv.balance_due}
                                </p>
                              </div>
                              <Badge variant={inv.status === 'paid' ? 'success' : inv.is_overdue ? 'error' : 'warning'}>
                                {inv.status.toUpperCase()}
                              </Badge>
                            </div>
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

      {/* Secure File Preview Modal */}
      <FilePreviewModal
        isOpen={previewState.open}
        onClose={closePreview}
        previewUrl={previewState.url}
        filename={previewState.filename}
        extension={previewState.extension}
        onDownload={() => handleFileDownload(previewState.fileId)}
      />
      <PortalInvoiceDetailModal 
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        token={token}
        onPaymentSuccess={refreshPortalData}
      />
    </div>
  );
}
