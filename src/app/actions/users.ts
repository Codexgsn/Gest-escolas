
'use client'

import { z } from "zod"
import { ref, set, get, child, push, remove, query, orderByChild, equalTo, update } from "firebase/database";

import { database } from "@/firebase";
import { getUserById } from './data';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email';

const userCreationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["Admin", "Usuário"]),
  password: z.string().min(8),
  avatar: z.string().url().optional().or(z.literal("")),
});


export async function createUserAction(
    values: unknown,
    currentUserId: string | null
) {
    const validatedFields = userCreationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados de criação de usuário inválidos." };
    }

    const { name, email, role, password, avatar } = validatedFields.data;

    // Public registration doesn't require an admin
    if (currentUserId) {
        const currentUser = await getUserById(currentUserId);
        if (!currentUser || currentUser.role !== 'Admin') {
            return { success: false, message: "Permissão negada." };
        }
    }
    
    try {
        // Check if user already exists
        const usersRef = ref(database, 'users');
        const existingUserQuery = query(usersRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(existingUserQuery);
        if (snapshot.exists()) {
            return { success: false, message: "Um usuário com este email já existe." };
        }

        const newUserId = push(usersRef).key;
        if (!newUserId) {
            throw new Error("Failed to generate a new user ID.");
        }

        const newUserRef = ref(database, `users/${newUserId}`);
        await set(newUserRef, {
            name,
            email,
            role,
            password, // In a real app, hash this password!
            avatar: avatar || `https://i.pravatar.cc/150?u=${email}`
        });

        // AI-driven welcome email (optional)
        // await sendWelcomeEmail({ name, email });

        return { success: true, message: `Usuário ${name} criado com sucesso!` };

    } catch (error) {
        console.error("Firebase error:", error);
        return { success: false, message: "Falha ao criar o usuário." };
    }
}

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["Admin", "Usuário"]),
  avatar: z.string().url().optional().or(z.literal("")),
});

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
    const currentUser = await getUserById(currentUserId);
     if (!currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }

    try {
        const { id, ...updateData } = validatedFields.data;
        const userRef = ref(database, `users/${id}`);

        // We must fetch the existing password to avoid overwriting it
        const existingUserSnapshot = await get(userRef);
        if (!existingUserSnapshot.exists()) {
             return { success: false, message: "Usuário não encontrado." };
        }
        const existingPassword = existingUserSnapshot.val().password;

        await set(userRef, {
            ...updateData,
            password: existingPassword // Preserve the password
        });

        return { success: true, message: `Usuário ${updateData.name} atualizado com sucesso!` };

    } catch (error) {
        console.error("Firebase error:", error);
        return { success: false, message: "Falha ao atualizar o usuário." };
    }
}

const passwordUpdateSchema = z.object({
    userIdToUpdate: z.string(),
    newPassword: z.string().min(8),
    currentUserId: z.string(),
});

export async function updateUserPasswordAction(values: unknown) {
     const validatedFields = passwordUpdateSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados inválidos." };
    }

    const { userIdToUpdate, newPassword, currentUserId } = validatedFields.data;
    
    try {
        const currentUser = await getUserById(currentUserId);
        const userToUpdate = await getUserById(userIdToUpdate);

        if (!userToUpdate) {
            return { success: false, message: "Usuário alvo não encontrado." };
        }

        // Check permissions: Admin can change anyone's password except other admins. Users can change their own.
        const isAdmin = currentUser?.role === 'Admin';
        const isSelf = currentUser?.id === userIdToUpdate;
        const targetIsAdmin = userToUpdate?.role === 'Admin';

        if (!isSelf && !(isAdmin && !targetIsAdmin)) {
             return { success: false, message: "Permissão negada para alterar esta senha." };
        }
        
        const userRef = ref(database, `users/${userIdToUpdate}/password`);
        await set(userRef, newPassword); // Again, HASH in real app

        return { success: true, message: "Senha atualizada com sucesso!" };

    } catch (error) {
        return { success: false, message: "Falha ao atualizar a senha." };
    }
}


export async function deleteUserAction(userId: string, currentUserId: string | null) {
  if (!currentUserId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const currentUser = await getUserById(currentUserId);
  if (!currentUser || currentUser.role !== 'Admin') {
      return { success: false, message: "Permissão negada." };
  }
   if (userId === currentUserId) {
    return { success: false, message: "Você não pode excluir sua própria conta." };
  }

  try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      return { success: true, message: "Usuário excluído com sucesso." };
  } catch (error) {
      return { success: false, message: "Falha ao excluir o usuário." };
  }
}

export async function deleteMultipleUsersAction(userIds: string[], currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }
    const currentUser = await getUserById(currentUserId);
    if (!currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }

    if (userIds.includes(currentUserId)) {
        return { success: false, message: "Você não pode se excluir em uma operação em massa." };
    }

    try {
        const updates: { [key: string]: null } = {};
        userIds.forEach(id => {
            updates[`/users/${id}`] = null;
        });
        await update(ref(database), updates);

        return { success: true, message: "Usuários selecionados excluídos com sucesso." };
    } catch (error) {
        return { success: false, message: "Falha ao excluir usuários." };
    }
}

const resetPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function resetPasswordAction(values: unknown) {
    const validatedFields = resetPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados inválidos." };
    }
    
    const { email, password } = validatedFields.data;

    try {
        const usersRef = ref(database, 'users');
        const q = query(usersRef, orderByChild('email'), equalTo(email));
        const snapshot = await get(q);

        if (!snapshot.exists()) {
             return { success: false, message: "Nenhum usuário encontrado com este email." };
        }

        const userId = Object.keys(snapshot.val())[0];
        const userPasswordRef = ref(database, `users/${userId}/password`);
        await set(userPasswordRef, password); // HASH THIS in a real app

        return { success: true, message: "Senha redefinida com sucesso." };
    } catch (error) {
        return { success: false, message: "Falha ao redefinir a senha." };
    }
}
