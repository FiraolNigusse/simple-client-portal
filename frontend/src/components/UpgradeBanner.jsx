import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";

const RESOURCE_LABELS = {
  clients: "clients",
  projects: "projects",
  invoices: "invoices",
};

/**
 * Shown inline when the API returns a 403 plan_limit_reached error.
 *
 * Usage:
 *   <UpgradeBanner resource="clients" onDismiss={() => setError(null)} />
 */
export function UpgradeBanner({ resource, onDismiss }) {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const label = RESOURCE_LABELS[resource] ?? resource;
  const limit = subscription?.limits?.[resource];
  const plan = subscription?.plan_label ?? "your current plan";

  return (
    <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-amber-300">
          {plan} plan limit reached
        </p>
        <p className="text-xs text-amber-400/80">
          You've reached the {label} limit ({limit === "unlimited" ? "unlimited" : limit}) on your {plan} plan.
          Upgrade to add more {label}.
        </p>
        <button
          type="button"
          onClick={() => navigate("/subscription")}
          className="mt-1 inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
        >
          View plans
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center rounded text-amber-400/60 hover:text-amber-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
