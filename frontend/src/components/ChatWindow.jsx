import { useEffect, useRef, useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { MessageBubble, DateDivider, groupMessagesByDate } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

const POLL_INTERVAL_MS = 5000;

export function ChatWindow({ projectId, senderType = "freelancer" }) {
  const api = useApi();
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(
    async (silent = false) => {
      try {
        const response = await api.get(`/messaging/project/${projectId}/`);
        const data = response.data;
        setMessages(Array.isArray(data) ? data : data.results ?? []);
        if (!silent) setError(null);
      } catch {
        if (!silent) setError("Could not load messages.");
      } finally {
        setLoading(false);
      }
    },
    [api, projectId]
  );

  // Initial load
  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages (every 5 s)
  useEffect(() => {
    const id = setInterval(() => fetchMessages(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchMessages]);

  const handleSend = async (content, reset) => {
    setSending(true);
    setError(null);
    // Optimistic insertion
    const optimistic = {
      id: `opt-${Date.now()}`,
      project: projectId,
      sender_type: senderType,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    reset();
    try {
      const response = await api.post("/messaging/", {
        project: projectId,
        sender_type: senderType,
        content,
      });
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? response.data : m))
      );
    } catch (err) {
      // Roll back
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.content?.[0] ||
        "Failed to send. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs font-medium text-slate-200">Project Chat</p>
        </div>
        <p className="text-[10px] text-slate-600">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-800">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`flex ${n % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="h-9 animate-pulse rounded-2xl bg-slate-800/70"
                  style={{ width: `${40 + n * 15}%` }}
                />
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-xs text-slate-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          grouped.map((item) =>
            item.type === "divider" ? (
              <DateDivider key={item.key} label={item.label} />
            ) : (
              <MessageBubble key={item.key} message={item.message} />
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={handleSend} sending={sending} />
    </div>
  );
}
