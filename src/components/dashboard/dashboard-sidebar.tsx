
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, Box, Users, User, MapPin, Heart, ArrowLeftRight, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/app/actions';

const iconMap = {
  Home,
  Package,
  Box,
  Users,
  User,
  MapPin,
  Heart,
  ArrowLeftRight
};

type LinkType = {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
};

type DashboardSidebarProps = {
  links: LinkType[];
  isAdmin: boolean;
};

export default function DashboardSidebar({ links, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await logoutAction();
    router.push('/');
  }

  return (
    <aside className="w-full md:w-64 bg-background rounded-lg shadow-md p-4 flex flex-col">
      {!isAdmin && (
        <>
          <h2 className="text-2xl font-bold p-2 mb-4">Olá!</h2>
        </>
      )}
      <nav className="flex flex-col gap-2 flex-grow">
        {links.map((link) => {
          const Icon = iconMap[link.icon as keyof typeof iconMap] || Home;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5',
                isActive && 'bg-primary/10 text-primary font-semibold'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-base">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <Separator className="my-4" />
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/5 w-full text-left"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-base">Sair</span>
      </button>
    </aside>
  );
}
