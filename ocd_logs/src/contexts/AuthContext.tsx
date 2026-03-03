import React, { createContext, useContext, useEffect, useState } from "react";

// Mock User and Session types to maintain compatibility if needed elsewhere
export interface MockUser {
  id: string;
  email?: string;
}

export interface MockSession {
  user: MockUser;
}

interface AuthContextType {
  user: MockUser | null;
  session: MockSession | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: MockUser = {
  id: "1",
  email: "demo@user.com",
};

const MOCK_SESSION: MockSession = {
  user: MOCK_USER,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(MOCK_USER);
  const [session, setSession] = useState<MockSession | null>(MOCK_SESSION);
  const [isLoading, setIsLoading] = useState(false);

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
