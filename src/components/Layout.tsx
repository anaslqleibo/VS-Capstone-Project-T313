import React, { RefObject, useEffect } from 'react';
import Sidebar from './Sidebar';
import { injectModalOverlay, PageProps } from '../App';

function Layout({modalContainer, children}:PageProps){
  

  return (
  <div className="flex h-screen overflow-hidden">
      <Sidebar modalContainer={modalContainer} />
      
      <main className="flex-1 overflow-y-scroll relative">
        {injectModalOverlay(modalContainer)}
        {children}
      </main>
  </div>);
}

export default Layout;
