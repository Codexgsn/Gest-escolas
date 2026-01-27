'use client';

import { FilterDropdown } from "@/components/resources/filter-dropdown";
import { Resource } from "@/lib/definitions";
import { useState, useEffect, useMemo, Suspense } from "react";
import { ResourcesTableSkeleton } from "@/components/resources/skeletons";
import ResourceCard from "@/components/resources/resource-card";
import { useSearchParams } from 'next/navigation';
import { database } from "@/firebase";
import { ref, onValue } from "firebase/database";

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

function ResourcesPageContent() {
    const searchParams = useSearchParams();
    const [allResources, setAllResources] = useState<Resource[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const resourcesRef = ref(database, 'resources');

        console.log("Setting up resources listener...");

        const unsubscribe = onValue(resourcesRef, (snapshot) => {
            try {
                const data = snapshot.val();
                const list = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
                console.log("Resources received:", list.length);
                setAllResources(list);
                setLoading(false);
            } catch (err) {
                console.error("Error processing resources data:", err);
                setError("Falha ao processar os recursos.");
                setLoading(false);
            }
        }, (err) => {
            console.error("Firebase subscription error:", err);
            setError("Falha ao carregar os recursos. Verifique sua permissão.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const availableTags = useMemo(() => {
        if (!allResources) return [];
        const tags = new Set<string>();
        allResources.forEach(r => {
            if (r.tags && Array.isArray(r.tags)) {
                r.tags.forEach(t => tags.add(t));
            }
        });
        return Array.from(tags).sort();
    }, [allResources]);

    const filteredResources = useMemo(() => {
        if (!allResources) return [];
        const selectedTags = searchParams.get('tags')?.split(',') || [];
        if (selectedTags.length === 0 || (selectedTags.length === 1 && selectedTags[0] === "")) {
            return allResources;
        }
        return allResources.filter(resource =>
            selectedTags.every(filterTag => resource.tags?.includes(filterTag))
        );
    }, [allResources, searchParams]);

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

export default function ResourcesPage() {
    return (
        <Suspense fallback={<ResourcesTableSkeleton />}>
            <ResourcesPageContent />
        </Suspense>
    )
}
