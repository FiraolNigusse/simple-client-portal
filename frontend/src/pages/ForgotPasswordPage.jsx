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
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white mb-2">Forgot password?</h1>
          <p className="text-sm text-[#8B93A1]">
            Enter your email and we'll send you recovery instructions.
          </p>
        </div>

        <div className="fin-card p-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">
                Check your email for reset instructions.
              </div>
              <Link to="/login">
                <Button className="w-full">Back to login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Send Link
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-[#8B93A1] hover:text-white transition-colors">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
