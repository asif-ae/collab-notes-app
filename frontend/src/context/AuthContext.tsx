"use client";

import { refreshToken as refreshTokenFunc } from "@/api/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  true: boolean;
  // isAuthenticated: boolean;
  // setIsAuthenticated: (value: boolean) => void;
  // loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  accessToken,
  refreshToken,
  children,
}: {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const isLoginOrSignup = pathname === "/login" || pathname === "/signup";
      if (isLoginOrSignup) {
        setLoading(false);
      }

      const isProtectedRoute = pathname === "/";

      console.log({ pathname });
      if (!isProtectedRoute && !accessToken && refreshToken) {
        try {
          await refreshTokenFunc().then((data) => {
            console.log({ data });
            router.push("/"); // ✅ Force redirect to homepage
          });
        } catch (error) {
          console.error("❌ Refresh failed or no cookies", error);
          router.push("/login"); // ✅ Force redirect to login
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(false);
    })();
  }, [pathname, accessToken, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        true: true,
        // isAuthenticated, setIsAuthenticated, loading
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
