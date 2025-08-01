"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Percent, Mail } from 'lucide-react';

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      // Check if mouse is leaving the top of the viewport
      if (event.clientY <= 0 && !sessionStorage.getItem('exitIntentShown')) {
        setIsOpen(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Percent className="h-8 w-8 text-primary"/>
            </div>
          <DialogTitle className="font-headline text-2xl">Wait! Don't Go!</DialogTitle>
          <DialogDescription>
            Get an exclusive 15% discount on your first order. Enter your email to claim your coupon.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <form className="flex flex-col gap-4">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="email" placeholder="Enter your email" className="pl-10" />
            </div>
            <Button type="submit" className="w-full">Claim My 15% Off</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
