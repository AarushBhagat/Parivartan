import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  LayoutDashboard, ListChecks, LogOut, Menu, X, User, 
  CheckCircle2, Clock, AlertCircle, Loader2, Star, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GrievanceList from '../components/GrievanceList';
import FilterSort from '../components/FilterSort';
import GrievanceModal from '../components/GrievanceModal';

const StaffDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state || {};
  
  const [activeTab, setActiveTab] = useState('overview');
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all', priority: 'all', dateRange: 'all', sortBy: 'date', sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0, pending: 0, inProgress: 0, resolved: 0, highPriority: 0
  });

  useEffect(() => {
    fetchGrievances();
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    calculateStats(grievances);
  }, [grievances]);

  useEffect(() => {
    applyFilters();
  }, [grievances, filters]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const applyFilters = () => {
    let filtered = [...grievances];
    if (filters.status !== 'all') filtered = filtered.filter(g => g.status === filters.status);
    if (filters.priority !== 'all') filtered = filtered.filter(g => g.priority === filters.priority);
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(g => {
        const grievanceDate = new Date(g.createdAt);
        switch (filters.dateRange) {
          case 'today': return grievanceDate >= today;
          case 'week': return grievanceDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month': return grievanceDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      });
    }
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (filters.sortBy) {
        case 'date': compareValue = new Date(b.createdAt) - new Date(a.createdAt); break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'status': compareValue = a.status.localeCompare(b.status); break;
        case 'title': compareValue = a.title.localeCompare(b.title); break;
        default: compareValue = 0;
      }
      return filters.sortOrder === 'asc' ? -compareValue : compareValue;
    });
    setFilteredGrievances(filtered);
  };

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      const grievancesList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        grievancesList.push({
          id: doc.id,
          displayId: doc.id.substring(0, 8).toUpperCase(),
          title: data.title || 'Untitled',
          description: data.description || 'No description',
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          category: data.category || data.department || 'General',
          department: data.department || 'Unknown',
          citizenName: data.citizenName || data.createdBy?.displayName || 'Anonymous',
          citizenEmail: data.citizenEmail || data.createdBy?.email || 'N/A',
          citizenPhone: data.citizenPhone || 'N/A',
          location: data.location?.address || data.location?.district || 'Unknown',
          createdAt: data.createdAt || data.submittedDate || new Date().toISOString(),
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          imageUrl: data.imageUrl || null,
          upvotes: data.upvotes || 0,
          comments: data.comments || []
        });
      });
      grievancesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setGrievances(grievancesList);
      setFilteredGrievances(grievancesList);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      toast.error('Failed to load grievances. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter(g => g.status === 'pending').length,
      inProgress: data.filter(g => g.status === 'in-progress').length,
      resolved: data.filter(g => g.status === 'resolved').length,
      highPriority: data.filter(g => g.priority === 'high').length
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleGrievanceClick = (grievance) => {
    setSelectedGrievance(grievance);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        status: newStatus, updatedAt: new Date().toISOString()
      });
      const updatedGrievances = grievances.map(g => g.id === grievanceId ? { ...g, status: newStatus } : g);
      setGrievances(updatedGrievances);
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance({ ...selectedGrievance, status: newStatus });
      }
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handlePriorityUpdate = async (grievanceId, newPriority) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        priority: newPriority, updatedAt: new Date().toISOString()
      });
      const updatedGrievances = grievances.map(g => g.id === grievanceId ? { ...g, priority: newPriority } : g);
      setGrievances(updatedGrievances);
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance({ ...selectedGrievance, priority: newPriority });
      }
      toast.success('Priority updated successfully!');
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority. Please try again.');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-card/60 backdrop-blur-xl border-r border-border shrink-0 overflow-hidden ${sidebarOpen ? '' : 'pointer-events-none lg:pointer-events-auto'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3 text-primary font-bold text-xl">
            <Briefcase size={24} className="drop-shadow-sm" />
            <span className="tracking-tight">Staff Board</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 shrink-0 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">
              {userData?.username?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h4 className="font-semibold text-foreground leading-tight">{userData?.username || 'Staff Member'}</h4>
              <span className="text-xs font-medium text-amber-500">Dispatch Officer</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'grievances' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('grievances')}
          >
            <ListChecks size={18} />
            <span>Manage Tasks</span>
          </button>
        </nav>

        <div className="p-4 shrink-0 border-t border-border/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/50 text-muted-foreground font-medium hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Top Header navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-semibold text-lg text-foreground hidden sm:block">
              {activeTab === 'overview' && 'Field Operations Overview'}
              {activeTab === 'grievances' && 'Task Assignment Registry'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hidden sm:flex">
              <User size={14} />
              <span>{userData?.username || 'Staff Portal'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <p className="font-medium animate-pulse">Loading grievances database...</p>
            </div>
          ) : (
            <motion.div 
              className="max-w-7xl mx-auto space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {activeTab === 'overview' && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  {/* Stats Counters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-foreground/30 transition-all hover:shadow-lg hover:shadow-foreground/5">
                      <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <ListChecks size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Assigned</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.total}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Resolved</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.resolved}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Active Work</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.inProgress}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Unstarted</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.pending}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel border border-red-500/20 bg-red-500/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none rounded-full" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
                        <Star size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">Urgent Tasks Alert</h3>
                        <p className="text-muted-foreground text-sm">
                          You have <strong className="text-red-600 dark:text-red-400">{stats.highPriority}</strong> high priority tasks assigned requiring prompt field inspection and resolution.
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        handleFilterChange({ priority: 'high' });
                        handleTabClick('grievances');
                      }}
                      className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-md active:scale-95 whitespace-nowrap relative z-10"
                    >
                      View Urgent Tasks
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'grievances' && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div className="glass-panel p-4 rounded-2xl border border-glass-border">
                    <FilterSort 
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      totalCount={grievances.length}
                      filteredCount={filteredGrievances.length}
                    />
                  </div>

                  <div className="w-full">
                    {filteredGrievances.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel border border-glass-border rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-4">
                          <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Tasks Found</h3>
                        <p className="text-muted-foreground">No grievances found matching active filter criteria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredGrievances.map(g => (
                          <GrievanceList 
                            key={g.id}
                            grievances={[g]}
                            onStatusUpdate={handleStatusUpdate}
                            onGrievanceClick={handleGrievanceClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Details modal */}
      {modalOpen && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={() => setModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          isStaff={true}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
