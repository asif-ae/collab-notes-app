"use client";

import { logout } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

function Logout() {
  const router = useRouter();
  const handleLogout = useCallback(async () => {
    await logout().then(() => {
      router.push("/login");
    });
  }, []);
  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
