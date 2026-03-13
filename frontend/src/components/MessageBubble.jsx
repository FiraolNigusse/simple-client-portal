const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

export function MessageBubble({ message }) {
  const isFreelancer = message.sender_type === "freelancer";

  return (
    <div
      className={`flex w-full ${isFreelancer ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar — client side */}
      {!isFreelancer && (
        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">
          C
        </div>
      )}

      <div className={`group max-w-[72%] space-y-1 ${isFreelancer ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
            ${
              isFreelancer
                ? "rounded-br-sm bg-emerald-600/80 text-white"
                : "rounded-bl-sm border border-slate-700/60 bg-slate-800 text-slate-100"
            }
          `}
        >
          {message.content}
        </div>
        <span className="px-1 text-[10px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
          {formatTime(message.created_at)}
        </span>
      </div>

      {/* Avatar — freelancer side */}
      {isFreelancer && (
        <div className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-emerald-600/60 text-[10px] font-bold text-white">
          F
        </div>
      )}
    </div>
  );
}

export function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 border-t border-slate-800" />
      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-800" />
    </div>
  );
}

/**
 * Groups messages by date and injects DateDivider nodes.
 */
export function groupMessagesByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const label = formatDate(msg.created_at);
    if (label !== lastDate) {
      groups.push({ type: "divider", label, key: `divider-${msg.id}` });
      lastDate = label;
    }
    groups.push({ type: "message", message: msg, key: `msg-${msg.id}` });
  }
  return groups;
}
