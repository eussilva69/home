
import { testimonials } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">O Que Nossos Clientes Dizem</h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Avaliações reais de amantes da arte felizes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => {
            // Updated logic to handle multi-word states
            const states = ["MINAS GERAIS", "RIO GRANDE DO SUL", "SERGIPE", "RIO GRANDE DO NORTE"];
            let name = testimonial.name;
            let state = '';

            for (const s of states) {
                if (name.endsWith(s)) {
                    state = s;
                    name = name.replace(s, '').trim();
                    break;
                }
            }
            
            return (
                <Card key={index} className="flex flex-col text-left shadow-sm rounded-lg p-6">
                   <CardContent className="p-0 flex-grow">
                     <div className="mb-2">
                       <h4 className="font-semibold text-base">{name}</h4>
                       {state && <p className="text-xs text-muted-foreground">{state}</p>}
                     </div>
                     <div className="flex items-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm">"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
