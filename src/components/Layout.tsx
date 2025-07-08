import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      <Header />
      <main className="flex-grow pt-[120px] sm:pt-[130px] md:pt-[140px]"> {/* Responsive padding-top for different header sizes */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;