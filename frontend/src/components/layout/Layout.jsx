import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AttackerPanel from '../attacker/AttackerPanel';

const Layout = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex pt-16">
        {showSidebar && <Sidebar />}
        <main 
          className={`
            flex-1 transition-all duration-300
            ${showSidebar ? 'lg:ml-64' : ''}
          `}
          role="main"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      <AttackerPanel />
    </div>
  );
};

export default Layout;
