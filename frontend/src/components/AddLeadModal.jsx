import { useState, useEffect } from "react";

const STAGES = [
  { value: "lead",      label: "Lead" },
  { value: "sent",      label: "Sent" },
  { value: "replied",   label: "Replied" },
  { value: "demo",      label: "Demo" },
  { value: "converted", label: "Converted" },
  { value: "lost",      label: "Lost" },
];
const WARMTH = ["cold", "warm", "hot"];
const PLATFORMS = ["LinkedIn", "Twitter/X", "Instagram", "Facebook", "Email", "Referral", "Other"];

const INITIAL = {
  name: "", platform: "", role: "", niche: "", contact: "",
  audience_size: "", warmth: "warm", stage: "lead", notes: "",
};

export function AddLeadModal({ onClose, onSaved, initial = null }) {
  const [form, setForm] = useState(initial ?? INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      await onSaved(form);
      onClose();
    } catch {
      setError("Failed to save lead. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl bg-[#111318] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-white">{initial ? "Edit Lead" : "Add New Lead"}</h2>
          </div>
          <button onClick={onClose} className="text-portal-muted hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <input className={input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Alex Thompson" />
            </Field>
            <Field label="Platform">
              <select className={input} value={form.platform} onChange={e => set("platform", e.target.value)}>
                <option value="">Select platform</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role / Title">
              <input className={input} value={form.role} onChange={e => set("role", e.target.value)} placeholder="e.g. Marketing Director" />
            </Field>
            <Field label="Niche / Industry">
              <input className={input} value={form.niche} onChange={e => set("niche", e.target.value)} placeholder="e.g. SaaS / E-commerce" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact (email / handle)">
              <input className={input} value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="e.g. alex@company.com" />
            </Field>
            <Field label="Audience Size">
              <input className={input} value={form.audience_size} onChange={e => set("audience_size", e.target.value)} placeholder="e.g. 50k+" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Warmth">
              <select className={input} value={form.warmth} onChange={e => set("warmth", e.target.value)}>
                {WARMTH.map(w => <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select className={input} value={form.stage} onChange={e => set("stage", e.target.value)}>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea className={`${input} min-h-[80px] resize-none`} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any notes about this lead..." />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-semibold text-portal-muted hover:text-white hover:border-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : initial ? "Save Changes" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-portal-muted">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-portal-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";
