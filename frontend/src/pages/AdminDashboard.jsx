import React, { useState, useEffect } from "react";
import { 
  Users, 
  Target, 
  CreditCard, 
  TrendingUp, 
  Activity,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";
import { Card, StatsCard } from "../components/ui/Card";

/**
 * AdminDashboard - Premium analytics for SaaS owners.
 * Features: MRR, Active Users, Plan Distribution.
 */
export default function AdminDashboard() {
  const { user, initializing } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.is_staff) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/dashboard/");
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to load analytics. Please ensure you are logged in as an admin.");
    } finally {
      setLoading(false);
    }
  };

  // Access Control
  if (initializing) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-center p-4">
        <AlertCircle className="h-12 w-12 text-danger mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Unauthorized</h1>
        <p className="text-secondary max-w-md">
          This area is restricted to Mela administrators. Please sign in with a staff account to continue.
        </p>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const chartData = data ? [
    { name: "Starter", value: data.plans.starter, color: "#94A3B8" },
    { name: "Pro", value: data.plans.pro, color: "#3B82F6" },
    { name: "Agency", value: data.plans.agency, color: "#8B5CF6" },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Mela Admin</h1>
        </header>
        <Card className="bg-danger/10 border-danger/20 p-8 text-center">
          <p className="text-danger">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto p-6 md:p-10 space-y-12"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white font-display">Mela Admin Dashboard</h1>
          <p className="text-[#8B93A1] text-sm md:text-base font-medium">
            Real-time insights into your SaaS ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase bg-white/5 py-2 px-4 rounded-full">
          <Activity className="h-3 w-3 text-success animate-pulse" />
          Live Metrics
        </div>
      </header>

      {/* Stats Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <StatsCard 
                label="Total Users" 
                value={data.total_users} 
                icon={Users}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard 
                label="Active (7d)" 
                value={data.active_users} 
                icon={Target}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard 
                label="Paying Users" 
                value={data.paying_users} 
                icon={CreditCard}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard 
                label="Estimated MRR" 
                value={formatCurrency(data.mrr)} 
                icon={TrendingUp}
              />
            </motion.div>
          </>
        )}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full min-h-[400px] flex flex-col">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white">Plan Distribution</h3>
              <p className="text-xs text-secondary mt-1 tracking-wide uppercase">Number of subscribers per tier</p>
            </div>
            
            <div className="flex-1 w-full -ml-4">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                   <Loader2 className="h-6 w-6 animate-spin text-secondary opacity-20" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8B93A1', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8B93A1', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ 
                        backgroundColor: '#171717', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Side Panel: Recent Insight */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-[#8b5cf6]/20 bg-[#8b5cf6]/5">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Platform Health</h3>
                <p className="text-xs text-secondary mt-1 tracking-wide uppercase">AI Summary</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-secondary leading-relaxed font-medium">
                    {loading ? "..." : `Conversion rate to paid plans is stable. ${data.paying_users} users have active subscriptions.`}
                  </p>
                </div>
                
                <div className="flex gap-4 items-center p-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">System Uptime</p>
                    <p className="text-xs text-secondary">99.9% this month</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button 
                  onClick={fetchAnalytics}
                  className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
                >
                  Refresh Analytics
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </motion.div>
  );
}
