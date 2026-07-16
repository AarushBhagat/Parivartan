import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Mail, Lock, RefreshCw, KeyRound, Building2 } from 'lucide-react';

const LoginForm = ({ userType, onLogin, onBack }) => {
  const [formData, setFormData] = useState({ username: '', password: '', department: '', captcha: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [mathCaptcha, setMathCaptcha] = useState({ question: '', answer: 0 });
  const [captchaRotate, setCaptchaRotate] = useState(0);

  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const question = `${num1} + ${num2} = ?`;
    const answer = num1 + num2;
    setMathCaptcha({ question, answer });
    setCaptchaRotate(prev => prev + 360);
  };

  useEffect(() => {
    generateMathCaptcha();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(formData.captcha) !== mathCaptcha.answer) {
      alert('Captcha validation failed. Please try again.');
      generateMathCaptcha();
      setFormData({ ...formData, captcha: '' });
      return;
    }
    onLogin(formData);
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail) {
      alert('Please enter your email address.');
      return;
    }
    alert(`Password reset instructions sent to: ${forgotPasswordEmail}`);
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
  };

  const getUserTypeTitle = () => {
    switch(userType) {
      case 'admin': return 'Admin';
      case 'staff': return 'Staff';
      case 'department': return 'Department';
      default: return 'User';
    }
  };

  return (
    <div className="glass-panel p-8 md:p-10 w-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={onBack} 
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{getUserTypeTitle()} Portal</h2>
      </div>

      <AnimatePresence mode="wait">
        {!showForgotPassword ? (
          <motion.div
            key="login-inputs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col relative z-10"
          >
            {/* Dev hint block */}
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground space-y-2 shadow-sm">
              {userType === 'admin' && (
                <div><strong>Admin:</strong> <code>admin@parivartan.gov.in</code> | Pass: <code>admin123</code></div>
              )}
              {userType === 'staff' && (
                <div><strong>Staff:</strong> <code>staff@parivartan.gov.in</code> | Pass: <code>staff123</code></div>
              )}
              {userType === 'department' && (
                <div className="space-y-2">
                  <div><strong>Department Accounts (Pass: <code>dept123</code>):</strong></div>
                  <div className="grid grid-cols-1 gap-1 opacity-80">
                    <div>pwd@parivartan.gov.in</div>
                    <div>municipal@parivartan.gov.in</div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-foreground">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="name@parivartan.gov.in"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
                  />
                </div>
              </div>

              {userType === 'department' && (
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-semibold text-foreground">Department</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Select Board</option>
                      <option value="pwd">Public Works Department (PWD)</option>
                      <option value="municipal">Municipal Corporation</option>
                      <option value="traffic-police">Traffic Police</option>
                      <option value="water-sanitation">Water Supply & Sanitation</option>
                      <option value="pspcl">PSPCL (Electricity)</option>
                      <option value="health-welfare">Health & Family Welfare</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Captcha Redesign */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Security Verification</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-muted border border-input/50 min-w-[140px] justify-between shadow-inner">
                    <span className="font-mono font-bold text-foreground tracking-widest">{mathCaptcha.question}</span>
                    <motion.button 
                      type="button" 
                      onClick={generateMathCaptcha}
                      animate={{ rotate: captchaRotate }}
                      transition={{ type: "spring", stiffness: 100 }}
                      className="text-muted-foreground hover:text-primary transition-colors p-1 bg-white/50 dark:bg-black/20 rounded-md"
                      title="New puzzle"
                    >
                      <RefreshCw size={14} />
                    </motion.button>
                  </div>
                  <input
                    type="text"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleInputChange}
                    placeholder="Result"
                    required
                    className="flex-1 h-12 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground text-center font-mono font-bold shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button type="submit" className="w-full h-12 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center">
                  Sign In
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors self-center"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center text-center relative z-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <KeyRound size={28} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Reset Password</h3>
            <p className="text-sm text-muted-foreground mb-8">Enter your email below and we'll forward recovery instructions.</p>
            
            <div className="w-full space-y-5 text-left">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="name@parivartan.gov.in"
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 text-foreground shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]"
                >
                  Send Instructions
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full h-12 rounded-xl bg-transparent border border-border text-foreground font-medium hover:bg-muted/50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginForm;