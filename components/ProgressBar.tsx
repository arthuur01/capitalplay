'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configurar nprogress
    NProgress.configure({
      showSpinner: false,
      speed: 900,
      minimum: 0.1,
    });

    // Iniciar progresso quando a rota mudar
    NProgress.start();

    // Simular progresso baseado no tempo de carregamento
    const timer = setTimeout(() => {
      NProgress.set(0.3);
    }, 100);

    const timer2 = setTimeout(() => {
      NProgress.set(0.6);
    }, 200);

    const timer3 = setTimeout(() => {
      NProgress.set(0.9);
    }, 300);

    // Finalizar progresso
    const finalTimer = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(finalTimer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}