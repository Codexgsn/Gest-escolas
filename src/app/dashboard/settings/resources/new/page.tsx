
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { createResourceAction } from "@/app/actions/resources"
import { getSettings } from "@/app/actions/settings"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  type: z.string().min(3, { message: "O tipo deve ter pelo menos 3 caracteres." }),
  location: z.string().min(3, { message: "A localização deve ter pelo menos 3 caracteres." }),
  capacity: z.coerce.number().min(1, { message: "A capacidade deve ser de pelo menos 1." }),
  equipment: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, insira uma URL de imagem válida." }),
  tags: z.array(z.string()).default([]),
});

export default function NewResourcePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
      })
      router.push('/dashboard')
      return;
    }

    async function loadSettings() {
        try {
            const settings = await getSettings();
            setAvailableTags(settings.resourceTags || []);
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    }
    loadSettings();
  }, [user, authLoading, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      location: "",
      capacity: 1,
      equipment: "",
      imageUrl: "",
      tags: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    const result = await createResourceAction(values, user.id);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Recurso criado com sucesso!",
      })
      router.push("/dashboard/settings/resources")
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message,
      })
    }
  }

  if (authLoading || loading) {
     return <div className="p-8 text-center"><Skeleton className="h-10 w-full mb-4" /><Skeleton className="h-10 w-full" /></div>;
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Novo Recurso</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para criar um novo recurso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Recurso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sala de Aula 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Recurso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sala de Aula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bloco A, 1º Andar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade / Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itens Incluídos (separados por vírgula)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Projetor, Ar Condicionado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                     <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableTags.length > 0 && (
                 <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Tags</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableTags.map((tag) => (
                            <FormField
                            key={tag}
                            control={form.control}
                            name="tags"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={tag}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(tag)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), tag])
                                            : field.onChange(
                                                (field.value || [])?.filter(
                                                (value) => value !== tag
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {tag}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            <Button type="submit">Criar Recurso</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
