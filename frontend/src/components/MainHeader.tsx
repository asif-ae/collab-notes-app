"use client";

import { me, logout } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface HeaderProps {
  onCreateNote: () => void;
}

export default function MainHeader({ onCreateNote }: HeaderProps) {
  const [userName, setUserName] = useState<string>("User");
  const router = useRouter();

  // Fetch user info on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setUserName(data?.name || "User");
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    })();
  }, []);

  // Logout Handler
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  }, [router]);

  return (
    <div className="flex justify-between items-center py-4 border-b mb-6">
      {/* Left: User Name */}
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <span className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
          {userName[0]?.toUpperCase()}
        </span>
        <span>{userName}</span>
      </div>

      {/* Center: Title */}
      <h1 className="text-2xl font-bold text-center">Your Notes</h1>

      {/* Right: Create Note & Logout */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateNote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition"
        >
          + New Note
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
