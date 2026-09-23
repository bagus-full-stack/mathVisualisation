"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import MultiDimensionalVisualizer from "@/components/multi-dimensional-visualizer"

export default function DimensionsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Visualisation multi-dimensionnelle</h1>
      <p className="text-center text-muted-foreground mb-8">Explorez des fonctions à N dimensions avec des techniques de visualisation avancées</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Introduction aux dimensions supérieures</CardTitle>
          <CardDescription>Comment visualiser ce que nous ne pouvons pas voir directement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              La visualisation de fonctions à plus de 3 dimensions pose un défi particulier, car notre perception est
              limitée à 3 dimensions spatiales. Cependant, plusieurs techniques nous permettent de représenter ces
              dimensions supplémentaires :
            </p>

            <ul>
              <li>
                <strong>Tranches (Slices)</strong> : Nous fixons certaines dimensions et visualisons une &quot;tranche&quot; de
                l&apos;espace multidimensionnel.
              </li>
              <li>
                <strong>Couleur comme dimension</strong> : Nous utilisons la couleur pour représenter une dimension
                supplémentaire.
              </li>
              <li>
                <strong>Animation</strong> : Nous animons une dimension en faisant varier sa valeur dans le temps.
              </li>
              <li>
                <strong>Projections</strong> : Nous projetons l&apos;espace multidimensionnel sur un espace de dimension
                inférieure.
              </li>
            </ul>

            <p>
              L&apos;outil ci-dessous vous permet d&apos;explorer des fonctions à N dimensions en utilisant ces différentes
              techniques. Vous pouvez ajouter autant de dimensions que vous le souhaitez et choisir comment les
              visualiser.
            </p>
          </div>
        </CardContent>
      </Card>

      <MultiDimensionalVisualizer />
    </div>
  )
}

