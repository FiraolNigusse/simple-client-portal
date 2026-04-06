import { useState, useEffect, useRef } from "react";
import { useApi } from "../hooks/useApi";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export function ChatWindow({ projectId, senderType }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const api = useApi();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messaging/project/${projectId}/`);
      setMessages(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.post("/messaging/", {
        project: projectId,
        content: newMessage,
        sender_type: senderType
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[650px] p-0 overflow-hidden border-white/5 bg-[#1B2026] shadow-2xl shadow-black/60">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h4 className="font-black text-portal-text uppercase tracking-widest text-xs">Operational Channel</h4>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-[10px] uppercase font-black text-portal-muted tracking-[0.2em] opacity-60">Verified Active</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/grid-pattern.svg')] bg-fixed"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
            <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-black text-white uppercase tracking-[0.3em]">Session Initialized</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_type === senderType;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
              <div className={`max-w-[75%] space-y-2`}>
                <div className={`px-5 py-3.5 rounded-2xl text-sm shadow-xl tracking-tight leading-relaxed ${
                  isMe 
                    ? "bg-primary text-black rounded-tr-none font-bold shadow-primary/10" 
                    : "bg-white/5 text-portal-text border border-white/10 rounded-tl-none font-medium backdrop-blur-md"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[9px] text-portal-muted uppercase font-black tracking-widest opacity-30 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white/[0.03] border-t border-white/5 flex gap-3">
        <input 
          type="text"
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-portal-text placeholder:text-portal-muted/30 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
          placeholder="Enter operational message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <Button size="sm" type="submit" loading={loading} className="shrink-0 h-14 w-14 p-0 rounded-2xl shadow-xl shadow-primary/20">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </Card>
  );
}
