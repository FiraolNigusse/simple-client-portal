import { useState, useRef } from "react";

export function MessageInput({ onSend, sending, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed, () => setText(""));
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-slate-800 bg-slate-950/60 px-4 py-3"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        disabled={disabled || sending}
        className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none ring-emerald-500/20 scrollbar-none transition-colors focus:border-slate-600 focus:ring disabled:opacity-50"
        style={{ maxHeight: "8rem", overflowY: "auto" }}
      />

      <button
        type="submit"
        disabled={!text.trim() || sending || disabled}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/80 text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-500/80 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
        aria-label="Send message"
      >
        {sending ? (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 translate-x-px"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        )}
      </button>
    </form>
  );
}
