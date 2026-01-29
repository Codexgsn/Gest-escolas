
'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Resources ---

const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  location: z.string(),
  capacity: z.number(),
  equipment: z.array(z.string()),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
})

const CreateResource = ResourceSchema.omit({ id: true, createdAt: true })
const UpdateResource = ResourceSchema.omit({ id: true, createdAt: true })

export async function createResource(formData: FormData) {
  const {
    name,
    type,
    location,
    capacity,
    equipment,
    imageUrl,
    tags
  } = CreateResource.parse({
    name: formData.get('name'),
    type: formData.get('type'),
    location: formData.get('location'),
    capacity: parseInt(formData.get('capacity') as string, 10),
    equipment: (formData.get('equipment') as string).split(','),
    imageUrl: formData.get('imageUrl') as string,
    tags: (formData.get('tags') as string).split(','),
  })

  await sql`
    INSERT INTO resources (name, type, location, capacity, equipment, "imageUrl", tags)
    VALUES (${name}, ${type}, ${location}, ${capacity}, ${equipment}, ${imageUrl}, ${tags})
  `

  revalidatePath('/dashboard/resources')
  redirect('/dashboard/resources')
}

export async function updateResource(id: string, formData: FormData) {
  const {
    name,
    type,
    location,
    capacity,
    equipment,
    imageUrl,
    tags
  } = UpdateResource.parse({
    name: formData.get('name'),
    type: formData.get('type'),
    location: formData.get('location'),
    capacity: parseInt(formData.get('capacity') as string, 10),
    equipment: (formData.get('equipment') as string).split(','),
    imageUrl: formData.get('imageUrl') as string,
    tags: (formData.get('tags') as string).split(','),
  })

  await sql`
    UPDATE resources
    SET name = ${name}, type = ${type}, location = ${location}, capacity = ${capacity}, equipment = ${equipment}, "imageUrl" = ${imageUrl}, tags = ${tags}
    WHERE id = ${id}
  `

  revalidatePath('/dashboard/resources')
  redirect('/dashboard/resources')
}

export async function deleteResource(id: string) {
  await sql`DELETE FROM resources WHERE id = ${id}`
  revalidatePath('/dashboard/resources')
}

// --- Users ---

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
})

const CreateUser = UserSchema.omit({ id: true, createdAt: true })
const UpdateUser = UserSchema.omit({ id: true, createdAt: true })

export async function createUser(formData: FormData) {
  const { name, email, role } = CreateUser.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  await sql`
    INSERT INTO users (name, email, role)
    VALUES (${name}, ${email}, ${role})
  `

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function updateUser(id: string, formData: FormData) {
  const { name, email, role } = UpdateUser.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  await sql`
    UPDATE users
    SET name = ${name}, email = ${email}, role = ${role}
    WHERE id = ${id}
  `

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users')
}

export async function deleteUser(id: string) {
  await sql`DELETE FROM users WHERE id = ${id}`
  revalidatePath('/dashboard/users')
}

// --- Reservations ---

const ReservationSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  userId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  createdAt: z.string(),
})

const CreateReservation = ReservationSchema.omit({ id: true, createdAt: true })
const UpdateReservation = ReservationSchema.omit({ id: true, createdAt: true })

export async function createReservation(formData: FormData) {
  const { resourceId, userId, startTime, endTime, status } = CreateReservation.parse({
    resourceId: formData.get('resourceId'),
    userId: formData.get('userId'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    status: formData.get('status'),
  })

  await sql`
    INSERT INTO reservations ("resourceId", "userId", "startTime", "endTime", status)
    VALUES (${resourceId}, ${userId}, ${startTime}, ${endTime}, ${status})
  `

  revalidatePath('/dashboard/reservations')
  redirect('/dashboard/reservations')
}

export async function updateReservation(id: string, formData: FormData) {
  const { resourceId, userId, startTime, endTime, status } = UpdateReservation.parse({
    resourceId: formData.get('resourceId'),
    userId: formData.get('userId'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    status: formData.get('status'),
  })

  await sql`
    UPDATE reservations
    SET "resourceId" = ${resourceId}, "userId" = ${userId}, "startTime" = ${startTime}, "endTime" = ${endTime}, status = ${status}
    WHERE id = ${id}
  `

  revalidatePath('/dashboard/reservations')
  redirect('/dashboard/reservations')
}

export async function deleteReservation(id: string) {
  await sql`DELETE FROM reservations WHERE id = ${id}`
  revalidatePath('/dashboard/reservations')
}
