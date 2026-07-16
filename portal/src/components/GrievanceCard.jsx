import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MapPin, User, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const GrievanceCard = ({ grievance, onViewDetails, onStatusUpdate, department }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  useEffect(() => {
    const loadStaffMembers = async () => {
      if (!department) return;
      setLoadingStaff(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('department', '==', department));
        const snapshot = await getDocs(q);
        const staff = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.role === 'staff' || data.userType === 'staff';
          })
          .map(doc => ({ uid: doc.id, ...doc.data() }));
        setStaffMembers(staff);
      } catch (error) {
        console.error('Error loading staff members:', error);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaffMembers();
  }, [department]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus && newStatus !== '' && newStatus !== grievance.status) {
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(grievance.id, newStatus);
        e.target.value = '';
      }
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (typeof onViewDetails === 'function') {
      onViewDetails(grievance);
    }
  };

  const handleStaffAssignment = async (e) => {
    e.stopPropagation();
    const staffUid = e.target.value;
    if (!staffUid || staffUid === '') return;
    try {
      const selectedStaff = staffMembers.find(s => s.uid === staffUid);
      if (!selectedStaff) return;
      const grievanceRef = doc(db, 'grievances', grievance.id);
      await updateDoc(grievanceRef, {
        assignedTo: staffUid,
        assignedToName: selectedStaff.displayName || selectedStaff.username,
        assignedAt: new Date().toISOString(),
        status: 'in-progress'
      });
      toast.success(`Task assigned to ${selectedStaff.displayName || selectedStaff.username}`);
      if (typeof onStatusUpdate === 'function') {
        onStatusUpdate(grievance.id, 'in-progress');
      }
      e.target.value = '';
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign task. Please try again.');
    }
  };

  const statusColors = {
    'pending': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'resolved': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'rejected': 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  const priorityColors = {
    'low': 'bg-slate-500/10 text-slate-600',
    'medium': 'bg-orange-500/10 text-orange-600',
    'high': 'bg-red-500/10 text-red-600'
  };

  const status = grievance.status || 'pending';
  const priority = grievance.priority || 'medium';

  return (
    <div 
      className="glass-panel p-5 border border-glass-border rounded-2xl cursor-pointer group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-sm font-semibold text-primary/80">#{grievance.id.substring(0, 8).toUpperCase()}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityColors[priority]}`}>
            {priority}
          </span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColors[status]}`}>
            {status.replace('-', ' ')}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-2 truncate group-hover:text-primary transition-colors">{grievance.title || 'Untitled'}</h3>
        
        <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
          {grievance.description || 'No description provided'}
        </p>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <User size={12} className="text-primary/70" />
            <span className="truncate max-w-[120px]">{grievance.citizenName || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <MapPin size={12} className="text-primary/70" />
            <span className="truncate max-w-[120px]">
              {typeof grievance.location === 'object' 
                ? (grievance.location?.address || grievance.location?.district || 'N/A')
                : (grievance.location || 'N/A')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
            <Calendar size={12} className="text-primary/70" />
            <span>{formatDate(grievance.createdAt || grievance.submittedDate || new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <select 
          className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-semibold focus:border-primary outline-none transition-colors appearance-none cursor-pointer w-full sm:w-[130px] shadow-sm hover:bg-muted/50"
          value="" 
          onChange={handleStatusChange}
        >
          <option value="">Update Status</option>
          {getStatusOptions(status).map(s => (
            <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
          ))}
        </select>

        {department && (
          <select 
            className="h-9 px-3 rounded-lg bg-background border border-input text-xs font-semibold focus:border-primary outline-none transition-colors appearance-none cursor-pointer w-full sm:w-[130px] shadow-sm hover:bg-muted/50"
            value="" 
            onChange={handleStaffAssignment} 
            disabled={loadingStaff || staffMembers.length === 0}
          >
            <option value="">
              {loadingStaff ? 'Loading...' : 
               staffMembers.length === 0 ? 'No staff' : 
               grievance.assignedToName ? `Assigned: ${grievance.assignedToName}` : 'Assign Staff'}
            </option>
            {staffMembers.map(staff => (
              <option key={staff.uid} value={staff.uid}>{staff.displayName || staff.username}</option>
            ))}
          </select>
        )}
        
        <button 
          className="h-9 w-9 sm:w-[130px] rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold flex items-center justify-center gap-1 transition-colors group/btn shadow-sm"
          onClick={handleViewDetails}
        >
          <span className="hidden sm:inline text-xs">Review</span>
          <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default GrievanceCard;