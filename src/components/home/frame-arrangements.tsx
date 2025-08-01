import {
  Square,
  RectangleHorizontal,
  View,
  GalleryVertical,
  Grid3x3,
  GalleryThumbnails,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const arrangementTypes = [
  {
    icon: <Square className="h-10 w-10 text-primary" />,
    title: "Solo (Único)",
    description:
      "Um quadro único e central, geralmente de tamanho médio ou grande, que serve como o ponto focal do ambiente.",
  },
  {
    icon: <RectangleHorizontal className="h-10 w-10 text-primary" />,
    title: "Dupla",
    description:
      "Dois quadros lado a lado ou em espelho. Uma composição simétrica e elegante, perfeita para sofás ou camas.",
  },
  {
    icon: <View className="h-10 w-10 text-primary" />,
    title: "Trio (3 em linha)",
    description:
      "Três quadros alinhados na horizontal ou vertical, criando uma narrativa visual coesa e impactante.",
  },
  {
    icon: <Grid3x3 className="h-10 w-10 text-primary" />,
    title: "Grid (Grade)",
    description:
      "Vários quadros organizados em linhas e colunas (como 2x2 ou 3x3), ideal para uma parede bem estruturada e moderna.",
  },
  {
    icon: <GalleryThumbnails className="h-10 w-10 text-primary" />,
    title: "Composição Livre / Galeria",
    description:
      'Uma mistura de tamanhos, formas e estilos em uma "gallery wall", refletindo personalidade e criatividade.',
  },
  {
    icon: <GalleryVertical className="h-10 w-10 text-primary" />,
    title: "Tríptico",
    description:
      "Uma única imagem dividida em três quadros contínuos, que juntos formam uma peça única e expansiva.",
  },
];

export default function FrameArrangements() {
  return (
    <section id="arrangements" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline text-primary">
            Como Organizar Seus Quadros
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Inspire-se com diferentes formas de exibir sua arte.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arrangementTypes.map((arrangement) => (
            <Card key={arrangement.title} className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {arrangement.icon}
                </div>
                <CardTitle className="font-headline text-xl">
                  {arrangement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
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
