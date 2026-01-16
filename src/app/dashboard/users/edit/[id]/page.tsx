
import { fetchUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { EditUserForm } from '@/components/users/edit-user-form';
import { User } from '@/lib/definitions';


export default async function EditUserPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const user = await fetchUserById(id);

  if (!user) {
    notFound();
  }

  return <EditUserForm user={user} />;
}
