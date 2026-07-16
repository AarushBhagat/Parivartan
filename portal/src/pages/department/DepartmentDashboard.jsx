import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ListChecks, LogOut, Menu, X, User, 
  CheckCircle2, Clock, AlertCircle, Loader2, Building2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GrievanceList from '../../components/GrievanceList';
import FilterSort from '../../components/FilterSort';
import { getGrievancesByDepartment, updateGrievanceStatus } from '../../services/grievanceService';

const DepartmentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { departmentCode } = useParams();
  const { userData } = location.state || {};
  
  const [activeTab, setActiveTab] = useState('overview');
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all', priority: 'all', dateRange: 'all', sortBy: 'date', sortOrder: 'desc'
  });

  const getDepartmentFullName = (deptCode) => {
    const departmentNames = {
      'pwd': 'Public Works Department (PWD)',
      'municipal': 'Municipal Corporation / Nagar Council / Nagar Panchayat',
      'traffic-police': 'Traffic Police',
      'water-sanitation': 'Water Supply & Sanitation Department',
      'pspcl': 'Punjab State Power Corporation Limited (PSPCL)',
      'health-welfare': 'Health & Family Welfare Department',
      'civil-surgeon': 'Civil Surgeon\'s Office',
      'punjab-police': 'Punjab Police (SSP, Kapurthala)',
      'education': 'District Education Officer (DEO) – School Education Department',
      'agriculture': 'Agriculture & Farmers Welfare Department',
      'food-civil-supplies': 'Food & Civil Supplies Department',
      'roadways': 'Punjab Roadways / PRTC',
      'rto': 'Regional Transport Office (RTO)',
      'revenue': 'Revenue Department (under Deputy Commissioner)',
      'social-security': 'Social Security & Women & Child Development',
      'pollution-control': 'Punjab Pollution Control Board (PPCB)',
      'forest': 'Forest Department',
      'disaster-management': 'District Disaster Management Authority (DDMA)'
    };
    return departmentNames[deptCode] || deptCode;
  };

  useEffect(() => {
    loadGrievances();
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [departmentCode, userData?.department]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [grievances, filters]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const deptCode = departmentCode || userData?.department;
      const data = await getGrievancesByDepartment(deptCode);
      setGrievances(data);
    } catch (error) {
      console.error('Error loading grievances:', error);
      toast.error('Failed to load department grievances.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...grievances];
    if (filters.status !== 'all') filtered = filtered.filter(g => g.status === filters.status);
    if (filters.priority !== 'all') filtered = filtered.filter(g => g.priority === filters.priority);
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let dateLimit = new Date();
      switch (filters.dateRange) {
        case 'today': dateLimit.setHours(0, 0, 0, 0); break;
        case 'week': dateLimit.setDate(now.getDate() - 7); break;
        case 'month': dateLimit.setMonth(now.getMonth() - 1); break;
        default: dateLimit = null;
      }
      if (dateLimit) {
        filtered = filtered.filter(g => new Date(g.createdAt) >= dateLimit);
      }
    }
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'date': aValue = new Date(a.createdAt); bValue = new Date(b.createdAt); break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority] || 0; bValue = priorityOrder[b.priority] || 0; break;
        case 'status': aValue = a.status; bValue = b.status; break;
        default: aValue = a.title; bValue = b.title;
      }
      if (filters.sortOrder === 'desc') return bValue > aValue ? 1 : -1;
      return aValue > bValue ? 1 : -1;
    });
    setFilteredGrievances(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      const result = await updateGrievanceStatus(grievanceId, newStatus);
      if (result.success) {
        setGrievances(prev => prev.map(g => g.id === grievanceId ? { ...g, status: newStatus, updatedAt: new Date().toISOString() } : g));
        toast.success(`Status updated to: ${newStatus.replace('-', ' ').toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const departmentName = getDepartmentFullName(departmentCode || userData?.department);
  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === 'pending').length,
    inProgress: grievances.filter(g => g.status === 'in-progress').length,
    resolved: grievances.filter(g => g.status === 'resolved').length
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
            <Building2 size={24} className="drop-shadow-sm" />
            <span className="tracking-tight">Board Office</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 shrink-0 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
              {userData?.username?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h4 className="font-semibold text-foreground leading-tight">{userData?.username || 'Department User'}</h4>
              <span className="text-xs font-medium text-purple-500 uppercase">{departmentCode || 'OFFICER'}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'grievances' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('grievances')}
          >
            <ListChecks size={18} />
            <span>Resolutions</span>
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
            <h1 className="font-semibold text-lg text-foreground hidden sm:block truncate max-w-sm xl:max-w-xl">
              {departmentName}
            </h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hidden sm:flex">
              <User size={14} />
              <span>{userData?.username || 'Board User'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
              <p className="font-medium animate-pulse">Fetching department database...</p>
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
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Filed</p>
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
                        <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.inProgress}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Unresolved</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.pending}</h3>
                      </div>
                    </div>
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
                        <h3 className="text-xl font-bold text-foreground mb-2">No Resolvable Grievances</h3>
                        <p className="text-muted-foreground">No department grievances found matching the selected filters.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredGrievances.map(g => (
                          <GrievanceList 
                            key={g.id}
                            grievances={[g]}
                            onStatusUpdate={handleStatusUpdate}
                            department={departmentCode || userData?.department}
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
    </div>
  );
};

export default DepartmentDashboard;