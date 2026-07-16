import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Phone, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    { question: "How do I register on the portal?", answer: "To register on the Department Dashboard portal, click on the 'Login' button, select your user type (Citizen, Admin, Staff, or Department), and follow the registration process. You'll need to provide valid identification and contact information." },
    { question: "What services are available through this portal?", answer: "The portal provides access to 18 different government departments including Municipal Corporation, Health Department, Education Department, Revenue Department, Police Department, Public Works Department, Transport Department, Agriculture Department, and more. You can submit grievances, track applications, and access various government services." },
    { question: "How can I track my grievance status?", answer: "Once you submit a grievance, you'll receive a unique grievance ID. You can use this ID to track the status of your grievance through the 'View Status' section. The system provides real-time updates on the progress of your application." },
    { question: "What are the office hours for support?", answer: "Our support team is available Monday to Friday, 9:00 AM to 5:00 PM. For emergency services, we have a 24/7 helpline available at 1800-180-2025. You can also email us at support@kapurthala.gov.in." },
    { question: "How secure is my personal information?", answer: "We take data security very seriously. The portal uses advanced encryption and security measures to protect your personal information. All data is stored securely and accessed only by authorized personnel." },
    { question: "Can I submit multiple grievances?", answer: "Yes, you can submit multiple grievances for different departments or issues. Each grievance will have its own unique ID for tracking purposes." },
    { question: "How long does it take to resolve a grievance?", answer: "Resolution time varies depending on the complexity of the issue and the department involved. Typically, grievances are resolved within 7-30 working days. You can track the progress through your dashboard." }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Everything you need to know about the Parivartan digital portal services and platform usage.</p>
        </motion.div>
        
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-panel border overflow-hidden transition-colors ${isOpen ? 'border-primary/40 bg-primary/5' : 'border-glass-border hover:border-primary/20 hover:bg-muted/30'}`}
              >
                <button 
                  className="w-full px-6 py-5 flex items-center justify-between text-left outline-none"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-lg ${isOpen ? 'text-primary' : 'text-foreground'}`}>{faq.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 mt-2 pt-4">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-glass-border shadow-xl shadow-primary/5"
        >
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-2">Still have questions?</h2>
            <p className="text-muted-foreground">If you need specialized technical support, feel free to contact our helpdesk.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a href="mailto:support@kapurthala.gov.in" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all shadow-md active:scale-95">
              <Mail size={18} />
              <span>Email Support</span>
            </a>
            <a href="tel:1800-180-2025" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-glass-border text-foreground font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm">
              <Phone size={18} />
              <span>1800-180-2025</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;