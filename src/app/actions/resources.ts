
'use server';

import { z } from "zod"
import { revalidatePath } from 'next/cache';
import { fetchUserById } from '@/lib/data';
import { ref, push, set, update, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";

const resourceSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  type: z.string().min(3, "O tipo deve ter pelo menos 3 caracteres."),
  location: z.string().min(3, "A localização deve ter pelo menos 3 caracteres."),
  capacity: z.coerce.number().min(1, "A capacidade/quantidade deve ser de pelo menos 1."),
  equipment: z.string().optional(),
  imageUrl: z.string().url("Por favor, insira uma URL válida."),
  tags: z.array(z.string()).default([]),
});

export async function createResourceAction(
    values: unknown,
    currentUserId: string | null
) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  // Verificação básica de segurança no servidor.
  try {
    const user = await fetchUserById(currentUserId);
    if (user && user.role !== 'Admin') {
        return { success: false, message: "Permissão negada. Apenas administradores podem criar recursos." };
    }
  } catch (e) {
    console.error("Erro ao verificar permissões em createResourceAction:", e);
  }

  const validatedFields = resourceSchema.safeParse(values);
  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return { 
        success: false, 
        message: 'Dados inválidos. Por favor, verifique os campos.', 
        errors: errorMessages
    };
  }

  const { name, type, location, capacity, equipment, imageUrl, tags } = validatedFields.data;
  const equipmentArray = equipment ? equipment.split(',').map(e => e.trim()) : [];

  try {
    const resourcesRef = ref(database, 'resources');
    const newResourceRef = push(resourcesRef);
    await set(newResourceRef, {
      name,
      type,
      location,
      capacity,
      equipment: equipmentArray,
      imageUrl,
      tags,
      availability: 'Disponível'
    });

    revalidatePath('/dashboard/resources');
    return { success: true, message: "Recurso criado com sucesso!" };
  } catch (error) {
    console.error("Firebase Error:", error);
    return { success: false, message: "Falha ao criar o recurso no banco de dados." };
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

  try {
    const user = await fetchUserById(currentUserId);
    if (user && user.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }
  } catch (e) {
     console.error("Erro ao verificar permissões em updateResourceAction:", e);
  }

  const validatedFields = updateResourceSchema.safeParse(values);
  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return { 
        success: false, 
        message: 'Dados inválidos. Por favor, verifique os campos.', 
        errors: errorMessages
    };
  }
  
  const { id, name, type, location, capacity, equipment, imageUrl, tags } = validatedFields.data;
  const equipmentArray = equipment ? equipment.split(',').map(e => e.trim()) : [];

  try {
    const resourceRef = ref(database, `resources/${id}`);
    await update(resourceRef, {
      name,
      type,
      location,
      capacity,
      equipment: equipmentArray,
      imageUrl,
      tags
    });

    revalidatePath('/dashboard/resources');
    revalidatePath(`/dashboard/resources/edit/${id}`);
    return { success: true, message: "Recurso atualizado com sucesso!" };
  } catch (error) {
    console.error("Firebase Error:", error);
    return { success: false, message: "Falha ao atualizar o recurso no banco de dados." };
  }
}


export async function deleteResourceAction(resourceId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }
  
  try {
    const user = await fetchUserById(currentUserId);
    if (user && user.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }
  } catch (e) {
    console.error("Erro ao verificar permissões em deleteResourceAction:", e);
  }

  try {
    // 1. Excluir as reservas associadas ao recurso
    const reservationsRef = ref(database, 'reservations');
    const reservationsQuery = query(reservationsRef, orderByChild('resourceId'), equalTo(resourceId));
    const snapshot = await get(reservationsQuery);

    if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((childSnapshot) => {
            updates[childSnapshot.key as string] = null;
        });
        await update(reservationsRef, updates);
    }

    // 2. Excluir o recurso
    await remove(ref(database, `resources/${resourceId}`));
    
    revalidatePath('/dashboard/resources');
    revalidatePath('/dashboard/reservations');

    return { success: true, message: "Recurso e suas reservas associadas foram excluídos." };
  } catch (error) {
    console.error("Firebase Error:", error);
    return { success: false, message: "Falha ao excluir o recurso." };
  }
}
