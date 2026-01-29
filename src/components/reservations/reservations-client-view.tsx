
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchReservations, fetchUsers } from '@/lib/data';
import { ReservationsList } from '@/components/reservations/reservations-list';
import { ReservationsToolbar } from '@/components/reservations/reservations-toolbar';
import type { Reservation, User } from '@/lib/definitions';

export function ReservationsClientView() {
    const searchParams = useSearchParams();

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Since there is no authUser, we can decide on a default behavior.
                // For now, let's fetch all reservations and all users, as an admin would.
                // This can be adjusted later when a proper auth system is in place.
                const status = searchParams.get('status') || ['Confirmada', 'Pendente'];
                const showAll = searchParams.get('showAll') === 'true';
                const userIdParam = searchParams.get('userId');

                const filters = {
                    status: status,
                    userId: userIdParam,
                    showAll: showAll,
                };

                const [reservationsData, usersData] = await Promise.all([
                    fetchReservations(filters),
                    fetchUsers(),
                ]);

                setReservations(reservationsData);
                setAllUsers(usersData);
            } catch (error) {
                console.error("Failed to load reservation data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [searchParams]);

    if (loading) {
        return <div>Carregando reservas...</div>; // Simple loading state
    }

    // Default to non-admin view as there is no user context
    const isAdmin = false; 

    return (
        <div className="space-y-4">
            <ReservationsToolbar 
                allUsers={allUsers} 
                isAdmin={isAdmin}
            />
            <ReservationsList 
                reservations={reservations} 
                currentUserId={null} // No current user
                isAdmin={isAdmin}
            />
        </div>
    );
}
