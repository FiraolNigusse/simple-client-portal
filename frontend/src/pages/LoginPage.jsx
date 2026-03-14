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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/30 mb-6">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-portal-text">Welcome back</h1>
          <p className="mt-3 text-sm text-portal-muted">Sign in to manage your freelance business.</p>
        </div>

        <Card className="p-10 border-gray-100 shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-portal-error font-semibold animate-in shake duration-300">
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
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-portal-muted uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[10px] uppercase font-bold text-primary hover:text-indigo-600">Forgot?</Link>
              </div>
              <input 
                type="password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-portal-text transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
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
