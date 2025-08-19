
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Phone, Mail, MapPin } from 'lucide-react';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Social */}
            <div className="md:col-span-1 lg:col-span-1">
              <h2 className="text-3xl font-light text-gray-800 mb-2">Home Designer</h2>
              <p className="text-sm text-muted-foreground mb-4">Arte moderna e vibrante para o seu espaço. Feito à mão com paixão.</p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-primary"><Instagram /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
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
            <p className="mb-4 md:mb-0">Home Designer © 2022 DIREITOS RESERVADOS</p>
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                {/* Payment icons would go here */}
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
