import { useState } from "react";

export function AuthForm({ mode, onSubmit, loading }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
            value={form.name}
            onChange={handleChange}
          />
        </div>
      )}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/20 focus:ring"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-md bg-emerald-500/80 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm shadow-emerald-500/30 ring-emerald-500/40 transition hover:bg-emerald-400/80 focus-visible:outline-none focus-visible:ring disabled:cursor-not-allowed disabled:bg-emerald-500/40"
      >
        {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

