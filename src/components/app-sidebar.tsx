
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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth"; // Corrigido para usar o hook centralizado

const allMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", adminOnly: false },
  { href: "/dashboard/reservations", icon: CalendarDays, label: "Reservas", adminOnly: false },
  { href: "/dashboard/resources", icon: Building, label: "Recursos", adminOnly: false },
  { href: "/dashboard/users", icon: Users, label: "Usuários", adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações", adminOnly: true },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  // CORREÇÃO: Usando os nomes corretos retornados pelo hook useAuth
  const { user, loading } = useAuth(); 

  // Filtra os itens do menu com base na role do usuário
  const menuItems = allMenuItems.filter(item => {
    // Se ainda estiver carregando a autenticação, não renderiza nenhum item 
    // para evitar "piscar" a tela.
    if (loading) {
      return false;
    }
    // Se o item for apenas para administradores, verifica a role do usuário.
    if (item.adminOnly) {
      return user?.role === 'Admin';
    }
    // Se não for admin-only, mostra para todos.
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
