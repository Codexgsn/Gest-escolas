
'use server';

import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { fetchUserById } from "@/lib/data";
import { ref, push, set, update, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";

// Helper function to check for overlapping reservations using Firebase
async function hasConflict(resourceId: string, startTime: Date, endTime: Date, reservationId: string | null = null): Promise<boolean> {
    try {
        const reservationsRef = ref(database, 'reservations');
        const reservationsQuery = query(reservationsRef, orderByChild('resourceId'), equalTo(resourceId));
        const snapshot = await get(reservationsQuery);

        if (!snapshot.exists()) return false;

        const data = snapshot.val();
        const reservationsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));

        return reservationsList.some(r => {
            if (r.id === reservationId) return false;
            if (r.status !== 'Confirmada') return false;

            const rStart = new Date(r.startTime);
            const rEnd = new Date(r.endTime);

            // Overlap check: (StartA < EndB) and (EndA > StartB)
            return startTime < rEnd && endTime > rStart;
        });
    } catch (error) {
        console.error("Firebase Error in hasConflict:", error);
        return true; // Safe default
    }
}

const reservationBaseSchema = z.object({
  resourceId: z.string({ required_error: "Por favor, selecione um recurso." }),
  date: z.coerce.date({ required_error: "Por favor, selecione uma data." }),
  startTime: z.string({ required_error: "Por favor, selecione um horário de início." }),
  endTime: z.string({ required_error: "Por favor, selecione um horário de término." }),
});

const reservationSchema = reservationBaseSchema.refine(data => {
    return data.endTime > data.startTime;
}, {
    message: "O horário de término deve ser posterior ao horário de início.",
    path: ["endTime"],
});

export async function createReservationAction(values: unknown, currentUserId: string | null) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const validatedFields = reservationSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { resourceId, date, startTime, endTime } = validatedFields.data;

  const startDateTime = new Date(date);
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes, 0, 0);

  const endDateTime = new Date(date);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes, 0, 0);

  if (await hasConflict(resourceId, startDateTime, endDateTime)) {
    return { success: false, message: "Conflito de agendamento. Este horário já está reservado para o recurso selecionado." };
  }

  try {
    const reservationsRef = ref(database, 'reservations');
    const newReservationRef = push(reservationsRef);
    await set(newReservationRef, {
      userId: currentUserId,
      resourceId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: 'Confirmada',
      createdAt: new Date().toISOString()
    });

    revalidatePath('/dashboard/reservations');
    return { success: true, message: "Reserva criada com sucesso!" };
  } catch (error) {
    console.error("Firebase Error:", error);
    return { success: false, message: "Falha ao criar a reserva no banco de dados." };
  }
}

const updateReservationSchema = reservationBaseSchema.extend({
    id: z.string(),
}).refine(data => {
    return data.endTime > data.startTime;
}, {
    message: "O horário de término deve ser posterior ao horário de início.",
    path: ["endTime"],
});

export async function updateReservationAction(values: unknown, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const validatedFields = updateReservationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { id, resourceId, date, startTime, endTime } = validatedFields.data;

    const user = await fetchUserById(currentUserId);

    const reservationRef = ref(database, `reservations/${id}`);
    const snapshot = await get(reservationRef);

    if(!snapshot.exists()) {
        return { success: false, message: "Reserva não encontrada." };
    }
    const reservationData = snapshot.val();
    const reservationOwnerId = reservationData.userId;

    if (!user || (user.id !== reservationOwnerId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada para editar esta reserva." };
    }

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    if (await hasConflict(resourceId, startDateTime, endDateTime, id)) {
        return { success: false, message: "Conflito de agendamento. O horário selecionado não está disponível." };
    }

    try {
        await update(reservationRef, {
            resourceId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            updatedAt: new Date().toISOString()
        });
        revalidatePath('/dashboard/reservations');
        revalidatePath(`/dashboard/reservations/edit/${id}`);
        return { success: true, message: "Reserva atualizada com sucesso!" };
    } catch (error) {
        console.error("Firebase Error:", error);
        return { success: false, message: "Falha ao atualizar a reserva." };
    }
}

export async function cancelReservationAction(reservationId: string, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const user = await fetchUserById(currentUserId);
    const reservationRef = ref(database, `reservations/${reservationId}`);
    const snapshot = await get(reservationRef);

    if(!snapshot.exists()) {
       return { success: false, message: "Reserva não encontrada." };
    }
    const reservation = snapshot.val();

    if (!user || (user.id !== reservation.userId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada para cancelar esta reserva." };
    }

    try {
        await update(reservationRef, { status: 'Cancelada' });
        revalidatePath('/dashboard/reservations');
        return { success: true, message: "Reserva cancelada com sucesso." };
    } catch (error) {
        console.error("Firebase Error:", error);
        return { success: false, message: "Falha ao cancelar a reserva." };
    }
}
