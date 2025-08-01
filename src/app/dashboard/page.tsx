
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import CustomerDashboard from '@/components/dashboard/customer-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Simple role check based on email
  const isAdmin = user.email === 'adm@gmail.com';
  
  const dashboardLinks = isAdmin 
  ? [
      { href: '/dashboard', label: 'Início', icon: 'Home' },
      { href: '#', label: 'Pedidos', icon: 'Package' },
      { href: '#', label: 'Produtos', icon: 'Box' },
      { href: '/admin/tools', label: 'Ferramentas IA', icon: 'Wand2' },
      { href: '#', label: 'Clientes', icon: 'Users' },
    ]
  : [
      { href: '/dashboard', label: 'Início', icon: 'Home' },
      { href: '#', label: 'Meus Pedidos', icon: 'Package' },
      { href: '#', label: 'Meus Dados', icon: 'User' },
      { href: '#', label: 'Endereços', icon: 'MapPin' },
    ];


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex">
        <DashboardSidebar links={dashboardLinks} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {isAdmin ? <AdminDashboard user={user} /> : <CustomerDashboard user={user} />}
        </main>
      </div>
      <Footer />
    </div>
  );
}
