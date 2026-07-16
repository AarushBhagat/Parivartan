import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, HeartPulse, GraduationCap, Coins, ShieldAlert, Hammer, 
  Bus, Sprout, Droplet, Zap, Utensils, HandHelping, 
  Globe, Users, PhoneCall, CheckCircle2, ShieldCheck, 
  ChevronRight, Calendar, Landmark, ArrowRight, Zap as ZapIcon
} from 'lucide-react';

const HomePage = () => {
  const [language, setLanguage] = useState('english');

  const departments = [
    { name: "Municipal", icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Health", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Education", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Revenue", icon: Coins, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Police", icon: ShieldAlert, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Public Works", icon: Hammer, color: "text-violet-500", bg: "bg-violet-500/10" },
    { name: "Transport", icon: Bus, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { name: "Agriculture", icon: Sprout, color: "text-lime-500", bg: "bg-lime-500/10" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-glass-border shadow-sm mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Official Governance Portal</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl"
        >
          Welcome to the <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald-400 to-accent">
            Parivartan Portal
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Your gateway to digital transformation. Experience seamless, transparent, and ultra-efficient government services at your fingertips.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group">
            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/check-status" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-glass-border text-foreground font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            Track Grievance
          </Link>
        </motion.div>
      </section>

      {/* Metrics Bento Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="glass-panel p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Building2 size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-bold text-foreground">18</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Departments</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-bold text-foreground">50+</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Online Services</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel p-8 flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-bold text-foreground">10K+</h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Citizens Served</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Departments Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Integrated Departments</h2>
          <p className="text-muted-foreground max-w-2xl">One platform connecting you to all major civic bodies for rapid resolution.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {departments.map((dept, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group glass-panel p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${dept.bg} ${dept.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <dept.icon size={24} />
              </div>
              <span className="font-semibold text-foreground text-sm text-center">{dept.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Layout for About & Instructions */}
      <section id="about" className="w-full max-w-7xl mx-auto px-6 mb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* About Box */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-10 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">About Parivartan</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Parivartan is a comprehensive digital transformation platform designed to streamline government services and enhance citizen engagement. Our mission is to provide transparent, efficient, and accessible government services to all citizens through innovative technology solutions.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600"><ShieldCheck size={16} /></div>
                <span className="font-medium text-foreground">Secure Infrastructure</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600"><ZapIcon size={16} /></div>
                <span className="font-medium text-foreground">Instant Dispatch</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600"><Globe size={16} /></div>
                <span className="font-medium text-foreground">Multi-Lingual Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Instructions Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 flex-1"
          >
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Landmark size={20} className="text-primary"/> How to Use
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Select User Type</h4>
                  <p className="text-sm text-muted-foreground">Choose between Admin, Staff, or Department roles.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">Secure Authentication</h4>
                  <p className="text-sm text-muted-foreground">Login using corporate credentials and solve the captcha.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Review & Act</h4>
                  <p className="text-sm text-muted-foreground">Track status, assign jobs to field staff, or resolve pending issues.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Support Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <PhoneCall size={20} className="text-primary"/> Helpdesk & Support
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Helpline</p>
                <p className="font-semibold text-foreground">1800-180-2025</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <p className="font-semibold text-foreground">support@gov.in</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;