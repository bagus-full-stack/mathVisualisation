"use client"

import { useState } from "react"
import PlotlyComponent from "@/components/plotly-component"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Parsed = { x: number[]; y: number[]; z: number[]; i?: number[]; j?: number[]; k?: number[] }

// Minimal Wavefront OBJ support: "v x y z" vertices and "f a b c ..." faces
// (fan-triangulated if a face has more than 3 vertices). Texture/normal
// indices after "/" are ignored.
function parseObj(text: string): Parsed {
  const x: number[] = [], y: number[] = [], z: number[] = []
  const i: number[] = [], j: number[] = [], k: number[] = []
  for (const line of text.split("\n")) {
    const parts = line.trim().split(/\s+/)
    if (parts[0] === "v") {
      x.push(Number(parts[1])); y.push(Number(parts[2])); z.push(Number(parts[3]))
    } else if (parts[0] === "f") {
      const idx = parts.slice(1).map((p) => Number(p.split("/")[0]) - 1)
      for (let n = 1; n < idx.length - 1; n++) {
        i.push(idx[0]); j.push(idx[n]); k.push(idx[n + 1])
      }
    }
  }
  return { x, y, z, i, j, k }
}

function parsePoints(text: string, isJson: boolean): Parsed {
  const rows: number[][] = isJson
    ? JSON.parse(text).map((p: number[] | { x: number; y: number; z: number }) =>
        Array.isArray(p) ? p : [p.x, p.y, p.z])
    : text
        .trim()
        .split("\n")
        .map((line) => line.split(",").map(Number))
        .filter((row) => row.length >= 3 && row.every((n) => !Number.isNaN(n)))
  return { x: rows.map((r) => r[0]), y: rows.map((r) => r[1]), z: rows.map((r) => r[2]) }
}

// Deduplicated edges of the triangulated mesh, as a single scatter3d "lines"
// trace with null-separated segments (Plotly's way of drawing disconnected lines).
function wireframeTrace(parsed: Parsed): Record<string, unknown> {
  const seen = new Set<string>()
  const x: (number | null)[] = [], y: (number | null)[] = [], z: (number | null)[] = []
  const addEdge = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (seen.has(key)) return
    seen.add(key)
    x.push(parsed.x[a], parsed.x[b], null)
    y.push(parsed.y[a], parsed.y[b], null)
    z.push(parsed.z[a], parsed.z[b], null)
  }
  const { i = [], j = [], k = [] } = parsed
  for (let n = 0; n < i.length; n++) {
    addEdge(i[n], j[n]); addEdge(j[n], k[n]); addEdge(k[n], i[n])
  }
  return { type: "scatter3d", mode: "lines", x, y, z, line: { color: "rgb(75, 192, 192)", width: 2 } }
}

export default function Object3DViewer() {
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [wireframe, setWireframe] = useState(false)

  const handleFile = async (file: File) => {
    try {
      setError("")
      const text = await file.text()
      const ext = file.name.split(".").pop()?.toLowerCase()
      const result = ext === "obj" ? parseObj(text) : parsePoints(text, ext === "json")
      if (result.x.length === 0) throw new Error("empty")
      setParsed(result)
      setFileName(file.name)
    } catch {
      setError("Fichier illisible. Formats supportés : .obj (maillage), .csv ou .json (nuage de points x,y,z).")
      setParsed(null)
    }
  }

  const hasMesh = !!parsed?.i && parsed.i.length > 0
  const data: Record<string, unknown>[] = parsed
    ? [
        hasMesh
          ? wireframe
            ? wireframeTrace(parsed)
            : { type: "mesh3d", x: parsed.x, y: parsed.y, z: parsed.z, i: parsed.i, j: parsed.j, k: parsed.k, color: "rgb(75, 192, 192)", opacity: 1 }
          : { type: "scatter3d", mode: "markers", x: parsed.x, y: parsed.y, z: parsed.z, marker: { size: 3, color: "rgb(75, 192, 192)" } },
      ]
    : []

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="object-file">Fichier 3D (.obj, .csv ou .json)</Label>
        <Input
          id="object-file"
          type="file"
          accept=".obj,.csv,.json"
          className="mt-1"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        <p className="text-sm text-muted-foreground mt-1">
          .obj pour un maillage (sommets + faces), .csv (une ligne « x,y,z » par point) ou .json (tableau de [x,y,z]) pour un nuage de points.
        </p>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {parsed && (
        <>
          {hasMesh && (
            <div className="flex items-center gap-2">
              <Switch id="wireframe" checked={wireframe} onCheckedChange={setWireframe} />
              <Label htmlFor="wireframe">Filaire (wireframe)</Label>
            </div>
          )}
          <div className="w-full h-[500px] border rounded-md">
            <PlotlyComponent
              data={data}
              layout={{ title: fileName, autosize: true, margin: { l: 0, r: 0, b: 0, t: 40 } }}
              config={{ responsive: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </>
      )}
    </div>
  )
}
