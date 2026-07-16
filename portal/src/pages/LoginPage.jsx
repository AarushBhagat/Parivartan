import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Users, Building2, Smartphone } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import { authenticateUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const APP_DOWNLOAD_LINK = 'https://your-app-download-link.com';

  const handleUserTypeClick = (userType) => {
    if (userType === 'citizen') {
      window.open(APP_DOWNLOAD_LINK, '_blank');
    } else {
      setSelectedUserType(userType);
      setShowForm(true);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await authenticateUser(selectedUserType, credentials);
      if (result.success) {
        login(result.user, selectedUserType);
        
        if (selectedUserType === 'admin') {
          navigate('/admin', { state: { userType: selectedUserType, userData: result.user } });
        } else if (selectedUserType === 'staff') {
          navigate('/staff', { state: { userType: selectedUserType, userData: result.user } });
        } else if (selectedUserType === 'department') {
          const departmentCode = result.user.department || 'pwd';
          navigate(`/department/${departmentCode}`, { state: { userType: selectedUserType, userData: result.user } });
        } else {
          navigate('/dashboard', { state: { userType: selectedUserType, userData: result.user } });
        }
      } else {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedUserType('');
  };

  const roles = [
    { id: 'citizen', label: 'Citizen', desc: 'Mobile App', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'admin', label: 'Admin', desc: 'Control Panel', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'staff', label: 'Staff', desc: 'Field Dispatch', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'department', label: 'Department', desc: 'Resolving Board', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Welcome Back</h2>
                <p className="text-muted-foreground max-w-md mx-auto">Select your designated access role to log into the Parivartan system.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {roles.map((role, idx) => (
                  <motion.div 
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                    onClick={() => handleUserTypeClick(role.id)}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-panel p-6 cursor-pointer group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className={`w-16 h-16 rounded-2xl ${role.bg} ${role.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <role.icon size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{role.label}</h3>
                      <p className="text-sm font-medium text-muted-foreground">{role.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex justify-center w-full"
            >
              <div className="w-full max-w-md">
                <LoginForm 
                  userType={selectedUserType} 
                  onLogin={handleLogin} 
                  onBack={handleBack}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;