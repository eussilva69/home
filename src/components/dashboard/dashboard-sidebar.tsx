
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, Box, Users, User, MapPin, Heart, LogOut, DollarSign, Sofa, Pencil, Download, Gauge } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const iconMap = {
  Gauge,
  Home,
  Package,
  Box,
  Users,
  User,
  MapPin,
  Heart,
  DollarSign,
  Sofa,
  Pencil,
  Download,
};

type LinkType = {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
};

type DashboardSidebarProps = {
  isAdmin: boolean;
};

export default function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  }

  const adminLinks: LinkType[] = [
    { href: '/dashboard', label: 'Painel', icon: 'Gauge' },
    { href: '/dashboard/orders', label: 'Pedidos', icon: 'Package' },
    { href: '/dashboard/products', label: 'Quadros', icon: 'Box' },
    { href: '/dashboard/furnitures', label: 'Mobílias', icon: 'Sofa' },
    { href: '/dashboard/customers', label: 'Clientes', icon: 'Users' },
    { href: '/dashboard/financial', label: 'Financeiro', icon: 'DollarSign' },
  ];

  const customerLinks: LinkType[] = [
    { href: '/dashboard', label: 'Painel', icon: 'Gauge' },
    { href: '/dashboard/my-orders', label: 'Pedidos', icon: 'Package' },
    { href: '/dashboard/addresses', label: 'Endereços', icon: 'MapPin' },
    { href: '/dashboard/personal-data', label: 'Detalhes da conta', icon: 'User' },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside className="w-full md:w-full md:col-span-1 border-r-0 md:border-r md:pr-8">
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = iconMap[link.icon] || Home;
          const isActive = pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard');
          
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary',
                isActive && 'bg-secondary text-primary font-semibold'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-base">{link.label}</span>
            </Link>
          );
        })}
         <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-base">Sair</span>
         </button>
      </nav>
    </aside>
  );
}
