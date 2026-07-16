import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { 
  Users, Building2, FileText, CheckCircle2, Clock, XCircle, 
  TrendingUp, AlertCircle, Search, Filter, ArrowUpRight, 
  BarChart3, Activity, ShieldCheck, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import GrievanceModal from '../components/GrievanceModal';

const departmentNames = {
  'pwd': 'Public Works Department (PWD)',
  'municipal': 'Municipal Corporation',
  'traffic-police': 'Traffic Police',
  'water-sanitation': 'Water Supply & Sanitation',
  'pspcl': 'Punjab State Power Corporation (PSPCL)',
  'health-welfare': 'Health & Family Welfare',
  'civil-surgeon': 'Civil Surgeon\'s Office',
  'punjab-police': 'Punjab Police',
  'education': 'School Education Department',
  'agriculture': 'Agriculture & Farmers Welfare',
  'food-civil-supplies': 'Food & Civil Supplies',
  'roadways': 'Punjab Roadways / PRTC',
  'rto': 'Regional Transport Office (RTO)',
  'revenue': 'Revenue Department',
  'social-security': 'Social Security & Women & Child Development',
  'pollution-control': 'Punjab Pollution Control Board',
  'forest': 'Forest Department',
  'disaster-management': 'District Disaster Management Authority'
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [departments, setDepartments] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDepartment, setNewDepartment] = useState({
    name: '', head: '', officer: '', contact: '', email: ''
  });

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const fetchGrievances = useCallback(async () => {
    try {
      const grievancesRef = collection(db, 'grievances');
      const snapshot = await getDocs(grievancesRef);
      
      const grievancesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayId: doc.id.substring(0, 8).toUpperCase(),
          title: data.title || 'Untitled',
          department: departmentNames[data.department] || data.department,
          departmentId: data.department,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          submittedDate: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          citizenName: data.citizenName || 'Unknown',
          location: typeof data.location === 'object' 
            ? (data.location?.address || data.location?.district || 'N/A')
            : (data.location || 'N/A'),
          description: data.description || ''
        };
      });

      grievancesList.sort((a, b) => {
        const dateA = new Date(a.submittedDate || 0).getTime();
        const dateB = new Date(b.submittedDate || 0).getTime();
        return dateB - dateA;
      });

      setGrievances(grievancesList);
      return grievancesList;
    } catch (error) {
      console.error('Error fetching grievances:', error);
      return [];
    }
  }, []);

  const fetchDepartments = useCallback(async (grievancesList) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userType', '==', 'department'));
      const snapshot = await getDocs(q);
      
      const departmentsList = snapshot.docs.map(doc => {
        const data = doc.data();
        const deptId = data.department;
        
        const deptGrievances = grievancesList.filter(g => g.departmentId === deptId);
        const resolved = deptGrievances.filter(g => g.status === 'resolved').length;
        const pending = deptGrievances.filter(g => g.status === 'pending').length;
        const inProgress = deptGrievances.filter(g => g.status === 'in-progress').length;
        const total = deptGrievances.length;
        
        const performance = total > 0 ? Math.round((resolved / total) * 100) : 100;
        
        let avgResolutionTime = 'N/A';
        if (resolved > 0) {
          const resolvedGrievances = deptGrievances.filter(g => g.status === 'resolved');
          const totalDays = resolvedGrievances.reduce((sum, g) => {
            const submitDate = new Date(g.submittedDate);
            const resolveDate = g.resolvedDate ? new Date(g.resolvedDate) : new Date();
            const daysDiff = Math.floor((resolveDate - submitDate) / (1000 * 60 * 60 * 24));
            return sum + Math.max(daysDiff, 0);
          }, 0);
          const avgDays = Math.round(totalDays / resolved);
          avgResolutionTime = `${avgDays} ${avgDays === 1 ? 'day' : 'days'}`;
        } else if (total === 0) {
          avgResolutionTime = 'No data';
        }
        
        return {
          id: deptId,
          name: departmentNames[deptId] || deptId,
          head: data.displayName || 'Not Assigned',
          officer: data.username || 'Not Assigned',
          contact: data.phoneNumber || '+91-XXXXXXXXXX',
          email: data.email || `${deptId}@parivartan.gov.in`,
          totalGrievances: total,
          resolved,
          pending,
          inProgress,
          avgResolutionTime,
          performance
        };
      });

      setDepartments(departmentsList);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const grievancesList = await fetchGrievances();
      await fetchDepartments(grievancesList);
      setLoading(false);
    };
    
    loadData();
    
    // Auto collapse sidebar on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [fetchGrievances, fetchDepartments]);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const newDept = {
      id: newDepartment.name.toLowerCase().replace(/\s+/g, '-'),
      ...newDepartment,
      totalGrievances: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      avgResolutionTime: '0 days',
      performance: 100
    };
    setDepartments([...departments, newDept]);
    setShowAddDepartment(false);
    setNewDepartment({ name: '', head: '', officer: '', contact: '', email: '' });
    toast.success('Department created successfully!');
  };

  const handleViewGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setShowModal(true);
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      const grievanceRef = doc(db, 'grievances', grievanceId);
      await updateDoc(grievanceRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setGrievances(grievances.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
      ));
      
      toast.success('Status updated successfully!');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const filteredGrievances = grievances.filter(g => {
    const matchesDept = selectedDepartment === 'all' || g.departmentId === selectedDepartment;
    const matchesSearch = g.displayId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const totalStats = {
    total: grievances.length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
    inProgress: grievances.filter(g => g.status === 'in-progress').length,
    pending: grievances.filter(g => g.status === 'pending').length
  };

  // Prepare data for Recharts
  const deptChartData = departments.map(d => ({
    name: d.name.split(' ')[0],
    total: d.totalGrievances,
    resolved: d.resolved
  })).slice(0, 8); // Top 8

  const statusPieData = [
    { name: 'Resolved', value: totalStats.resolved, color: '#10b981' },
    { name: 'In Progress', value: totalStats.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: totalStats.pending, color: '#f59e0b' }
  ].filter(item => item.value > 0);

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
            <Landmark size={24} className="drop-shadow-sm" />
            <span className="tracking-tight">Parivartan Admin</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 shrink-0 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <h4 className="font-semibold text-foreground leading-tight">{user?.username || 'Administrator'}</h4>
              <span className="text-xs font-medium text-primary">System Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'departments' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('departments')}
          >
            <Building2 size={18} />
            <span>Departments</span>
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'grievances' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('grievances')}
          >
            <ListChecks size={18} />
            <span>All Grievances</span>
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'}`}
            onClick={() => handleTabClick('analytics')}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="p-4 shrink-0 border-t border-border/50">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/50 text-muted-foreground font-medium hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-semibold text-lg text-foreground hidden sm:block">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'departments' && 'Department Management'}
              {activeTab === 'grievances' && 'Grievance Tracking'}
              {activeTab === 'analytics' && 'System Analytics'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hidden sm:flex">
              <User size={14} />
              <span>{user?.email || 'admin@parivartan.gov.in'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <p className="font-medium animate-pulse">Synchronizing Admin Data...</p>
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
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                      <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <ListChecks size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Filed</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{totalStats.total}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Resolved</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{totalStats.resolved}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{totalStats.inProgress}</h3>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4 group hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Pending Review</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{totalStats.pending}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart and Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel p-6 border border-glass-border rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={20} className="text-primary" />
                          <h2 className="text-lg font-bold text-foreground">Resolution Performance</h2>
                        </div>
                      </div>
                      <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {departments.map(dept => (
                          <div key={dept.id} className="group">
                            <div className="flex justify-between items-end mb-2">
                              <div>
                                <span className="font-semibold text-foreground text-sm block mb-1 group-hover:text-primary transition-colors">{dept.name}</span>
                                <span className="text-xs text-muted-foreground">Avg Time: {dept.avgResolutionTime}</span>
                              </div>
                              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{dept.performance}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-primary to-accent" 
                                initial={{ width: 0 }}
                                animate={{ width: `${dept.performance}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex flex-col">
                      <h2 className="text-lg font-bold text-foreground mb-6">System Health</h2>
                      
                      <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-lg shrink-0"><CheckCircle2 size={20} /></div>
                          <div>
                            <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm mb-1">Database Sync</h4>
                            <p className="text-xs text-muted-foreground">Connected to Firestore instance. 0ms latency.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <div className="p-2 bg-blue-500/20 text-blue-600 rounded-lg shrink-0"><User size={20} /></div>
                          <div>
                            <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-sm mb-1">Active Sessions</h4>
                            <p className="text-xs text-muted-foreground">{departments.length} department accounts authorized.</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleTabClick('departments')}
                          className="mt-auto w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          Manage Boards <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'departments' && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">Department Profiles</h2>
                      <p className="text-muted-foreground text-sm">Manage department access and view statistics.</p>
                    </div>
                    <button 
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                      onClick={() => setShowAddDepartment(true)}
                    >
                      <Plus size={18} />
                      <span>Add Board</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {departments.map(dept => (
                      <div key={dept.id} className="glass-panel border border-glass-border rounded-2xl p-6 flex flex-col group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            {dept.name.charAt(0)}
                          </div>
                          <button 
                            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => {
                              if (window.confirm(`Delete department ${dept.name}?`)) {
                                setDepartments(departments.filter(d => d.id !== dept.id));
                                toast.success('Department removed.');
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-1 group-hover:text-primary transition-colors" title={dept.name}>{dept.name}</h3>
                        
                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Head Officer</span>
                            <span className="font-semibold text-foreground truncate max-w-[120px]">{dept.head}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-semibold text-foreground truncate max-w-[140px]" title={dept.email}>{dept.email}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Contact</span>
                            <span className="font-semibold text-foreground">{dept.contact}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <strong className="block text-lg text-foreground">{dept.totalGrievances}</strong>
                            <small className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</small>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                            <strong className="block text-lg text-emerald-600">{dept.resolved}</strong>
                            <small className="text-[10px] uppercase tracking-wider text-emerald-700/70 font-semibold">Resolved</small>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-amber-500/10">
                            <strong className="block text-lg text-amber-600">{dept.pending}</strong>
                            <small className="text-[10px] uppercase tracking-wider text-amber-700/70 font-semibold">Pending</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'grievances' && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">Grievance Registry</h2>
                      <p className="text-muted-foreground text-sm">Manage and track all filed grievances across departments.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text"
                          placeholder="Search ID or Title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-64 h-10 pl-9 pr-4 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="relative group min-w-[180px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none group-focus-within:text-primary transition-colors" />
                        <select 
                          value={selectedDepartment} 
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full h-10 pl-9 pr-8 rounded-xl bg-background border border-input focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="all">All Boards</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name.substring(0,25)}...</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel border border-glass-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredGrievances.length > 0 ? filteredGrievances.map(g => (
                            <tr key={g.id} className="hover:bg-muted/30 transition-colors group">
                              <td className="px-6 py-4 font-mono font-medium text-foreground">#{g.displayId}</td>
                              <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate" title={g.title}>{g.title}</td>
                              <td className="px-6 py-4 text-muted-foreground max-w-[150px] truncate">{g.department}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  g.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' :
                                  g.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600' :
                                  'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {g.status.replace('-', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  g.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                  g.priority === 'medium' ? 'bg-orange-500/10 text-orange-600' :
                                  'bg-slate-500/10 text-slate-600'
                                }`}>
                                  {g.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(g.submittedDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  className="text-primary font-semibold hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={() => handleViewGrievance(g)}
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                No grievances found matching the criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div className="space-y-6" variants={itemVariants}>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">System Analytics</h2>
                    <p className="text-muted-foreground text-sm">Visual breakdown of system usage and performance.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex flex-col h-[400px]">
                      <h3 className="text-lg font-bold text-foreground mb-6">Top Departments by Volume</h3>
                      <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} angle={-45} textAnchor="end" />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-6 border border-glass-border rounded-2xl flex flex-col h-[400px]">
                      <h3 className="text-lg font-bold text-foreground mb-6">Global Status Distribution</h3>
                      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {statusPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-3xl font-bold text-foreground">{totalStats.total}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* Add Department Overlay Modal */}
      <AnimatePresence>
        {showAddDepartment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDepartment(false)}
            />
            <motion.div 
              className="relative w-full max-w-lg glass-panel border border-glass-border rounded-2xl shadow-2xl p-6 md:p-8"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Create Department</h3>
                  <p className="text-sm text-muted-foreground">Register a new board onto the platform.</p>
                </div>
                <button 
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                  onClick={() => setShowAddDepartment(false)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Department Name</label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    required
                    placeholder="e.g. Health & Welfare"
                    className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Head Officer Name</label>
                  <input
                    type="text"
                    value={newDepartment.head}
                    onChange={(e) => setNewDepartment({...newDepartment, head: e.target.value})}
                    required
                    placeholder="John Doe"
                    className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Portal Username</label>
                  <input
                    type="text"
                    value={newDepartment.officer}
                    onChange={(e) => setNewDepartment({...newDepartment, officer: e.target.value})}
                    required
                    placeholder="health_admin"
                    className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Contact Number</label>
                    <input
                      type="tel"
                      value={newDepartment.contact}
                      onChange={(e) => setNewDepartment({...newDepartment, contact: e.target.value})}
                      required
                      placeholder="+91-XXXXX"
                      className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                    <input
                      type="email"
                      value={newDepartment.email}
                      onChange={(e) => setNewDepartment({...newDepartment, email: e.target.value})}
                      required
                      placeholder="dept@gov.in"
                      className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    onClick={() => setShowAddDepartment(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all shadow-md active:scale-95"
                  >
                    Register
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grievance modal overlay */}
      {showModal && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={() => setShowModal(false)}
          onStatusUpdate={handleStatusUpdate}
          department="admin"
        />
      )}
    </div>
  );
};

export default AdminDashboard;