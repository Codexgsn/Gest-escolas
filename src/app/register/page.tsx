'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <BookOpenCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>
            O registro de novas contas está temporariamente desativado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/" className="underline">
                Faça o login
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
