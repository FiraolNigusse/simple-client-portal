import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { apiClient } from "../services/apiClient";

export function PortalChatWindow({ token, projectId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const portalGet = (path, params = {}) =>
    apiClient.get(`/portal/${token}${path}`, {
      params: { token, ...params },
      headers: { Authorization: undefined },
    });

  const portalPost = (path, data = {}) =>
    apiClient.post(`/portal/${token}${path}`, data, {
      params: { token },
      headers: { Authorization: undefined },
    });

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [projectId, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await portalGet("/messages/", { project: projectId });
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
      const res = await portalPost("/messages/", {
        project: projectId,
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden border-white/5 bg-[#1B2026] shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h4 className="font-black text-portal-text uppercase tracking-widest text-xs">Operational Channel</h4>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-[10px] uppercase font-black text-portal-muted tracking-[0.2em] opacity-60">Connected</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
            <p className="text-sm font-black text-white uppercase tracking-[0.3em]">No Messages Yet</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_type === "client";
          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
              <div className={`max-w-[75%] space-y-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe 
                    ? "bg-white text-black rounded-tr-none font-bold" 
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

      <form onSubmit={handleSend} className="p-4 bg-white/[0.03] border-t border-white/5 flex gap-3">
        <input 
          type="text"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-portal-text focus:outline-none focus:border-white/20 transition-all"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <Button size="sm" type="submit" loading={loading} className="shrink-0 p-3 h-11 w-11 rounded-xl">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </Card>
  );
}
