import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
  modalShown: boolean;
  setModalShown: (value: boolean) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalShown, setModalShown] = useState(false);

  return (
    <ModalContext.Provider value={{ modalShown, setModalShown }}>
      {children}
    </ModalContext.Provider>
  );
}
