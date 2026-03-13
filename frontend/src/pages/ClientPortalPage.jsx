import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";

// ---------------------------------------------------------------------------
// Portal API helpers — no JWT, just ?token= query param
// ---------------------------------------------------------------------------
const portalGet = (token, path, params = {}) =>
  apiClient.get(`/portal/${token}${path}`, {
    params: { token, ...params },
    // Don't send Authorization header for portal requests
    headers: { Authorization: undefined },
  });

const portalPost = (token, path, data = {}) =>
  apiClient.post(`/portal/${token}${path}`, data, {
    params: { token },
    headers: { Authorization: undefined },
  });

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-3">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FileItem({ file }) {
  const ext = file.file_name?.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
          {ext}
        </span>
        <span className="truncate text-sm text-slate-200">{file.file_name}</span>
      </div>
      <a
        href={file.file}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400"
      >
        Download
      </a>
    </div>
  );
}

function InvoiceRow({ invoice }) {
  const isPaid = invoice.status === "paid";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">
          ${parseFloat(invoice.amount).toFixed(2)}
        </p>
        {invoice.due_date && (
          <p className="text-xs text-slate-500">
            Due {new Date(invoice.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
          isPaid
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}
      >
        {invoice.status}
      </span>
    </div>
  );
}

function TaskRow({ task }) {
  const STATUS_STYLES = {
    done: "bg-emerald-500/10 text-emerald-400",
    in_progress: "bg-blue-500/10 text-blue-400",
    todo: "bg-slate-700/60 text-slate-400",
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 px-4 py-3">
      <p className="text-sm text-slate-200">{task.title}</p>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[task.status] ?? ""}`}>
        {task.status.replace("_", " ")}
      </span>
    </div>
  );
}

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function Chat({ token, projectId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(() => {
    if (!projectId) return;
    portalGet(token, "/messages/", { project: projectId })
      .then((r) => setMessages(r.data))
      .catch(() => {});
  }, [token, projectId]);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 5000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || !projectId) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender_type: "client",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, optimistic]);
    setContent("");
    try {
      await portalPost(token, "/messages/", { project: projectId, content: optimistic.content });
      fetchMessages();
    } catch {
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-600">No messages yet. Start the conversation below.</p>
        ) : (
          messages.map((msg) => {
            const isClient = msg.sender_type === "client";
            return (
              <div
                key={msg.id}
                className={`flex ${isClient ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isClient
                      ? "rounded-br-sm bg-emerald-600/30 text-emerald-100"
                      : "rounded-bl-sm bg-slate-800 text-slate-200"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="mt-0.5 text-[10px] opacity-50">{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message… (Enter to send)"
          className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500/40"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="rounded-xl bg-emerald-600/80 px-4 text-sm text-white hover:bg-emerald-500/80 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400 animate-pulse">Loading your portal…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-400">{error}</p>
        <p className="text-xs text-slate-500">Please contact your freelancer for a new link.</p>
      </div>
    );
  }

  const { client, projects } = data ?? {};

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Client Portal</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-50">{client?.name}</h1>
            {client?.company && <p className="text-sm text-slate-400">{client.company}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-xl font-bold text-emerald-400">
            {client?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>

        {/* Project selector */}
        {projects?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProject(p)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeProject?.id === p.id
                    ? "bg-emerald-600/80 text-white"
                    : "border border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}

        {activeProject ? (
          <div className="space-y-5">
            {/* Project info */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-100">{activeProject.title}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  activeProject.status === "active"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-600 bg-slate-800 text-slate-400"
                }`}>
                  {activeProject.status}
                </span>
              </div>
              {activeProject.description && (
                <p className="mt-1 text-xs text-slate-500">{activeProject.description}</p>
              )}
            </div>

            {/* Files */}
            <Section title="Files" icon="📎">
              {files.length === 0 ? (
                <p className="text-xs text-slate-500">No files shared yet.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((f) => <FileItem key={f.id} file={f} />)}
                </div>
              )}
            </Section>

            {/* Tasks */}
            <Section title="Tasks" icon="✅">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500">No tasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              )}
            </Section>

            {/* Invoices */}
            <Section title="Invoices" icon="🧾">
              {invoices.length === 0 ? (
                <p className="text-xs text-slate-500">No invoices yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}
                </div>
              )}
            </Section>

            {/* Messages */}
            <Section title="Messages" icon="💬">
              <Chat token={token} projectId={activeProject.id} />
            </Section>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No projects found in your portal yet.</p>
        )}
      </div>
    </div>
  );
}
