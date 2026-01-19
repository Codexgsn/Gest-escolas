'use client';

import { fetchResources, fetchResourceTags } from "@/lib/data";
import { FilterDropdown } from "@/components/resources/filter-dropdown";
import { Resource } from "@/lib/definitions";
import { useState, useEffect, Suspense } from "react";
import { ResourcesTableSkeleton } from "@/components/resources/skeletons";
import ResourceCard from "@/components/resources/resource-card";
import { useSearchParams } from 'next/navigation';

// Componente interno para buscar e exibir os recursos
function ResourcesList() {
    const searchParams = useSearchParams();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getResources = async () => {
            setLoading(true);
            const tags = searchParams.get('tags');
            const selectedTags = tags?.split(',') || [];
            try {
                const fetchedResources = await fetchResources(selectedTags);
                setResources(fetchedResources);
            } catch (error) {
                console.error("Failed to fetch resources:", error);
                // Opcional: definir um estado de erro para exibir na UI
            }
            setLoading(false);
        };

        getResources();
    }, [searchParams]);

    if (loading) {
        return <ResourcesTableSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resources.length > 0 ? (
                resources.map((resource: Resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground">
                    Nenhum recurso encontrado com os filtros selecionados.
                </div>
            )}
        </div>
    );
}

// Componente principal da página
export default function ResourcesPage() {
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    useEffect(() => {
        const getTags = async () => {
            try {
                const tags = await fetchResourceTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error("Failed to fetch resource tags:", error);
                 // Opcional: definir um estado de erro para exibir na UI
            }
        }
        getTags();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Recursos Disponíveis</h1>
                <p className="text-muted-foreground">
                    Explore e reserve os recursos disponíveis na sua instituição.
                </p>
            </div>

            <div className="flex items-center justify-between">
                <FilterDropdown availableTags={availableTags} />
            </div>
            
            <Suspense fallback={<ResourcesTableSkeleton />}>
                <ResourcesList />
            </Suspense>
        </div>
    );
}
