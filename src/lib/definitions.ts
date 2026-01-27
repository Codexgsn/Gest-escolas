
export type User = {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: "Admin" | "Usuário";
  avatar?: string;
  avatarUrl?: string;
  password?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  equipment: string[];
  availability: string;
  imageUrl: string;
  tags: string[];
  description?: string;
};

export type Reservation = {
  id:string;
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: "Confirmada" | "Pendente" | "Cancelada";
  createdAt: string;
  updatedAt?: string;
  resourceName?: string;
  userName?: string;
};
