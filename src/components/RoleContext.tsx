import React, { createContext, useContext } from 'react';
import { User } from "firebase/auth";
import { getUserAccess, Role } from '../classes/User';

type RoleContextType = {
    role: Role;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ user, children }: { user: User; children: React.ReactNode }) {
    const role = getUserAccess(user);
    return (
        <RoleContext.Provider value={{ role }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (!context) throw new Error('useRole must be used inside RoleProvider');
    return context.role;
}

