
"use client";

import {
    BookOpenCheck,
    Building,
    CalendarDays,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"; // useSidebar removido daqui
import { useLayoutStore } from "@/lib/store"; // Importação direta do store
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const allMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", adminOnly: false },
  { href: "/dashboard/reservations", icon: CalendarDays, label: "Reservas", adminOnly: false },
  { href: "/dashboard/resources", icon: Building, label: "Recursos", adminOnly: false },
  { href: "/dashboard/users", icon: Users, label: "Usuários", adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações", adminOnly: true },
];

export default function AppSidebar() {
  const pathname = usePathname();
  // Correção: Usando o store diretamente para obter o estado do sidebar
  const state = useLayoutStore((s) => s.getState());
  // Correção: Usando os nomes corretos (currentUser, isUserLoading) retornados pelo hook useAuth
  const { currentUser, isUserLoading } = useAuth();

  const menuItems = allMenuItems.filter(item => {
    if (isUserLoading) {
      return false;
    }
    if (item.adminOnly) {
      return currentUser?.role === 'Admin';
    }
    return true;
  });

  return (
    <Sidebar className="border-r">
       <SidebarHeader>
        <div className="flex items-center gap-2">
            <BookOpenCheck className="w-8 h-8 text-primary" />
            <span className={cn("text-lg font-semibold", { 'sr-only': state === 'collapsed' })}>Gestão Escolar</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              as={Link}
              // @ts-ignore
              href={item.href}
              title={item.label}
              className={cn("w-full", {
                "bg-sidebar-accent text-sidebar-accent-foreground": pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard'),
              })}
              tooltip={item.label}
            >
              <item.icon className="h-5 w-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );
}
