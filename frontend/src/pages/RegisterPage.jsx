import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { apiClient } from "../services/apiClient";

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ name, email, password }) => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/users/register/", { name, email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError("We couldn&apos;t create your account with those details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-black/40">
        <div className="space-y-2 text-center mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            Create an account
          </h1>
          <p className="text-sm text-slate-400">
            Start using the client portal for your projects.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        <AuthForm mode="register" onSubmit={handleSubmit} loading={loading} />
        <p className="mt-4 text-xs text-slate-400 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

