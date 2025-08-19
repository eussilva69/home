
import { Brush, CreditCard, Truck } from "lucide-react"

const features = [
  {
    icon: <Brush className="h-8 w-8 text-primary" />,
    title: "Artes Exclusivas",
    description: "com personalidade",
  },
  {
    icon: <svg   xmlns="http://www.w3.org/2000/svg"   width="32"   height="32"   viewBox="0 0 24 24"   fill="none"   stroke="currentColor"   strokeWidth="1"   strokeLinecap="round"   strokeLinejoin="round" className="h-8 w-8 text-primary" >   <path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />   <path d="M3 10l18 0" />   <path d="M7 15l.01 0" />   <path d="M11 15l2 0" /> </svg>,
    title: "Parcelas",
    description: "até 12x sem juros",
  },
  {
    icon: <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8 text-primary"><title>AdGuard</title><path d="M12 0C8.249 0 3.725.861 0 2.755 0 6.845-.051 17.037 12 24 24.051 17.037 24 6.845 24 2.755 20.275.861 15.751 0 12 0zm-.106 15.429L6.857 9.612c.331-.239 1.75-1.143 2.794.042l2.187 2.588c.009-.001 5.801-5.948 5.815-5.938.246-.22.694-.503 1.204-.101l-6.963 9.226z"/></svg>,
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
