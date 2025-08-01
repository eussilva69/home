
import {
  Square,
  RectangleHorizontal,
  GalleryVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const arrangementTypes = [
  {
    icon: <Square className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Solo (Único)",
    description:
      "Um quadro único e central, geralmente de tamanho médio ou grande, que serve como o ponto focal do ambiente.",
  },
  {
    icon: <RectangleHorizontal className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Dupla",
    description:
      "Dois quadros lado a lado ou em espelho. Uma composição simétrica e elegante, perfeita para sofás ou camas.",
  },
  {
    icon: <GalleryVertical className="h-8 w-8 md:h-10 md:w-10 text-primary" />,
    title: "Trio",
    description:
      "Três quadros alinhados horizontalmente, criando uma narrativa visual coesa e impactante.",
  },
];

export default function FrameArrangements() {
  return (
    <section id="arrangements" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">
            Como Organizar Seus Quadros
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Inspire-se com diferentes formas de exibir sua arte.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {arrangementTypes.map((arrangement) => (
            <Card key={arrangement.title} className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {arrangement.icon}
                </div>
                <CardTitle className="font-headline text-lg md:text-xl">
                  {arrangement.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm md:text-base text-muted-foreground">
                  {arrangement.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
