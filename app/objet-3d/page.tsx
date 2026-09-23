import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Object3DViewer from "@/components/object-3d-viewer"

export default function Objet3DPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Visualisation d&apos;objet 3D</h1>
      <Card>
        <CardHeader>
          <CardTitle>Importer un objet 3D</CardTitle>
        </CardHeader>
        <CardContent>
          <Object3DViewer />
        </CardContent>
      </Card>
    </div>
  )
}
