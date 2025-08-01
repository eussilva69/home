
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Package, Box, Wand2, Users, User, MapPin } from 'lucide-react';

const iconMap = {
  Home,
  Package,
  Box,
  Wand2,
  Users,
  User,
  MapPin,
};

type LinkType = {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
};

type DashboardSidebarProps = {
  links: LinkType[];
};

export default function DashboardSidebar({ links }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-secondary/50 border-r p-4 hidden lg:block">
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = iconMap[link.icon];
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-primary/10 text-primary font-semibold'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
