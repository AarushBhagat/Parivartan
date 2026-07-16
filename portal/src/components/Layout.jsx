import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import { Toaster } from 'sonner';

const Layout = ({ children }) => {
  return (
    <AnimatedBackground>
      <Toaster position="top-right" richColors theme="system" />
      <Header />
      <main className="flex-grow w-full z-10 flex flex-col relative pt-[80px]">
        {children}
      </main>
      <Footer />
    </AnimatedBackground>
  );
};

export default Layout;
