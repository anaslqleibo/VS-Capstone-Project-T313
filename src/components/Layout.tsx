import React, { RefObject } from 'react';
import Sidebar from './Sidebar';
import { injectModalOverlay, PageProps } from '../App';

function Layout({modalContainer, rootRef, children}:PageProps){
  return (<div className="flex h-screen overflow-hidden">
    <Sidebar modalContainer={modalContainer} rootRef={rootRef}/>
      
      <main className="w-full overflow-y-scroll">
        {injectModalOverlay(modalContainer)}
        {children}
      </main>
  </div>);
}

export default Layout;
