
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
  
  const adminLinks = [
      { href: '/dashboard', label: 'Início', icon: 'Home' },
      { href: '#', label: 'Pedidos', icon: 'Package' },
      { href: '#', label: 'Produtos', icon: 'Box' },
      { href: '/admin/tools', label: 'Ferramentas IA', icon: 'Wand2' },
      { href: '#', label: 'Clientes', icon: 'Users' },
    ];

  const customerLinks = [
    { href: '/dashboard', label: 'Dados pessoais', icon: 'User' },
    { href: '#', label: 'Endereços', icon: 'Home' },
    { href: '#', label: 'Pedidos', icon: 'Package' },
    { href: '#', label: 'Cartões', icon: 'CreditCard' },
    { href: '#', label: 'Autenticação', icon: 'Heart' },
    { href: '#', label: 'Trocas e devoluções', icon: 'ArrowLeftRight' },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <Header />
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <DashboardSidebar links={isAdmin ? adminLinks : customerLinks} isAdmin={isAdmin} />
          <main className="flex-1">
            {isAdmin ? <AdminDashboard user={user} /> : <CustomerDashboard user={user} />}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
