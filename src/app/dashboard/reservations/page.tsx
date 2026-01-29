
import Link from "next/link";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ReservationsClientView } from "@/components/reservations/reservations-client-view";

// This is now a Server Component
export default function ReservationsPage() {
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <Breadcrumb className="hidden md:flex">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">Painel</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Reservas</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            
            <Suspense fallback={<div>Carregando reservas...</div>}>
                <ReservationsClientView />
            </Suspense>
        </>
    );
}
