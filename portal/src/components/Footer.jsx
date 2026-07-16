import React from 'react';
import { Landmark } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto border-t border-glass-border bg-card/40 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Landmark size={20} className="text-primary" />
          <span className="text-sm font-semibold text-foreground/80 tracking-tight">Parivartan Portal</span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Parivartan Governance. All rights reserved.
        </p>
        
        <div className="flex items-center gap-6">
          <a href="#privacy" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#terms" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
          <a href="#support" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;