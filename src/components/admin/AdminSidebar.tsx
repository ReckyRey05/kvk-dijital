"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  Users,
  Truck,
  Building2,
  FileText,
  Send,
  ShoppingBag,
  PackageCheck,
  FolderTree,
  Scale,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Webhook,
  Headset,
  Activity,
  History,
  Settings,
  Bell,
  FolderKanban, 
  Layers, 
  PenTool,
  MessageSquare, 
  LogOut,
} from "lucide-react";
import { LogoHorizontal } from "@/components/Logo";

interface NavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Operasyon",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Kullanıcılar", href: "/admin/users", icon: Users },
      { name: "Tedarikçiler", href: "/admin/suppliers", icon: Truck },
      { name: "İşletmeler", href: "/admin/businesses", icon: Building2 },
      { name: "Talepler", href: "/admin/requests", icon: FileText },
      { name: "Teklifler", href: "/admin/offers", icon: Send },
      { name: "Siparişler", href: "/admin/orders", icon: ShoppingBag },
    ],
  },
  {
    title: "Moderasyon & Güvenlik",
    items: [
      { name: "Ürün Moderasyonu", href: "/admin/products", icon: PackageCheck },
      { name: "Kategoriler", href: "/admin/categories", icon: FolderTree },
      { name: "Uyuşmazlıklar", href: "/admin/disputes", icon: Scale },
      { name: "Doğrulamalar", href: "/admin/verifications", icon: ShieldCheck },
      { name: "Şikayetler", href: "/admin/reports", icon: AlertTriangle },
    ],
  },
  {
    title: "Finans & Entegrasyon",
    items: [
      { name: "Finans & Komisyon", href: "/admin/finance", icon: CreditCard },
      { name: "Entegrasyonlar", href: "/admin/integrations", icon: Webhook },
    ],
  },
  {
    title: "Platform & Sistem",
    items: [
      { name: "Destek Masası", href: "/admin/support", icon: Headset },
      { name: "Sistem Durumu", href: "/admin/system", icon: Activity },
      { name: "Audit Log", href: "/admin/audit", icon: History },
      { name: "Platform Ayarları", href: "/admin/settings", icon: Settings },
      { name: "Duyurular", href: "/admin/announcements", icon: Bell },
    ],
  },
  {
    title: "KvK Dijital Web",
    items: [
      { name: "Projeler", href: "/admin/projects", icon: FolderKanban },
      { name: "Hizmetler", href: "/admin/services", icon: Layers },
      { name: "Blog / Makaleler", href: "/admin/blog", icon: PenTool },
      { name: "İletişim Mesajları", href: "/admin/messages", icon: MessageSquare },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800 flex-shrink-0">
        <LogoHorizontal className="h-7 w-auto text-white" />
        <p className="text-xs text-slate-400 mt-1.5 font-mono uppercase tracking-wider">
          Platform Operasyon
        </p>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? "bg-primary text-white font-medium shadow-sm shadow-primary/30" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800 flex-shrink-0 bg-slate-950/40">
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={16} />
          <span className="font-medium">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
