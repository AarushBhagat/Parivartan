import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import FAQPage from './pages/FAQPage';
import CheckStatusPage from './pages/CheckStatusPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-grow flex flex-col w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* All routes get the global Layout */}
        <Route path="/" element={
          <Layout>
            <PageTransition>
              <HomePage />
            </PageTransition>
          </Layout>
        } />
        
        {/* All other routes get the global Layout */}
        <Route path="/faq" element={<Layout><PageTransition><FAQPage /></PageTransition></Layout>} />
        <Route path="/login" element={<Layout><PageTransition><LoginPage /></PageTransition></Layout>} />
        <Route path="/check-status" element={<Layout><PageTransition><CheckStatusPage /></PageTransition></Layout>} />
        <Route path="/dashboard" element={<Layout><PageTransition><Dashboard /></PageTransition></Layout>} />
        <Route path="/staff" element={<Layout><PageTransition><StaffDashboard /></PageTransition></Layout>} />
        <Route path="/admin" element={<Layout><PageTransition><AdminDashboard /></PageTransition></Layout>} />
        <Route path="/department/:departmentCode" element={
          <Layout>
            <PageTransition>
              <ErrorBoundary>
                <DepartmentDashboard />
              </ErrorBoundary>
            </PageTransition>
          </Layout>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App bg-background text-foreground min-h-screen">
          <AnimatedBackground>
            <AnimatedRoutes />
          </AnimatedBackground>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;