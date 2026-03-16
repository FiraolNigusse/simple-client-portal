import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../context/ToastContext";

export function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast("Profile updated successfully");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Settings</h1>
        <p className="text-sm text-portal-muted font-medium">Manage your account preferences and workspace configuration.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="aurora-glow">
            <h3 className="text-lg font-bold text-portal-text mb-6">Profile Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  label="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                  label="Email Address" 
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button loading={loading}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-portal-text mb-6">Security</h3>
            <form className="space-y-6">
              <Input 
                label="Current Password" 
                type="password"
                placeholder="••••••••"
              />
              <div className="grid gap-6 md:grid-cols-2">
                <Input 
                  label="New Password" 
                  type="password"
                  placeholder="••••••••"
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="secondary">Update Password</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <h3 className="text-sm font-black text-portal-text uppercase tracking-widest mb-4">Workspace Tier</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-portal-text">Pro Plan</p>
                <p className="text-xs text-portal-muted font-medium">Active since Jan 2024</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10">Manage Subscription</Button>
          </Card>

          <Card className="border-portal-error/20 bg-portal-error/5">
            <h3 className="text-sm font-black text-portal-error uppercase tracking-widest mb-2">Danger Zone</h3>
            <p className="text-xs text-portal-muted font-medium mb-4">Permanently delete your workspace and all associated data.</p>
            <Button variant="danger" className="w-full">Delete Account</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
