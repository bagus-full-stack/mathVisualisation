import FunctionVisualizer from "@/components/function-visualizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Award, CuboidIcon } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Visualisation de Fonctions Mathématiques</h1>

        <Tabs defaultValue="2d" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="2d">Visualisation 2D</TabsTrigger>
            <TabsTrigger value="3d">Visualisation 3D</TabsTrigger>
          </TabsList>

          <TabsContent value="2d">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Visualisation 2D</h2>
              <p className="text-muted-foreground">Visualisez des fonctions à une variable f(x) avec analyse des points critiques.</p>
            </div>
            <FunctionVisualizer mode="2d" />
          </TabsContent>

          <TabsContent value="3d">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Visualisation 3D</h2>
              <p className="text-muted-foreground">Visualisez des fonctions à deux variables f(x,y) avec un contrôle précis des plages X, Y et Z.</p>
            </div>
            <FunctionVisualizer mode="3d" />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités avancées</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/fonctions-avancees">
              <Button className="w-full sm:w-auto">
                <Award className="h-4 w-4 mr-2" />
                Fonctions avancées
              </Button>
            </Link>
            <Link href="/dimensions">
              <Button className="w-full sm:w-auto" variant="outline">
                <CuboidIcon className="h-4 w-4 mr-2" />
                Visualisation N-Dimensions
              </Button>
            </Link>
          </div>
        </div>
      </main>
  )
}

