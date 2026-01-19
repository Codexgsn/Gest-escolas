'use client';

import { fetchResources, fetchResourceTags } from "@/lib/data";
import { FilterDropdown } from "@/components/resources/filter-dropdown";
import { Resource } from "@/lib/definitions";
import { useState, useEffect, useMemo, Suspense } from "react";
import { ResourcesTableSkeleton } from "@/components/resources/skeletons";
import ResourceCard from "@/components/resources/resource-card";
import { useSearchParams } from 'next/navigation';

// Componente "burro" para exibir a lista de recursos. 
// Ele não busca dados, apenas os recebe via props.
function ResourcesList({ resources }: { resources: Resource[] }) {
    if (resources.length === 0) {
        return (
            <div className="col-span-full text-center text-muted-foreground py-10">
                Nenhum recurso encontrado com os filtros selecionados.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
            ))}
        </div>
    );
}

// Componente principal da página, agora responsável por toda a lógica de dados.
function ResourcesPageContent() {
    const searchParams = useSearchParams();
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Efeito para buscar todos os dados iniciais (recursos e tags) uma única vez.
    useEffect(() => {
        async function loadInitialData() {
            try {
                setLoading(true);
                const [resourcesData, tagsData] = await Promise.all([
                    fetchResources(),
                    fetchResourceTags(),
                ]);
                setAllResources(resourcesData);
                setAvailableTags(tagsData);
            } catch (err) {
                console.error("Failed to load resource data:", err);
                setError("Falha ao carregar os recursos. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, []); // Roda apenas uma vez na montagem do componente

    // Memoiza os recursos filtrados. A filtragem é refeita apenas se os recursos 
    // ou os parâmetros de busca (tags) mudarem.
    const filteredResources = useMemo(() => {
        const selectedTags = searchParams.get('tags')?.split(',') || [];
        if (selectedTags.length === 0) {
            return allResources;
        }
        return allResources.filter(resource =>
            selectedTags.every(filterTag => resource.tags?.includes(filterTag))
        );
    }, [allResources, searchParams]);

    // Renderização condicional baseada nos estados de loading e erro.
    if (error) {
        return <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Recursos Disponíveis</h1>
                    <p className="text-muted-foreground">
                        Explore e reserve os recursos disponíveis na sua instituição.
                    </p>
                </div>
                <FilterDropdown availableTags={availableTags} />
            </div>
            
            {loading ? <ResourcesTableSkeleton /> : <ResourcesList resources={filteredResources} />}
        </div>
    );
}

// Componente de exportação padrão que envolve a página com o Suspense do Next.js
export default function ResourcesPage() {
    return (
        <Suspense fallback={<ResourcesTableSkeleton />}>
            <ResourcesPageContent />
        </Suspense>
    )
}
