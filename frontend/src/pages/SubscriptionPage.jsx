import { useState } from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, Skeleton } from "../components/ui/Badge";

const PLAN_ORDER = ["starter", "professional", "agency"];

export function SubscriptionPage() {
  const { subscription, plans, loading, upgradePlan } = useSubscription();
  const [upgrading, setUpgrading] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpgrade = async (plan) => {
    if (plan === subscription?.plan) return;
    setUpgrading(plan);
    setError(null);
    setSuccess(null);
    try {
      const updated = await upgradePlan(plan);
      setSuccess(`Successfully switched to the ${updated.plan_label} plan.`);
    } catch {
      setError("Failed to update your plan. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  const sortedPlans = [...plans].sort(
    (a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-portal-text uppercase tracking-[0.1em]">Subscription</h1>
        <p className="text-sm text-portal-muted font-medium">Manage your plan and feature limits.</p>
      </div>

      {!loading && subscription && (
        <Card className="flex items-center justify-between border-primary/20 bg-primary/10 aurora-glow">
          <div className="flex gap-6 items-center">
            <div className="h-16 w-16 rounded-[20px] bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-2xl shadow-primary/30 p-1">
              <div className="h-full w-full rounded-[19px] bg-sidebar flex items-center justify-center">
                <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Active Membership</p>
              <h3 className="text-2xl font-black text-portal-text tracking-tight">{subscription.plan_label}</h3>
              <p className="text-xs text-portal-muted font-bold">Billing Status: <span className="text-portal-success uppercase tracking-widest">{subscription.status_label}</span></p>
            </div>
          </div>
          <div className="hidden sm:flex gap-8 divide-x divide-white/10">
            {Object.entries(subscription.limits ?? {}).map(([k, v]) => (
              <div key={k} className="pl-8 first:pl-0">
                <p className="text-[10px] uppercase font-bold text-portal-muted tracking-[0.1em] opacity-50 mb-1">{k}</p>
                <p className="text-lg font-black text-portal-text tracking-tighter">{v === null ? "∞" : v}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {success && (
        <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-portal-error/20 bg-portal-error/10 px-4 py-3 text-sm text-portal-error font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {loading ? (
          [1,2,3].map(i => <Skeleton key={i} height="350px" />)
        ) : (
          sortedPlans.map((p) => {
            const isCurrent = p.plan === subscription?.plan;
            const isUpgradable = PLAN_ORDER.indexOf(p.plan) > PLAN_ORDER.indexOf(subscription?.plan ?? "starter");

            return (
              <Card 
                key={p.plan} 
                className={`relative flex flex-col p-8 transition-all duration-500 overflow-hidden group ${isCurrent ? 'ring-2 ring-accent border-transparent' : 'border-white/5 hover:border-white/20'}`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant="indigo" className="bg-accent/20 text-accent border-accent/20">Current</Badge>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-portal-text mb-1">{p.label}</h3>
                <p className="text-3xl font-extrabold text-portal-text mb-6">
                  ${p.plan === 'starter' ? '0' : p.plan === 'professional' ? '29' : '99'}
                  <span className="text-sm font-normal text-portal-muted">/mo</span>
                </p>

                <div className="flex-1 space-y-4 mb-8">
                  {Object.entries(p.limits).map(([resource, limit]) => (
                    <div key={resource} className="flex items-center gap-3 text-sm">
                      <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-portal-muted capitalize leading-none">{resource}</span>
                      <span className="ml-auto font-bold text-portal-text leading-none">{limit === null ? "Unlimited" : limit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  loading={upgrading === p.plan}
                  disabled={isCurrent}
                  variant={isCurrent ? "outline" : "primary"}
                  onClick={() => handleUpgrade(p.plan)}
                  className="w-full"
                >
                  {isCurrent ? "Default Plan" : isUpgradable ? "Upgrade" : "Downgrade"}
                </Button>
              </Card>
            );
          })
        )}
      </div>

      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 aurora-glow">
        <div className="flex items-center gap-4 mb-3 text-portal-text">
          <div className="p-2 rounded-xl bg-accent/10">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22M12 2.148V2a11.955 11.955 0 01-8.618 3.04A11.955 11.955 0 0112 21.48a11.955 11.955 0 018.618-3.04" />
            </svg>
          </div>
          <p className="font-black uppercase tracking-widest text-sm">Enterprise-Grade Security</p>
        </div>
        <p className="text-sm text-portal-muted leading-relaxed font-medium opacity-80">
          All your data — including clients, projects, and internal files — is encrypted at rest and fully isolated.
          Our multi-tenant architecture ensures that no other freelancer can ever access your workspace.
        </p>
      </div>
    </div>
  );
}
