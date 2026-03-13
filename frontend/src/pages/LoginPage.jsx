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
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-2xl shadow-primary/40 mb-4">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-portal-muted">Sign in to manage your freelance business.</p>
        </div>

        <Card className="p-8 border-slate-800/60 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-portal-error/20 bg-portal-error/10 px-4 py-3 text-xs text-portal-error font-medium animate-in shake duration-300">
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
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-portal-muted uppercase tracking-wider">Password</label>
                <Link to="#" className="text-[10px] uppercase font-bold text-primary hover:text-indigo-400">Forgot?</Link>
              </div>
              <input 
                type="password"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1220] px-4 py-2.5 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button className="w-full mt-2" loading={loading}>Sign In</Button>
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
