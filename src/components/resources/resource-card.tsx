'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Resource } from "@/lib/definitions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-grow">
        <CardTitle>{resource.name}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 mt-auto">
        <Button asChild>
          <Link href={`/dashboard/resources/${resource.id}`}>
            Reservar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
