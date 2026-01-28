
'use client';

import { useState, useEffect } from 'react';
import { notFound, redirect, useParams } from 'next/navigation';
import { fetchReservationById, fetchResources, fetchUserById } from "@/lib/data";
import { getSettings } from "@/app/actions/settings";
import { EditReservationForm } from "@/components/reservations/edit-reservation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { Reservation, Resource, User } from '@/lib/definitions';
import { SchoolSettings } from '@/app/actions/settings';

export default function EditReservationPage() {
  const params = useParams();
  const id = params.id as string;
  const { user: authUser, loading: authLoading } = useAuth();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!authUser) {
          setLoading(false);
          return;
      }

      try {
        const [resData, resourcesData, settingsData, userData] = await Promise.all([
          fetchReservationById(id),
          fetchResources(),
          getSettings(),
          fetchUserById(authUser.id)
        ]);

        if (!resData) {
          setError(true);
        } else {
          setReservation(resData);
          setResources(resourcesData);
          setSettings(settingsData);
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Error loading reservation data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, authUser, authLoading]);

  if (authLoading || loading) {
    return <div className="p-8 text-center">Carregando dados da reserva...</div>;
  }

  if (error || !reservation) {
    return notFound();
  }

  // Check for permissions
  const isOwner = reservation.userId === authUser?.id;
  const isAdmin = currentUser?.role === 'Admin';

  if (!isOwner && !isAdmin) {
    return redirect('/dashboard/reservations');
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Reserva</CardTitle>
        <CardDescription>
          Modifique os detalhes da sua reserva. O sistema verificará novamente por conflitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {settings && (
            <EditReservationForm
                reservation={reservation}
                resources={resources}
                settings={settings}
            />
        )}
      </CardContent>
    </Card>
  );
}
