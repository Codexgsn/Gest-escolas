
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { fetchUserById } from '@/lib/data';
import { EditUserForm } from '@/components/users/edit-user-form';
import { User } from '@/lib/definitions';
import { useAuth } from '@/hooks/useAuth';

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  const { user: authUser, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!authUser) {
          setLoading(false);
          return;
      }

      try {
        const data = await fetchUserById(id);
        if (!data) {
          setError(true);
        } else {
          setUserData(data);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, authUser, authLoading]);

  if (authLoading || loading) {
    return <div className="p-8 text-center">Carregando dados do usuário...</div>;
  }

  if (error || !userData) {
    return notFound();
  }

  return <EditUserForm user={userData} />;
}
