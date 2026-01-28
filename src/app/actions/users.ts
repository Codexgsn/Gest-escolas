
'use server';

import { z } from "zod"
import { revalidatePath } from 'next/cache';
import { fetchUserById } from '@/lib/data';
import { hash } from 'bcrypt';
import { ref, push, set, update, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";

// --- Schemas for Validation ---
const userCreationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["Admin", "Usuário"]),
  password: z.string().min(8),
  avatar: z.string().url().optional().or(z.literal("")),
});

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["Admin", "Usuário"]),
  avatar: z.string().url().optional().or(z.literal("")),
});


// --- User Creation ---
export async function createUserAction(
    values: unknown,
    currentUserId: string | null
) {
    const validatedFields = userCreationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados de criação de usuário inválidos." };
    }

    const { name, email, role, password, avatar } = validatedFields.data;

    if (currentUserId) {
        try {
            const currentUser = await fetchUserById(currentUserId);
            if (currentUser && currentUser.role !== 'Admin') {
                return { success: false, message: "Permissão negada. Apenas administradores podem realizar esta ação." };
            }
        } catch (e) {
            console.error("Erro ao verificar permissões em createUserAction:", e);
        }
    }
    
    try {
        // Check if user already exists
        const usersRef = ref(database, 'users');
        const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(emailQuery);

        if (snapshot.exists()) {
            return { success: false, message: "Um usuário com este email já existe." };
        }

        const hashedPassword = await hash(password, 10);

        const newUserRef = push(usersRef);
        await set(newUserRef, {
            name,
            email,
            role,
            password: hashedPassword,
            avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
            createdAt: new Date().toISOString()
        });

        revalidatePath('/dashboard/users');
        return { success: true, message: `Usuário ${name} criado com sucesso!` };

    } catch (error) {
        console.error("Firebase error:", error);
        return { success: false, message: "Falha ao criar o usuário." };
    }
}

// --- User Update ---
export async function updateUserAction(
    values: unknown,
    currentUserId: string | null
) {
    const validatedFields = userUpdateSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados de atualização de usuário inválidos." };
    }

    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }
    try {
        const currentUser = await fetchUserById(currentUserId);
        if (currentUser && currentUser.role !== 'Admin') {
            return { success: false, message: "Permissão negada." };
        }
    } catch (e) {
        console.error("Erro ao verificar permissões em updateUserAction:", e);
    }

    try {
        const { id, name, email, role, avatar } = validatedFields.data;
        
        const userRef = ref(database, `users/${id}`);
        await update(userRef, {
            name,
            email,
            role,
            avatar,
            updatedAt: new Date().toISOString()
        });

        revalidatePath('/dashboard/users');
        return { success: true, message: `Usuário ${name} atualizado com sucesso!` };

    } catch (error) {
        console.error("Firebase error:", error);
        return { success: false, message: "Falha ao atualizar o usuário." };
    }
}

// --- User Deletion ---
export async function deleteUserAction(userId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const currentUser = await fetchUserById(currentUserId);
    if (currentUser && currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }
  } catch (e) {
    console.error("Erro ao verificar permissões em deleteUserAction:", e);
  }

   if (userId === currentUserId) {
    return { success: false, message: "Você não pode excluir sua própria conta." };
  }

  try {
      await remove(ref(database, `users/${userId}`));
      revalidatePath('/dashboard/users');
      return { success: true, message: "Usuário excluído com sucesso." };
  } catch (error) {
      console.error("Firebase error:", error);
      return { success: false, message: "Falha ao excluir o usuário." };
  }
}

export async function deleteMultipleUsersAction(userIds: string[], currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }
    try {
        const currentUser = await fetchUserById(currentUserId);
        if (currentUser && currentUser.role !== 'Admin') {
            return { success: false, message: "Permissão negada." };
        }
    } catch (e) {
        console.error("Erro ao verificar permissões em deleteMultipleUsersAction:", e);
    }

    if (userIds.includes(currentUserId)) {
        return { success: false, message: "Você não pode se excluir em uma operação em massa." };
    }

    try {
        const updates: any = {};
        userIds.forEach(id => {
            updates[id] = null;
        });
        await update(ref(database, 'users'), updates);
        
        revalidatePath('/dashboard/users');
        return { success: true, message: "Usuários selecionados excluídos com sucesso." };
    } catch (error) {
        console.error("Firebase error:", error);
        return { success: false, message: "Falha ao excluir usuários." };
    }
}

// --- Password Reset ---
export async function resetPasswordAction(params: { email: string; password?: string }) {
  const { email, password } = params;
  if (password) {
      console.log(`Password reset for ${email} with new password.`);
      // In a real app, you would hash the password and update it in the DB
      return { success: true, message: "Sua senha foi redefinida com sucesso." };
  }

  console.log(`Password reset requested for ${email}.`);
  return { 
    success: true, 
    message: "Se um usuário com este email existir, um link de redefinição de senha foi enviado."
  };
}
