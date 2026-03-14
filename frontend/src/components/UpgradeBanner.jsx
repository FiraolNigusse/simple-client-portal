import { useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";
import { Button } from "./ui/Button";

const RESOURCE_LABELS = {
  clients: "clients",
  projects: "projects",
  invoices: "invoices",
};

export function UpgradeBanner({ resource, onDismiss }) {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const label = RESOURCE_LABELS[resource] ?? resource;
  const limit = subscription?.limits?.[resource];
  const plan = subscription?.plan_label ?? "your current plan";

  return (
    <div className="flex items-start gap-6 rounded-[20px] border border-primary/20 bg-primary/10 p-6 animate-in slide-in-from-top-2 duration-300 aurora-glow">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-lg shadow-primary/20">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="flex-1">
        <p className="text-sm font-black text-portal-text uppercase tracking-widest">
          {plan} limit reached
        </p>
        <p className="text-sm text-portal-muted mt-2 font-medium leading-relaxed opacity-80">
          You have reached the maximum threshold of <span className="text-accent font-black">{limit} {label}</span> defined in your current workspace protocol. 
          Upgrade to a higher tier to expand your operational capacity.
        </p>
        <div className="mt-5 flex gap-3">
          <Button size="sm" onClick={() => navigate("/subscription")} className="px-6">
            Scale Workspace
          </Button>
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
