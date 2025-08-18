
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Phone, Mail, MapPin } from 'lucide-react';

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-gray-600 hover:text-primary"
    {...props}
  >
    <path d="M12.017 1.5c-5.96 0-9.45 4.01-9.45 8.71 0 3.19 1.71 6.32 4.63 7.5a.6.6 0 0 0 .8-.53l.36-1.54s.22-.92.2-1.07c-.07-.5-.45-1.3-.45-2.82 0-2.52 1.83-4.44 4.13-4.44 2.22 0 3.32 1.58 3.32 3.46 0 2.1-1.2 5.23-2.78 5.23-.9 0-1.84-.96-1.59-2.1.3-.98.9-2.03.9-2.73 0-.74-.4-1.34-.96-1.34-.78 0-1.42.78-1.42 1.8 0 .62.18 1.13.18 1.13s-1.2 5.08-1.44 6c-.3.92.03 1.95.89 1.95 1.07 0 1.9-1.37 1.9-2.52 0-1.2-.6-2.27-.6-2.27s.6-2.32.73-2.88c.24-1.07.9-1.93 2.02-1.93 2.2 0 3.93 2.05 3.93 4.9 0 2.7-1.5 5.02-4.18 5.02-3.3 0-5.4-2.57-5.4-5.63 0-2.3 1.2-4.14 2.73-4.14.83 0 1.5.48 1.5.48s-1.15 4.8-1.15 4.8c0 .28.02.5.15.65.13.15.35.2.5.1.4-.3.6-.6.8-.95.1-.18.25-1.07.25-1.07l.38-1.56s.3-1.25.5-2.3c.42-2.12 2.6-4.08 4.9-4.08 3.55 0 5.92 2.7 5.92 6.13 0 4.2-2.3 7.37-6.23 7.37C16.2 22.5 12.8 20.2 12.8 16c0-1.2.4-2.4 1-3.33" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export default function Footer() {
  const whatsappUrl = "https://wa.me/5534997222303?text=Olá! Vim pelo site e gostaria de mais informações.";

  return (
    <>
      <footer className="bg-[#EFE7DA] text-gray-700 print:hidden">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Social */}
            <div className="md:col-span-1">
              <h2 className="text-3xl font-light text-gray-800 mb-4">BOEMI</h2>
              <div className="flex space-x-4">
                <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-primary"><Instagram /></a>
                <a href="#" aria-label="Pinterest"><PinterestIcon /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 tracking-wider">SOBRE</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/loja" className="hover:text-primary">LOJA</Link></li>
                  <li><Link href="/blog" className="hover:text-primary">BLOG</Link></li>
                  <li><Link href="/quem-somos" className="hover:text-primary">QUEM SOMOS</Link></li>
                  <li><Link href="/vale-presente" className="hover:text-primary">VALE PRESENTE</Link></li>
                  <li><Link href="/contato" className="hover:text-primary">CONTATO</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 tracking-wider">AJUDA</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/dashboard/my-orders" className="hover:text-primary">DETALHES DO PEDIDO</Link></li>
                  <li><Link href="#" className="hover:text-primary">COMO COMPRAR</Link></li>
                  <li><Link href="#" className="hover:text-primary">COMO PENDURAR</Link></li>
                  <li><Link href="#" className="hover:text-primary">GUIA DO PRODUTO</Link></li>
                  <li><Link href="/exchanges" className="hover:text-primary">DEVOLUÇÕES</Link></li>
                  <li><Link href="#" className="hover:text-primary">DÚVIDAS FREQUENTES</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 tracking-wider">ATENDIMENTO</h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>(34) 99722-2303</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">homedecorinterioresplanejados@gmail.com</span>
                    </li>
                     <li className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                        <span>Rua Virgílio Carrijo, 1045 - Bairro Minas Gerais, Uberlândia - MG</span>
                    </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p className="mb-4 md:mb-0">BOEMI STORE - 42.048.222/0001-24 © 2022 DIREITOS RESERVADOS</p>
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                {/* Payment icons would go here */}
            </div>
            <div className="flex items-center gap-4">
                 <a href="/dashboard" className="hover:text-primary">Minha Conta</a>
                 <a href="/checkout" className="hover:text-primary">Finalizar compra</a>
            </div>
          </div>

        </div>
      </footer>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-5 right-5 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <WhatsAppIcon className="h-6 w-6"/>
      </a>
    </>
  );
}
