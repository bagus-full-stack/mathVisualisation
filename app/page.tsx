import FunctionVisualizer from "@/components/function-visualizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      </main>
  )
}

