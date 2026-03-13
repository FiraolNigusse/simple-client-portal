import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy link");

  useEffect(() => {
    api
      .get(`/clients/${id}/`)
      .then((response) => {
        setClient(response.data);
      })
      .catch(() => {
        navigate("/clients", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api, id, navigate]);

  const handleGeneratePortal = async () => {
    if (!client) return;
    setGenerating(true);
    try {
      const response = await api.post("/clients/portal/generate/", {
        client_id: client.id
      });
      setClient(response.data);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!client?.portal_link) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(client.portal_link);
      }
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy link"), 1500);
    } catch {
      // Ignore copy errors for now.
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading client...</p>;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="text-xs text-slate-400 hover:text-slate-200"
      >
        ← Back to clients
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          {client.name}
        </h1>
        <p className="text-sm text-slate-400">
          {client.email}
          {client.company ? ` • ${client.company}` : ""}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-100">
              Client portal link
            </p>
            <p className="text-xs text-slate-400">
              Generate a secure link your client can use to access their portal
              without an account.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGeneratePortal}
            disabled={generating}
            className="inline-flex items-center rounded-md bg-emerald-500/80 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400/80 disabled:cursor-not-allowed disabled:bg-emerald-500/40"
          >
            {generating ? "Generating..." : client.portal_link ? "Regenerate" : "Generate"}
          </button>
        </div>
        {client.portal_link && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 truncate rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
              {client.portal_link}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-100 hover:border-emerald-500/80 hover:text-emerald-200"
            >
              {copyLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

