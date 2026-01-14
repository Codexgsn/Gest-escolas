
'use client'

import { z } from "zod"
import { ref, set, get, push, remove, update } from "firebase/database";
import { database } from "@/firebase";
import { getUserById } from "./data";
import type { Resource } from "@/lib/data";


const resourceSchema = z.object({
  name: z.string().min(3),
  type: z.string().min(3),
  location: z.string().min(3),
  capacity: z.coerce.number().min(1),
  equipment: z.string().optional(),
  imageUrl: z.string().url(),
  tags: z.array(z.string()).default([]),
});

export async function createResourceAction(
    values: unknown,
    currentUserId: string | null
) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const user = await getUserById(currentUserId);
  if (!user || user.role !== 'Admin') {
      return { success: false, message: "Permissão negada. Apenas administradores podem criar recursos." };
  }

  const validatedFields = resourceSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  const { equipment, ...rest } = validatedFields.data;
  
  const newResource: Omit<Resource, 'id'> = {
    ...rest,
    equipment: equipment ? equipment.split(',').map(e => e.trim()) : [],
    availability: "Disponível", // Default value
  };

  try {
    const newResourceRef = push(ref(database, 'resources'));
    await set(newResourceRef, newResource);
    return { success: true, message: "Recurso criado com sucesso!" };
  } catch (error) {
    return { success: false, message: "Falha ao criar o recurso." };
  }
}

const updateResourceSchema = resourceSchema.extend({
    id: z.string(),
});

export async function updateResourceAction(
    values: unknown,
    currentUserId: string | null
) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const user = await getUserById(currentUserId);
  if (!user || user.role !== 'Admin') {
      return { success: false, message: "Permissão negada." };
  }

  const validatedFields = updateResourceSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados inválidos.' };
  }
  
  const { id, equipment, ...rest } = validatedFields.data;
  
  const updatedData = {
    ...rest,
    equipment: equipment ? equipment.split(',').map(e => e.trim()) : [],
  };

  try {
    const resourceRef = ref(database, `resources/${id}`);
    await set(resourceRef, updatedData); // `set` overwrites, which is fine here since we have all fields
    return { success: true, message: "Recurso atualizado com sucesso!" };
  } catch (error) {
    return { success: false, message: "Falha ao atualizar o recurso." };
  }
}


export async function deleteResourceAction(resourceId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }
  
  const user = await getUserById(currentUserId);
  if (!user || user.role !== 'Admin') {
      return { success: false, message: "Permissão negada." };
  }

  try {
    const resourceRef = ref(database, `resources/${resourceId}`);
    await remove(resourceRef);

    // Also delete associated reservations (optional but good practice)
    const reservationsSnapshot = await get(ref(database, 'reservations'));
    if (reservationsSnapshot.exists()) {
        const updates: { [key: string]: null } = {};
        const allReservations = reservationsSnapshot.val();
        for (const resId in allReservations) {
            if (allReservations[resId].resourceId === resourceId) {
                updates[`/reservations/${resId}`] = null;
            }
        }
        if(Object.keys(updates).length > 0) {
            await update(ref(database), updates);
        }
    }
    
    return { success: true, message: "Recurso e suas reservas associadas foram excluídos." };
  } catch (error) {
    return { success: false, message: "Falha ao excluir o recurso." };
  }
}
