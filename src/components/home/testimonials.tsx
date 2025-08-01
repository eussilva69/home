
import Image from 'next/image';
import { testimonials } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">O Que Nossos Clientes Dizem</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Avaliações reais de amantes da arte felizes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col text-center shadow-lg rounded-lg p-4">
              <CardHeader className="flex-grow pb-4">
                <p className="text-muted-foreground italic text-sm md:text-base">"{testimonial.quote}"</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-14 w-14 md:h-16 md:w-16 mb-4">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h4 className="font-headline text-base md:text-lg font-semibold">{testimonial.name}</h4>
                <div className="flex justify-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 md:h-5 md:w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
