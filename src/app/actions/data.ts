
'use client'

import { ref, get, child } from "firebase/database";
import { database } from "@/firebase";
import { type Resource, type User, type Reservation } from '@/lib/data';

// --- Resources ---
export async function getResources(): Promise<Resource[]> {
    try {
        const snapshot = await get(ref(database, 'resources'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching resources:", error);
        return [];
    }
}

export async function getResourceById(id: string): Promise<Resource | undefined> {
    try {
        const snapshot = await get(child(ref(database), `resources/${id}`));
        if (snapshot.exists()) {
            return { id: snapshot.key, ...snapshot.val() };
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching resource ${id}:`, error);
        return undefined;
    }
}


// --- Users ---
export async function getUsers(): Promise<User[]> {
    try {
        const snapshot = await get(ref(database, 'users'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            // We need to filter out the password before sending to client
            return Object.keys(data).map(key => {
                const { password, ...user } = data[key];
                return { id: key, ...user };
            });
        }
        return [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
    try {
        const snapshot = await get(child(ref(database), `users/${id}`));
        if (snapshot.exists()) {
             const { password, ...user } = snapshot.val();
            return { id: snapshot.key, ...user };
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return undefined;
    }
}


// --- Reservations ---
export async function getReservations(): Promise<Reservation[]> {
    try {
        const snapshot = await get(ref(database, 'reservations'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                startTime: new Date(data[key].startTime),
                endTime: new Date(data[key].endTime),
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return [];
    }
}

export async function getReservationById(id: string): Promise<Reservation | undefined> {
    try {
        const snapshot = await get(child(ref(database), `reservations/${id}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return {
                id: snapshot.key,
                ...data,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
            };
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching reservation ${id}:`, error);
        return undefined;
    }
}
