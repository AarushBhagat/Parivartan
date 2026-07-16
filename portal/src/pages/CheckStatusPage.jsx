import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, CheckCircle2, Landmark, RefreshCw, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CheckStatusPage = () => {
  const [grievanceNumber, setGrievanceNumber] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockGrievances = {
    'GRV001': {
      id: 'GRV001',
      title: 'Road Repair Request',
      description: 'Pothole on Main Street needs immediate repair for safety.',
      status: 'In Progress',
      department: 'Public Works Department',
      submittedDate: '2025-09-20',
      lastUpdated: '2025-09-23',
      assignedOfficer: 'John Smith',
      estimatedCompletion: '2025-09-30'
    },
    'GRV002': {
      id: 'GRV002',
      title: 'Street Light Issue',
      description: 'Street light not working on Park Avenue.',
      status: 'Resolved',
      department: 'Municipal Corporation',
      submittedDate: '2025-09-18',
      lastUpdated: '2025-09-22',
      assignedOfficer: 'Sarah Johnson',
      estimatedCompletion: 'Completed'
    },
    'GRV003': {
      id: 'GRV003',
      title: 'Water Supply Problem',
      description: 'No water supply for 3 days in the northern block.',
      status: 'Pending',
      department: 'Water Supply & Sanitation',
      submittedDate: '2025-09-24',
      lastUpdated: '2025-09-24',
      assignedOfficer: 'Not Assigned',
      estimatedCompletion: 'TBD'
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!grievanceNumber.trim()) {
      toast.error('Please enter a valid grievance number');
      return;
    }
    
    setLoading(true);
    setStatus(null);

    setTimeout(() => {
      const foundGrievance = mockGrievances[grievanceNumber.toUpperCase()];
      if (foundGrievance) {
        setStatus(foundGrievance);
        toast.success('Grievance found successfully');
      } else {
        toast.error('Grievance not found. Please check the code.');
      }
      setLoading(false);
    }, 800);
  };

  const handleSampleClick = (sampleNumber) => {
    setGrievanceNumber(sampleNumber);
  };

  const getTimelineStatus = (currentStatus) => {
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    return statuses.indexOf(currentStatus);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-3xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="glass-panel p-8 md:p-12 border border-glass-border shadow-xl shadow-primary/5"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
              <Search size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Track Grievance</h1>
            <p className="text-muted-foreground">Enter your grievance reference ID to check real-time resolution updates and timelines.</p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                id="grievanceNumber"
                value={grievanceNumber}
                onChange={(e) => setGrievanceNumber(e.target.value)}
                placeholder="e.g. GRV001"
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground font-medium text-lg uppercase shadow-sm"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="h-14 px-8 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Track Status</span>}
            </button>
          </form>

          {/* Results Details / Timeline */}
          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-background/50 rounded-2xl border border-border p-6 md:p-8"
              >
                {/* Dynamic Timeline Pipeline */}
                <div className="relative flex items-center justify-between mb-10 mt-4 px-4 sm:px-8">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-border -translate-y-1/2 z-0 rounded-full hidden sm:block"></div>
                  
                  {['Pending', 'In Progress', 'Resolved'].map((step, idx) => {
                    const currentIdx = getTimelineStatus(status.status);
                    const isActive = currentIdx >= idx;
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2 w-1/3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md ${
                          isActive 
                            ? 'bg-primary text-primary-foreground scale-110 shadow-primary/20' 
                            : 'bg-muted text-muted-foreground border-2 border-border'
                        }`}>
                          {isActive ? <CheckCircle2 size={18} /> : idx + 1}
                        </div>
                        <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step}</span>
                        {/* Mobile connection lines */}
                        {idx < 2 && (
                          <div className={`absolute top-5 left-[60%] w-[80%] h-0.5 sm:hidden ${isActive && currentIdx > idx ? 'bg-primary' : 'bg-border'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detail Info Card */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/50">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{status.title}</h3>
                      <p className="text-sm text-muted-foreground">ID: {status.id}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      status.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' :
                      status.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {status.status}
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed">{status.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <Landmark size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Department</p>
                        <p className="font-semibold text-foreground text-sm">{status.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <User size={20} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assigned Officer</p>
                        <p className="font-semibold text-foreground text-sm">{status.assignedOfficer}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <Calendar size={20} className="text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Submitted Date</p>
                        <p className="font-semibold text-foreground text-sm">{new Date(status.submittedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <CheckCircle2 size={20} className="text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completion Status</p>
                        <p className="font-semibold text-foreground text-sm">
                          {status.estimatedCompletion === 'Completed' ? 'Fully Resolved' :
                           status.estimatedCompletion === 'TBD' ? 'Under Evaluation' :
                           `Est: ${new Date(status.estimatedCompletion).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo Samples */}
          <div className="mt-10 flex flex-col items-center">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Test Reference IDs</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['GRV001', 'GRV002', 'GRV003'].map(id => (
                <button 
                  key={id}
                  onClick={() => handleSampleClick(id)}
                  className="px-4 py-2 rounded-full border border-border bg-muted/20 text-xs font-mono font-medium hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckStatusPage;