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
    <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold text-portal-text">
          {plan} limit reached
        </p>
        <p className="text-xs text-portal-muted mt-1">
          You have used all {limit} {label} allowed on your plan. 
          Upgrade to a higher tier to continue scaling.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => navigate("/subscription")}>
            Upgrade Plan
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
