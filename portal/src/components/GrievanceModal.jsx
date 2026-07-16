import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, MapPin, User, Calendar, Phone, Mail, FileText, Image as ImageIcon } from 'lucide-react';

const GrievanceModal = ({ grievance, onClose, onStatusUpdate, onPriorityUpdate, department }) => {
  const [selectedStatus, setSelectedStatus] = useState(grievance.status);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const getStatusClass = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  const getPriorityClass = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'high': return 'bg-red-500/10 text-red-600';
      case 'medium': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleStatusUpdate = () => {
    if (selectedStatus !== grievance.status) {
      onStatusUpdate(grievance.id, selectedStatus);
      setComment('');
      setShowCommentBox(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div 
        className="relative w-full max-w-2xl h-full bg-background/90 backdrop-blur-2xl border-l border-border shadow-2xl flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Grievance Details</h2>
              <span className="font-mono text-xs font-semibold text-muted-foreground">#{grievance.id.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl glass-panel border border-glass-border">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityClass(grievance.priority)}`}>
                {(grievance.priority || 'medium')} Priority
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusClass(grievance.status)}`}>
                {(grievance.status || 'pending').replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar size={14} />
              <span>{formatDate(grievance.createdAt || grievance.submittedDate || new Date().toISOString())}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Title</label>
                <span className="text-sm font-medium text-foreground">{grievance.title || 'Untitled'}</span>
              </div>
              <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                <p className="text-sm text-foreground whitespace-pre-wrap">{grievance.description || 'No description provided'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Category / Board</label>
                <span className="text-sm font-medium text-foreground">{grievance.category || grievance.department || 'General'}</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {typeof grievance.location === 'object'
                      ? (grievance.location?.address || grievance.location?.district || 'N/A')
                      : (grievance.location || 'N/A')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Citizen Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Name</label>
                  <p className="text-sm font-medium text-foreground truncate">{grievance.citizenName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone</label>
                  <p className="text-sm font-medium text-foreground truncate">{grievance.citizenPhone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Email</label>
                  <p className="text-sm font-medium text-foreground truncate">{grievance.citizenEmail || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Address</label>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{grievance.citizenAddress || grievance.location?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {grievance.images && grievance.images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Attachments</h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{grievance.images.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {grievance.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-xl overflow-hidden cursor-zoom-in border border-border group relative"
                    onClick={() => setFullscreenImage(image)}
                  >
                    <img 
                      src={image} 
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-foreground" size={24} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Update Status</h3>
            <div className="glass-panel p-5 rounded-xl border border-glass-border space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {selectedStatus !== grievance.status && (
                <div className="space-y-3">
                  <button 
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setShowCommentBox(!showCommentBox)}
                  >
                    {showCommentBox ? '- Hide Comment' : '+ Add Optional Note'}
                  </button>
                  
                  {showCommentBox && (
                    <textarea
                      placeholder="Add details about this status update..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full h-24 p-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none custom-scrollbar"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 flex items-center justify-end gap-3 bg-muted/10 shrink-0">
          <button 
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          {selectedStatus !== grievance.status && (
            <button 
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2"
              onClick={handleStatusUpdate}
            >
              <span>Save Updates</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Image modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenImage(null)}
            />
            <motion.div 
              className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center pointer-events-none"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="w-full flex justify-end mb-4 pointer-events-auto">
                <button 
                  className="p-3 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors backdrop-blur-md"
                  onClick={() => setFullscreenImage(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <img 
                src={fullscreenImage} 
                alt="Fullscreen Evidence" 
                className="max-w-full max-h-[calc(90vh-80px)] object-contain rounded-xl shadow-2xl pointer-events-auto border border-border/50"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrievanceModal;