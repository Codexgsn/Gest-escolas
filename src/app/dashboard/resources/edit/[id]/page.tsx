
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { fetchResourceById, fetchResourceTags } from "@/lib/data";
import { EditResourceForm } from "@/components/resources/edit-resource-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { Resource } from '@/lib/definitions';

export default function EditResourcePage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [resource, setResource] = useState<Resource | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!user) {
          setLoading(false);
          return;
      }

      try {
        const [resourceData, tagsData] = await Promise.all([
          fetchResourceById(id),
          fetchResourceTags(),
        ]);

        if (!resourceData) {
          setError(true);
        } else {
          setResource(resourceData);
          setAvailableTags(tagsData);
        }
      } catch (err) {
        console.error("Error loading resource data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, user, authLoading]);

  if (authLoading || loading) {
    return <div className="p-8 text-center">Carregando dados do recurso...</div>;
  }

  if (error || !resource) {
    return notFound();
  }

  return (
     <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Editar Recurso</CardTitle>
            <CardDescription>
                Atualize os detalhes do recurso abaixo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <EditResourceForm resource={resource} availableTags={availableTags} />
        </CardContent>
    </Card>
  );
}
