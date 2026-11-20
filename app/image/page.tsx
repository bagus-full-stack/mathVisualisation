import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageProcessor from "@/components/image-processor"

export default function ImagePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Traitement d&apos;image</h1>
      <Card>
        <CardHeader>
          <CardTitle>Importer une image et choisir un algorithme</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageProcessor />
        </CardContent>
      </Card>
    </div>
  )
}
