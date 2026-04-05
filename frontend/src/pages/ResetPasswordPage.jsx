import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post("/users/password/reset/confirm/", {
        new_password: password,
        uid,
        token,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (err.response?.data?.new_password ? err.response.data.new_password[0] : "An error occurred. The link might be expired.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
                <p className="text-gray-400 mb-6">This password reset link is invalid or malformed.</p>
                <Link to="/login"><Button>Back to Login</Button></Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white mb-2">Reset password</h1>
          <p className="text-sm text-[#8B93A1]">
            Create a secure new password for your account.
          </p>
        </div>

        <div className="fin-card p-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">
                Your password has been successfully reset.
              </div>
              <Link to="/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
