
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brush, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.017 1.5c-5.96 0-9.45 4.01-9.45 8.71 0 3.19 1.71 6.32 4.63 7.5a.6.6 0 0 0 .8-.53l.36-1.54s.22-.92.2-1.07c-.07-.5-.45-1.3-.45-2.82 0-2.52 1.83-4.44 4.13-4.44 2.22 0 3.32 1.58 3.32 3.46 0 2.1-1.2 5.23-2.78 5.23-.9 0-1.84-.96-1.59-2.1.3-.98.9-2.03.9-2.73 0-.74-.4-1.34-.96-1.34-.78 0-1.42.78-1.42 1.8 0 .62.18 1.13.18 1.13s-1.2 5.08-1.44 6c-.3.92.03 1.95.89 1.95 1.07 0 1.9-1.37 1.9-2.52 0-1.2-.6-2.27-.6-2.27s.6-2.32.73-2.88c.24-1.07.9-1.93 2.02-1.93 2.2 0 3.93 2.05 3.93 4.9 0 2.7-1.5 5.02-4.18 5.02-3.3 0-5.4-2.57-5.4-5.63 0-2.3 1.2-4.14 2.73-4.14.83 0 1.5.48 1.5.48s-1.15 4.8-1.15 4.8c0 .28.02.5.15.65.13.15.35.2.5.1.4-.3.6-.6.8-.95.1-.18.25-1.07.25-1.07l.38-1.56s.3-1.25.5-2.3c.42-2.12 2.6-4.08 4.9-4.08 3.55 0 5.92 2.7 5.92 6.13 0 4.2-2.3 7.37-6.23 7.37C16.2 22.5 12.8 20.2 12.8 16c0-1.2.4-2.4 1-3.33" />
    </svg>
  );

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground print:hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Brush className="h-8 w-8 text-primary" />
              <h1 className="text-xl md:text-2xl font-headline font-bold text-primary">Home Designer</h1>
            </Link>
            <p className="text-sm">Arte moderna e vibrante para o seu espaço. Feito à mão com paixão.</p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="font-headline text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">Sobre Nós</Link></li>
                <li><Link href="#" className="hover:text-primary">Contato</Link></li>
                <li><Link href="#" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary">Envio e Devoluções</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span>(34) 99722-2303</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span className="break-all">homedecorinterioresplanejados@gmail.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span>Rua Virgílio Carrijo, 1045 - Bairro Minas Gerais, Uberlândia - MG</span>
                  </li>
              </ul>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-sm mb-4">Ganhe 10% de desconto no seu primeiro pedido. Inscreva-se agora!</p>
              <form className="flex flex-col sm:flex-row gap-2">
                <Input type="email" placeholder="Seu email" className="bg-background/70" />
                <Button type="submit" className="bg-primary hover:bg-primary/90 flex-shrink-0">Inscrever</Button>
              </form>
              <div className="flex space-x-4 mt-6">
                <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6 hover:text-primary" /></Link>
                <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6 hover:text-primary" /></Link>
                <Link href="#" aria-label="Pinterest"><PinterestIcon className="h-6 w-6 hover:text-primary" /></Link>
                <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 hover:text-primary" /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p className="mb-2">&copy; {new Date().getFullYear()} Home Designer. Todos os direitos reservados.</p>
          <div className="flex justify-center items-center gap-2">
            <span>Desenvolvido por</span>
            <a href="https://glcoding.online" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
              <Image src="https://iili.io/FMvMmva.png" alt="GL Coding Logo" width={24} height={24} />
              <span>GL Coding</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
