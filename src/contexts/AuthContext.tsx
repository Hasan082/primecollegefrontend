import { createContext, useContext, useState, ReactNode } from "react";

interface DemoUser {
  name: string;
  email: string;
  role: "learner";
}

interface AuthContextType {
  user: DemoUser | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: DemoUser = {
  name: "John Smith",
  email: "john.smith@example.com",
  role: "learner",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(() => {
    const saved = sessionStorage.getItem("demo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = () => {
    sessionStorage.setItem("demo_user", JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
  };

  const logout = () => {
    sessionStorage.removeItem("demo_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
