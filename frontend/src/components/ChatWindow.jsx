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
      const res = await api.get(`/messages/project/${projectId}/`);
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
      const res = await api.post("/messages/", {
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
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden border-white/5 bg-sidebar shadow-2xl shadow-black/40 aurora-glow">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h4 className="font-bold text-portal-text">Project Workspace</h4>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-[10px] uppercase font-bold text-portal-muted tracking-widest">Channel Active</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-20">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Secure Session Started</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_type === senderType;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] space-y-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-xl ${
                  isMe 
                    ? "bg-primary text-white rounded-tr-none shadow-primary/20" 
                    : "bg-surface text-portal-text border border-white/5 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] text-portal-muted uppercase font-black tracking-widest opacity-40 ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
        <input 
          type="text"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-portal-text placeholder:text-portal-muted/40 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <Button size="sm" type="submit" loading={loading} className="shrink-0 h-11 w-11 p-0 rounded-xl">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </Card>

  );
}
