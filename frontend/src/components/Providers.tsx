"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export function Providers({
  accessToken,
  refreshToken,
  children,
}: {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  children: ReactNode;
}) {
  return (
    <AuthProvider accessToken={accessToken} refreshToken={refreshToken}>
      {children}
    </AuthProvider>
  );
}
