"use client";

import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <ProtectedRoute>
      {isLoginPage ? (
        children
      ) : (
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
