import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetMeQuery, useLogoutMutation } from "@/redux/apis/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "@/redux/api";

export type UserRole = "learner" | "trainer" | "admin" | "iqa";

interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: userData, isLoading, refetch } = useGetMeQuery(undefined);
  const [logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = userData?.data?.user || null;
  const isAuthenticated = !!user;

  const logout = async () => {
    try {
      await logoutMutation(undefined).unwrap();
    } catch (error) {

    } finally {
      dispatch(api.util.resetApiState());
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
