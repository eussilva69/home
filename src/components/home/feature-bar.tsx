
import { Brush, CreditCard, Shield, Truck } from "lucide-react"

const features = [
  {
    icon: <Brush className="h-8 w-8 text-primary" />,
    title: "Artes Exclusivas",
    description: "com personalidade",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: "Parcelas",
    description: "até 12x sem juros",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Compra Segura",
    description: "dados protegidos",
  },
    {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Entregas",
    description: "para todo o brasil",
  },
];

export default function FeatureBar() {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center">
              {feature.icon}
              <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
