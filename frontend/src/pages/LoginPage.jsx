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
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] px-6">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome back</h1>
          <p className="text-sm text-[#8B93A1]">Sign in to manage your clients and projects.</p>
        </div>

        <div className="fin-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-500 font-medium">
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
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium text-[#8B93A1]">Password</label>
                <Link to="/forgot-password" name="forgot-password" id="forgot-password" className="text-xs font-medium text-white hover:underline">Forgot?</Link>
              </div>
              <input 
                type="password"
                className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white transition-all focus:bg-white/[0.04] focus:border-white/20 focus:outline-none"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button className="w-full mt-2" loading={loading} size="lg">Sign In</Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8B93A1]">
          New here?{" "}
          <Link to="/register" className="text-white font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
