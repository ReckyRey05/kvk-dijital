"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Layers, 
  MessageSquare, 
  LogOut,
  PenTool 
} from "lucide-react";
import { LogoHorizontal } from "@/components/Logo";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projeler", href: "/admin/projects", icon: FolderKanban },
  { name: "Hizmetler", href: "/admin/services", icon: Layers },
  { name: "Blog / Makaleler", href: "/admin/blog", icon: PenTool },
  { name: "Mesajlar", href: "/admin/messages", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/5 border-r border-white/10 flex flex-col min-h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <LogoHorizontal className="h-8 w-auto text-white" />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-accent/20 text-accent" 
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
