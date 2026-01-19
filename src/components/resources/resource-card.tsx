'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/definitions";
import Link from "next/link";

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end space-x-2">
          <Button asChild variant="secondary">
            <Link href={resource.url} target="_blank" rel="noopener noreferrer">
              View
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/resources/${resource.id}/edit`}>
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
