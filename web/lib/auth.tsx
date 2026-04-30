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
  login: (username: string, token: string) => void;
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
    const storedUser = localStorage.getItem("opd_user");
    const storedToken = localStorage.getItem("opd_token");

    if (storedUser && storedToken) {
      // Validate token by fetching /me
      api.getMe()
        .then((me) => {
          setUsername(me.username);
        })
        .catch(() => {
          localStorage.removeItem("opd_user");
          localStorage.removeItem("opd_token");
          setUsername(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isPublicRoute = pathname === "/" || pathname.startsWith("/setup");
    if (!username && !isPublicRoute) {
      router.push("/");
    }
  }, [username, isLoading, pathname, router]);

  function login(name: string, token: string) {
    localStorage.setItem("opd_user", name);
    localStorage.setItem("opd_token", token);
    setUsername(name);
  }

  function logout() {
    localStorage.removeItem("opd_user");
    localStorage.removeItem("opd_token");
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