import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(formData);
      const redirectTo = location.state?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-tr from-primary to-accent shadow-2xl shadow-primary/40 mb-8 p-1">
            <div className="h-full w-full rounded-[23px] bg-sidebar flex items-center justify-center">
              <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Welcome Back</h1>
          <p className="mt-3 text-sm text-portal-muted font-medium">Elevate your freelance workflow with Aurora.</p>
        </div>

        <Card className="p-10 border-white/10 shadow-3xl shadow-black/60 bg-surface/50 backdrop-blur-xl aurora-glow">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="rounded-xl border border-portal-error/20 bg-portal-error/10 px-4 py-3 text-xs text-portal-error font-black uppercase tracking-widest animate-in shake duration-300">
                {error}
              </div>
            )}
            <Input 
              label="Email" 
              type="email" 
              placeholder="john@example.com" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-portal-muted uppercase tracking-[0.2em] ml-2">Password</label>
                <Link to="#" className="text-[10px] uppercase font-black tracking-widest text-accent hover:text-white transition-colors">Forgot?</Link>
              </div>
              <input 
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-portal-text transition-all focus:bg-white/10 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button className="w-full mt-4 h-12" loading={loading} size="lg">Sign In</Button>
          </form>
        </Card>

        <p className="text-center text-sm text-portal-muted">
          New to Portal?{" "}
          <Link to="/register" className="font-bold text-primary hover:text-indigo-400 underline underline-offset-4 decoration-primary/30">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
