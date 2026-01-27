
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchReservations, fetchUsers, fetchUserById } from '@/lib/data';
import { ReservationsList } from '@/components/reservations/reservations-list';
import { ReservationsToolbar } from '@/components/reservations/reservations-toolbar';
import type { Reservation, User } from '@/lib/definitions';

export function ReservationsClientView() {
    const { user: authUser, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!authUser) {
                if (!authLoading) setLoading(false);
                return;
            }

            try {
                const userDetails = await fetchUserById(authUser.id);
                setCurrentUser(userDetails);
                const isAdmin = userDetails?.role === 'Admin';

                const status = searchParams.get('status') || ['Confirmada', 'Pendente'];
                const showAll = searchParams.get('showAll') === 'true';
                const userIdParam = searchParams.get('userId');

                const userId = (isAdmin && showAll) ? (userIdParam || undefined) : (userIdParam || authUser.id);
                const filters = {
                    status: status,
                    userId: userId,
                };

                const [reservationsData, usersData] = await Promise.all([
                    fetchReservations(filters),
                    isAdmin ? fetchUsers() : Promise.resolve([]),
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
    }, [authUser, authLoading, searchParams]);

    if (loading || authLoading) {
        return <div>Carregando reservas...</div>;
    }

    const isAdmin = currentUser?.role === 'Admin';

    return (
        <div className="space-y-4">
            <ReservationsToolbar 
                allUsers={allUsers} 
                isAdmin={isAdmin}
            />
            <ReservationsList 
                reservations={reservations} 
                currentUserId={authUser?.id || null}
                isAdmin={isAdmin}
            />
        </div>
    );
}
