
'use client'

import { z } from "zod"
import { ref, set, get, push, update } from "firebase/database";
import { database } from "@/firebase";

import { getReservations, getUserById } from './data';
import type { Reservation } from '@/lib/data';

const createReservationSchema = z.object({
  userId: z.string(),
  resourceId: z.string(),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional(),
});

// Helper function to check for overlapping reservations
async function hasConflict(newReservation: { resourceId: string, startTime: Date, endTime: Date, id?: string }): Promise<boolean> {
    const allReservations = await getReservations();
    const conflictingReservations = allReservations.filter(existing => {
        // Ignore the reservation itself if we are updating
        if (newReservation.id && newReservation.id === existing.id) {
            return false;
        }

        return (
            existing.resourceId === newReservation.resourceId &&
            existing.status === "Confirmada" &&
            (
                (newReservation.startTime >= existing.startTime && newReservation.startTime < existing.endTime) ||
                (newReservation.endTime > existing.startTime && newReservation.endTime <= existing.endTime) ||
                (newReservation.startTime <= existing.startTime && newReservation.endTime >= existing.endTime)
            )
        );
    });
    return conflictingReservations.length > 0;
}

export async function createReservationAction(values: unknown) {
  const validatedFields = createReservationSchema.safeParse(values)

  if (!validatedFields.success) {
    return { success: false, message: 'Dados inválidos. Verifique as informações.' }
  }

  const { userId, resourceId, date, startTime, endTime, description } = validatedFields.data

  const startDateTime = new Date(date);
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(date);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes, 0, 0);
  
  if (await hasConflict({ resourceId, startTime: startDateTime, endTime: endDateTime })) {
    return { success: false, message: "Conflito de agendamento. Este horário já está reservado." };
  }
  
  const newReservation: Omit<Reservation, 'id'> = {
    userId,
    resourceId,
    startTime: startDateTime,
    endTime: endDateTime,
    purpose: description || "",
    status: 'Confirmada', // Or 'Pendente' if you have an approval flow
  };

  try {
    const newReservationRef = push(ref(database, 'reservations'));
    await set(newReservationRef, {
        ...newReservation,
        startTime: newReservation.startTime.toISOString(),
        endTime: newReservation.endTime.toISOString(),
    });
    return { success: true, message: "Reserva criada com sucesso!" };
  } catch (error) {
    console.error("Firebase error:", error);
    return { success: false, message: "Falha ao criar a reserva no banco de dados." };
  }
}

const updateReservationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    resourceId: z.string(),
    date: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string().optional(),
});


export async function updateReservationAction(values: unknown, currentUserId: string) {
    const validatedFields = updateReservationSchema.safeParse(values)

    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.' }
    }
    
    const { id, userId, resourceId, date, startTime, endTime, description } = validatedFields.data;

    const user = await getUserById(currentUserId);
    if (!user || (user.id !== userId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada." };
    }

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    if (await hasConflict({ id, resourceId, startTime: startDateTime, endTime: endDateTime })) {
        return { success: false, message: "Conflito de agendamento. Este horário já está reservado." };
    }

    const updatedData = {
        resourceId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: description || "",
    };

    try {
        const reservationRef = ref(database, `reservations/${id}`);
        await update(reservationRef, updatedData);
        return { success: true, message: "Reserva atualizada com sucesso!" };
    } catch (error) {
        return { success: false, message: "Falha ao atualizar a reserva." };
    }
}


export async function cancelReservationAction(reservationId: string, currentUserId: string) {
    const user = await getUserById(currentUserId);
    const reservationSnapshot = await get(ref(database, `reservations/${reservationId}`));
    if (!reservationSnapshot.exists()) {
       return { success: false, message: "Reserva não encontrada." };
    }
    const reservation = reservationSnapshot.val();

    if (!user || (user.id !== reservation.userId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada." };
    }

    try {
        const reservationRef = ref(database, `reservations/${reservationId}`);
        await update(reservationRef, { status: 'Cancelada' });
        return { success: true, message: "Reserva cancelada com sucesso." };
    } catch (error) {
        return { success: false, message: "Falha ao cancelar a reserva." };
    }
}
