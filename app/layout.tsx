"use client";

import { ReactNode, RefObject, useRef } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "@/app/globals.css";
import React from "react";
import { ModalProvider } from "@/app/components/ModalContext";
import { AuthProvider } from "@/app/contexts/AuthContext";

export interface PageProps{
  modalContainer: RefObject<HTMLDivElement|null>;
  children?: ReactNode;
}

export function injectModalOverlay(modalContainer: RefObject<HTMLDivElement|null>){
  return <div className="absolute z-100 inset-0 m-auto pointer-events-none w-full" ref={modalContainer}></div>;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </AuthProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
