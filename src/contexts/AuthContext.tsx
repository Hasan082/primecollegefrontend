import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "learner" | "trainer" | "admin" | "iqa";

interface DemoUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: DemoUser | null;
  login: (role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, DemoUser> = {
  learner: { name: "John Smith", email: "john.smith@example.com", role: "learner" },
  trainer: { name: "Sarah Jones", email: "trainer@primecollege.edu", role: "trainer" },
  admin: { name: "Admin User", email: "admin@primecollege.edu", role: "admin" },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DemoUser | null>(() => {
    const saved = sessionStorage.getItem("demo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (role: UserRole = "learner") => {
    const u = DEMO_USERS[role];
    sessionStorage.setItem("demo_user", JSON.stringify(u));
    setUser(u);
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
