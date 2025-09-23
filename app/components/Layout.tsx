"use client";
import { usePathname } from "next/navigation";
import { RefObject } from 'react';
import { ModalProvider, useModal } from './ModalContext';
import Sidebar from './Sidebar';
import { PageProps } from '@/app/layout';


function injectModalOverlay(modalContainer: RefObject<HTMLDivElement|null>){
  return <div className="absolute z-100 inset-0 m-auto pointer-events-none w-full" ref={modalContainer}></div>;
}

function Layout({modalContainer, children}:PageProps){
  // const { modalShown } = useModal();


  const pathname = usePathname();
  const hideSidebar = pathname === "/portal";     

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex overflow-hidden flex-col md:flex-row flex-1">
        {!hideSidebar && <Sidebar modalContainer={modalContainer} />}
        
        <main className="flex-1 overflow-hidden relative">
          {injectModalOverlay(modalContainer)}
          {children}
        </main>
    </div>
    <footer className="bg-[var(--primary)] py-2 px-4 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
        <div className="text-[var(--primary-color)] text-sm">
          &copy; {new Date().getFullYear()} Two Bent Rods. All rights reserved.
        </div>
      </footer>
    </div>
    
  );
}

export default Layout;
