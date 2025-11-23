'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredEmail?: string; // Email específico opcional (para páginas admin)
}

export function PrivateRoute({ children, requiredEmail }: PrivateRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Verifica se é necessário um email específico
        if (requiredEmail) {
          if (currentUser.email === requiredEmail) {
            setUser(currentUser);
            setAuthorized(true);
            setLoading(false);
          } else {
            setLoading(false);
            // Usuário logado mas não tem permissão
            router.push('/dashboard');
          }
        } else {
          // Apenas precisa estar logado
          setUser(currentUser);
          setAuthorized(true);
          setLoading(false);
        }
      } else {
        setLoading(false);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, requiredEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
