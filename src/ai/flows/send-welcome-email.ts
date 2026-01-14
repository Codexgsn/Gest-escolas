// @ts-nocheck
// This file is temporarily disabled to resolve dependency issues.
'use server';

/**
 * @fileOverview A flow for sending a welcome email to a new user.
 *
 * - sendWelcomeEmail - A function that generates and "sends" a welcome email.
 * - SendWelcomeEmailInput - The input type for the sendWelcomeEmail function.
 * - SendWelcomeEmailOutput - The return type for the sendWelcomeEmail function.
 */

export type SendWelcomeEmailInput = any;
export type SendWelcomeEmailOutput = any;

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<SendWelcomeEmailOutput> {
    console.warn("AI flow 'sendWelcomeEmail' is temporarily disabled.");
    return { success: true, message: "Welcome email is temporarily disabled." };
}
