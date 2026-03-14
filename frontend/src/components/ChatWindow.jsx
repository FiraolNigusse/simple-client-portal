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
      setMessages(res.data);
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
    <Card className="flex flex-col h-[600px] p-0 overflow-hidden border-gray-100 bg-white shadow-xl shadow-gray-200/50">
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <h4 className="font-bold text-portal-text">Project Chat</h4>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-[10px] uppercase font-bold text-portal-muted tracking-wider">Live Support</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white"
      >
        {messages.map((msg, i) => {
          const isMe = msg.sender_type === senderType;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                    : "bg-gray-100 text-portal-text border border-gray-200 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] text-portal-muted uppercase font-bold tracking-tighter ${isMe ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
            <svg className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No messages yet</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
        <input 
          type="text"
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-portal-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <Button size="sm" type="submit" loading={loading}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </form>
    </Card>
  );
}
