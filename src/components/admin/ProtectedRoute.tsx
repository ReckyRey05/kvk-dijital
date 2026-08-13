"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasBypassCookie = typeof document !== "undefined" && document.cookie.includes("kvk_admin_access=true");
    if (hasBypassCookie) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const hasBypass = typeof document !== "undefined" && document.cookie.includes("kvk_admin_access=true");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user & no bypass cookie and trying to access protected route (will redirect via useEffect)
  if (!user && !hasBypass && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}
