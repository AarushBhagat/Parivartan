import React, { useState } from 'react';
import GrievanceCard from './GrievanceCard';
import GrievanceModal from './GrievanceModal';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const GrievanceList = ({ grievances, onStatusUpdate, department }) => {
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (grievance) => {
    setSelectedGrievance(grievance);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGrievance(null);
  };

  const handleStatusUpdate = (grievanceId, newStatus) => {
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(grievanceId, newStatus);
      if (selectedGrievance && selectedGrievance.id === grievanceId) {
        setSelectedGrievance({
          ...selectedGrievance,
          status: newStatus
        });
      }
    }
  };

  if (grievances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel border border-glass-border rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Grievances Found</h3>
        <p className="text-muted-foreground">No grievances match your current criteria.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="w-full">
      <motion.div 
        className="grid grid-cols-1 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {grievances.map((grievance) => (
          <motion.div key={grievance.id} variants={itemVariants}>
            <GrievanceCard
              grievance={grievance}
              onViewDetails={handleViewDetails}
              onStatusUpdate={handleStatusUpdate}
              department={department}
            />
          </motion.div>
        ))}
      </motion.div>

      {showModal && selectedGrievance && (
        <GrievanceModal
          grievance={selectedGrievance}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          department={department}
        />
      )}
    </div>
  );
};

export default GrievanceList;