'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpenCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Import Firebase auth and database functions
import { auth, database } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro de Cadastro",
        description: "As senhas não coincidem.",
      });
      return;
    }
    
    if (password.length < 6) { // Firebase default minimum is 6
        toast({
            variant: "destructive",
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 6 caracteres.",
        });
        return;
    }

    try {
      // 1. Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save additional user information to the Realtime Database under the user's UID
      await set(ref(database, 'users/' + user.uid), {
        name: name,
        email: email,
        role: 'Usuário', // Default role for new sign-ups
        createdAt: new Date().toISOString()
        // DO NOT SAVE THE PASSWORD IN THE DATABASE
      });

      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Você já pode fazer login com suas novas credenciais.",
      });
      router.push('/'); // Redirect to login page

    } catch (error: any) {
      console.error("Registration Error:", error.code, error.message);
      
      let title = "Falha no Cadastro";
      let description = "Ocorreu um erro inesperado. Tente novamente.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "Este endereço de e-mail já está sendo usado por outra conta.";
          break;
        case 'auth/invalid-email':
          description = "O endereço de e-mail fornecido não é válido.";
          break;
        case 'auth/weak-password':
          description = "A senha é muito fraca. Use pelo menos 6 caracteres.";
          break;
        case 'auth/network-request-failed':
          description = "Erro de rede. Verifique sua conexão e tente novamente.";
          break;
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <BookOpenCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Criar uma Conta</CardTitle>
          <CardDescription>
            Junte-se à plataforma SchoolZenith para gerenciar seus recursos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="João da Silva"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="SeuEmail@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha forte (mínimo 6 caracteres)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Cadastrar
            </Button>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link href="/" className="underline">
                Faça o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
