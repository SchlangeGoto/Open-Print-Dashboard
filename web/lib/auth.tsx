"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface AuthContextType {
  username: string | null;
  isLoading: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("opd_user");
    if (stored) {
      setUsername(stored);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Public routes that don't need auth
    const isPublicRoute = pathname === "/" || pathname.startsWith("/setup");

    if (!username && !isPublicRoute) {
      router.push("/");
    }
  }, [username, isLoading, pathname, router]);

  function login(name: string) {
    localStorage.setItem("opd_user", name);
    setUsername(name);
  }

  function logout() {
    localStorage.removeItem("opd_user");
    setUsername(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ username, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}