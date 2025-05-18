"use client"

import React, { createContext, useContext, ReactNode } from "react";

type User = {
    role: "admin" | "retailer";
    retailer: string;
};

const defaultUser: User = {
    role: "retailer",
    retailer: "Tech Store Morocco",
};

const UserContext = createContext<User>(defaultUser);

export const useUser = () => useContext(UserContext);

export function UserProvider({ children, value }: { children: ReactNode; value?: User }) {
    return (
        <UserContext.Provider value={value || defaultUser}>
            {children}
        </UserContext.Provider>
    );
}