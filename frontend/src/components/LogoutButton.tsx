"use client";

import { useAuth } from "@/context/AuthContext";
import { logout } from "@/api/auth";

export default function LogoutButton() {
  const { setAccessToken } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setAccessToken(null);
    } catch (error: unknown) {
      console.error(error);
      alert("Logout failed. Please try again.");
    }
  };

  return <button onClick={handleLogout} className="btn-secondary">Logout</button>;
}
