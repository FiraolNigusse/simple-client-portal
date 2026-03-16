import { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/users/password/reset/", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative">
        <div className="bg-[#121216] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-400">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm">
                Success! Check your email for password reset instructions.
              </div>
              <Link to="/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={loading}>
                Send Reset Link
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
