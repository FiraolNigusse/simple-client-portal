import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(formData);
      navigate("/");
    } catch (err) {
      const errorData = err.response?.data;
      if (typeof errorData === "object") {
        // Flatten backend validation errors (e.g. {email: ["..."]})
        const firstError = Object.values(errorData)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(errorData?.detail || "Registration failed. Please try again.");
      }
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Get started</h1>
          <p className="mt-2 text-sm text-portal-muted">Join 2,000+ freelancers managing their business on Portal.</p>
        </div>

        <Card className="p-8 border-slate-800/60 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-portal-error/20 bg-portal-error/10 px-4 py-3 text-xs text-portal-error font-medium animate-in shake duration-300">
                {error}
              </div>
            )}
            <Input 
              label="Full Name" 
              placeholder="e.g. John Doe" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="john@example.com" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Password" 
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <div className="pt-2">
              <p className="text-[10px] text-portal-muted mb-4 text-center">
                By signing up, you agree to our <Link to="#" className="underline">Terms of Service</Link> and <Link to="#" className="underline">Privacy Policy</Link>.
              </p>
              <Button className="w-full" loading={loading}>Create Account</Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-portal-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:text-indigo-400 underline underline-offset-4 decoration-primary/30">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
