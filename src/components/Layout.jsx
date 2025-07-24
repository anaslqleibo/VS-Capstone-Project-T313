import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main style={{ marginLeft: '220px', padding: '30px', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
