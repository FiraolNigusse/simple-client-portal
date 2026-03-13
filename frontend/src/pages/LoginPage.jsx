import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ email, password }) => {
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      const redirectTo = location.state?.from ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-black/40">
        <div className="space-y-2 text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            Sign in
          </h1>
          <p className="text-sm text-slate-400">
            Access your client portal dashboard.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        <AuthForm mode="login" onSubmit={handleSubmit} loading={loading} />
        <p className="mt-4 text-xs text-slate-400 text-center">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

