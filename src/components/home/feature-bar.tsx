
import { Truck, CreditCard, BadgePercent, ShieldCheck } from 'lucide-react';

const features = [
    {
        icon: <Truck className="h-8 w-8 text-primary" />,
        title: 'Entregamos em todo BR',
        description: 'Consulte os prazos'
    },
    {
        icon: <CreditCard className="h-8 w-8 text-primary" />,
        title: 'Parcele Sem Juros',
        description: 'Em até 12x no cartão'
    },
    {
        icon: <BadgePercent className="h-8 w-8 text-primary" />,
        title: '10% de Desconto',
        description: 'Pix ou boleto bancário'
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: 'Compra Segura',
        description: 'Seus dados protegidos'
    }
];

export default function FeatureBar() {
    return (
        <section className="border-y bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 py-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm md:text-base text-primary">{feature.title}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
