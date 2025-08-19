
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Phone, Mail, MapPin } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}><title>Visa</title><path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/></svg>
);

const PixIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}><title>Pix</title><path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156"/></svg>
);

const MasterCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}><title>MasterCard</title><path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/></svg>
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
                  <li><Link href="/como-comprar" className="hover:text-primary">COMO COMPRAR</Link></li>
                  <li><Link href="#" className="hover:text-primary">COMO PENDURAR</Link></li>
                  <li><Link href="/guia-do-produto" className="hover:text-primary">GUIA DO PRODUTO</Link></li>
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
          
          <div className="border-t border-gray-300 mt-10 pt-6 flex flex-col md:flex-row justify-center items-center text-xs text-gray-500 gap-6">
            <p className="text-center md:text-left">Home Designer © 2022 DIREITOS RESERVADOS</p>
            <div className="flex items-center gap-4 text-black">
                <VisaIcon className="h-6 w-auto" />
                <PixIcon className="h-5 w-auto" />
                <MasterCardIcon className="h-6 w-auto" />
                <Image src="https://boemi.com.br/wp-content/uploads/2022/06/selos_seguranca.png" alt="Selos de Segurança" width={150} height={30} className="grayscale brightness-0" />
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
