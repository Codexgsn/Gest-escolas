
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NewResourceForm } from "@/components/resources/new-resource-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { getSettings } from '@/app/actions/settings';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewResourcePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        return;
    }

    async function loadTags() {
      try {
        const settings = await getSettings();
        setAvailableTags(settings.resourceTags || []);
      } catch (error) {
        console.error("Error loading tags:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTags();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Adicionar Novo Recurso</CardTitle>
            <CardDescription>
                Preencha o formulário para adicionar um novo recurso (sala, objeto, etc.) para reserva.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <NewResourceForm availableTags={availableTags} />
        </CardContent>
    </Card>
  );
}
