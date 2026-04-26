import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard, 
  Clock, 
  ShieldCheck, 
  Zap,
  Users
} from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white selection:bg-white/10 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-[#0F1115]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-[#8B93A1] hover:text-white transition-colors">Login</Link>
            <Link to="/register">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>

        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Urgency Banner */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#8B93A1]">
              Early access available for the first 10 freelance designers.
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            The Premium Client Portal for <span className="text-[#8B93A1]">Freelance Designers</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-[#8B93A1] mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Manage projects, files, feedback, and invoices in one polished workspace your clients will love.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-bold">
                Start Free
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-bold">
              Book Personal Onboarding
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight leading-[1.2]">
                Your workflow is costing you <span className="text-danger">professionalism.</span>
              </h2>
              <div className="space-y-6 text-[#8B93A1] text-lg leading-relaxed">
                <p>
                  Your files are in one app, messages in another, invoices somewhere else.
                </p>
                <p className="text-white font-medium">
                  That creates friction for both you and your clients.
                </p>
                <p>
                  Mela brings everything together in one elegant portal built for freelance design businesses.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] p-8 flex flex-col justify-center gap-8 overflow-hidden">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-in slide-in-from-left duration-700">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <LayoutDashboard size={20} />
                  </div>
                  <div className="h-2 w-32 bg-white/10 rounded-full" />
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] translate-x-12 animate-in slide-in-from-left duration-1000">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="h-2 w-48 bg-white/10 rounded-full" />
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] translate-x-4 animate-in slide-in-from-left duration-500">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <Zap size={20} />
                  </div>
                  <div className="h-2 w-24 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Built for the modern designer</h2>
            <p className="text-[#8B93A1]">Everything you need to deliver a premium client experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<LayoutDashboard className="text-white" />}
              title="Client Dashboard"
              description="A single source of truth for your clients to access everything they need."
            />
            <FeatureCard 
              icon={<Clock className="text-white" />}
              title="Project Timeline"
              description="Keep milestones clear and deadlines visible with visual project tracking."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-white" />}
              title="Secure File Sharing"
              description="Deliver high-res assets securely through your branded environment."
            />
            <FeatureCard 
              icon={<Zap className="text-white" />}
              title="Instant Payments"
              description="Get paid faster with integrated invoicing and automated reminders."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[#8B93A1] mb-12">
            Trusted by early-stage freelancers building premium client experiences.
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
            <div className="flex items-center gap-2">
                <Users size={24} />
                <span className="font-bold">DESIGN.CO</span>
            </div>
            <div className="flex items-center gap-2">
                <LayoutDashboard size={24} />
                <span className="font-bold">STUDIO.X</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck size={24} />
                <span className="font-bold">CREATIVE.FLOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Join the first 10 designers shaping the future of freelance client management.
          </h2>
          <Link to="/register">
            <Button size="lg" className="h-16 px-12 text-lg font-bold bg-black text-white hover:bg-black/90">
              Get Early Access
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.04] bg-[#0F1115]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo size="sm" />
          <p className="text-[#8B93A1] text-xs">© 2026 Mela Client Portal. Built for designers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all group">
      <div className="h-12 w-12 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[#8B93A1] leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
