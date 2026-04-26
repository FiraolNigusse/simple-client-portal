import { useState, useRef } from "react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../services/apiClient";

export function PortalInvoiceDetailModal({ isOpen, onClose, invoice, token, onPaymentSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [amount, setAmount] = useState("");
  const fileInputRef = useRef(null);
  const toast = useToast();

  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
    // Use our secure public download endpoint
    window.open(`${baseUrl}/invoices/p/${invoice.uuid}/download/`, "_blank");
  };

  const handleFileChange = (e) => {
    setProofFile(e.target.files[0]);
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!amount) {
      toast("Please enter payment amount", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("reference", `Client Portal: ${invoice.invoice_number}`);
    if (proofFile) {
      formData.append("proof_of_payment", proofFile);
    }

    try {
      // Use the public confirm endpoint
      await apiClient.post(`/invoices/p/${invoice.uuid}/confirm/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: undefined, // No JWT
        },
      });
      toast("Payment confirmation submitted!");
      setProofFile(null);
      setAmount("");
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      toast("Failed to submit payment proof", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const isOverdue = invoice.is_overdue;
  const balance = parseFloat(invoice.balance_due || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[90dvh] overflow-hidden bg-[#0F1115] border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04] bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white tracking-tight">{invoice.invoice_number}</h2>
              <Badge variant={invoice.status === "paid" ? "success" : isOverdue ? "error" : "warning"}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-[#8B93A1] mt-1">{invoice.project_title || "General Billing"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              Download PDF
            </Button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-[#8B93A1] hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          
          {/* Overdue Alert */}
          {isOverdue && invoice.status !== "paid" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
              <div className="mt-0.5 text-red-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Payment Overdue</h4>
                <p className="text-xs text-[#8B93A1] mt-1">This invoice was due on {new Date(invoice.due_date).toLocaleDateString()}. Please settle the remaining balance to avoid service interruptions.</p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-6 md:col-span-2">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest mb-2">Issue Date</h4>
                  <p className="text-sm text-white font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest mb-2">Due Date</h4>
                  <p className="text-sm text-white font-medium">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Upon Receipt"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest mb-2">Notes & Terms</h4>
                <p className="text-xs text-[#8B93A1] leading-relaxed italic bg-white/[0.02] p-4 rounded-lg border border-white/[0.04]">
                  {invoice.description || "Payment is due according to the agreed terms. Please include the invoice number in your bank transfer reference."}
                </p>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest">Payment Progress</h4>
                  <span className="text-xs font-semibold text-white">{Math.round(invoice.payment_progress_percent)}%</span>
                </div>
                <div className="progress-bg">
                  <div 
                    className={`progress-fill ${invoice.status === 'paid' ? 'progress-fill-success' : 'progress-fill-warning'}`} 
                    style={{ width: `${invoice.payment_progress_percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#8B93A1]">
                    <span>Paid: ${invoice.amount_paid}</span>
                    <span>Total: ${invoice.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/[0.02] border-white/[0.06] space-y-6">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest">Remaining Balance</h4>
                  <p className={`text-3xl font-bold tracking-tighter ${balance > 0 ? "text-white" : "text-green-500"}`}>
                    ${balance.toLocaleString()}
                  </p>
                </div>

                {balance > 0 && (
                  <form onSubmit={handlePayNow} className="space-y-4 pt-4 border-t border-white/[0.04]">
                    <div>
                        <label className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest block mb-2">Amount to Pay</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-[#8B93A1] uppercase tracking-widest block mb-2">Upload Proof</label>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-lg p-3 text-xs text-[#8B93A1] hover:bg-white/[0.04] transition-colors"
                        >
                            {proofFile ? (
                                <span className="text-white font-medium truncate">{proofFile.name}</span>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-5-9l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Click to upload receipt</span>
                                </>
                            )}
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isUploading || !amount}>
                        {isUploading ? "Submitting..." : "Submit Payment Proof"}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-white tracking-tight">Payment History</h3>
            <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
                {invoice.payments?.length > 0 ? (
                    invoice.payments.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">${p.amount}</p>
                                    <p className="text-[10px] text-[#8B93A1] uppercase tracking-wider">{p.payment_method} — {new Date(p.payment_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {p.proof_of_payment && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => window.open(p.proof_of_payment, "_blank")}
                                    className="text-[10px] text-white/40 hover:text-white"
                                >
                                    View Proof
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-xs text-[#8B93A1] italic bg-white/[0.01]">
                        No payments recorded yet.
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.04] flex justify-end bg-white/[0.01]">
          <p className="text-[10px] text-[#8B93A1] font-medium tracking-wide">Secure Financial Document — Generated by Mela</p>
        </div>
      </div>
    </div>
  );
}
