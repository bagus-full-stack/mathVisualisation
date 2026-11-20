"use client"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MAX_SIDE = 1024 // shortcut: downscale big uploads to keep per-pixel JS loops fast, raise if needed

const lum = (d: Uint8ClampedArray, i: number) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]

// 3x3 convolution with clamped edges; returns a new ImageData (alpha kept).
function convolve(src: ImageData, k: number[], div = 1, bias = 0, gray = false): ImageData {
  const { width: w, height: h, data } = src
  const out = new ImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let s = 0
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const xx = Math.min(w - 1, Math.max(0, x + i))
            const yy = Math.min(h - 1, Math.max(0, y + j))
            const p = (yy * w + xx) * 4
            s += (gray ? lum(data, p) : data[p + c]) * k[(j + 1) * 3 + i + 1]
          }
        }
        out.data[o + c] = s / div + bias
      }
      out.data[o + 3] = data[o + 3]
    }
  }
  return out
}

function sobel(src: ImageData): ImageData {
  const { width: w, height: h, data } = src
  const L = (x: number, y: number) => lum(data, (Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4)
  const out = new ImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1) - L(x - 1, y - 1) - 2 * L(x - 1, y) - L(x - 1, y + 1)
      const gy = L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1) - L(x - 1, y - 1) - 2 * L(x, y - 1) - L(x + 1, y - 1)
      const o = (y * w + x) * 4
      out.data[o] = out.data[o + 1] = out.data[o + 2] = Math.hypot(gx, gy)
      out.data[o + 3] = 255
    }
  }
  return out
}

const pixelMap = (src: ImageData, f: (r: number, g: number, b: number) => [number, number, number]) => {
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height)
  for (let i = 0; i < out.data.length; i += 4) {
    ;[out.data[i], out.data[i + 1], out.data[i + 2]] = f(out.data[i], out.data[i + 1], out.data[i + 2])
  }
  return out
}

const BLUR = [1, 2, 1, 2, 4, 2, 1, 2, 1]

type Param = { label: string; min: number; max: number; step: number; def: number }
const ALGOS: Record<string, { label: string; param?: Param; run: (s: ImageData, p: number) => ImageData }> = {
  gray: { label: "Niveaux de gris", run: (s) => pixelMap(s, (r, g, b) => { const v = 0.299 * r + 0.587 * g + 0.114 * b; return [v, v, v] }) },
  invert: { label: "Négatif", run: (s) => pixelMap(s, (r, g, b) => [255 - r, 255 - g, 255 - b]) },
  sepia: { label: "Sépia", run: (s) => pixelMap(s, (r, g, b) => [0.393 * r + 0.769 * g + 0.189 * b, 0.349 * r + 0.686 * g + 0.168 * b, 0.272 * r + 0.534 * g + 0.131 * b]) },
  threshold: { label: "Seuillage (noir/blanc)", param: { label: "Seuil", min: 0, max: 255, step: 1, def: 128 }, run: (s, t) => pixelMap(s, (r, g, b) => { const v = 0.299 * r + 0.587 * g + 0.114 * b >= t ? 255 : 0; return [v, v, v] }) },
  blur: {
    label: "Flou gaussien",
    param: { label: "Intensité (passes)", min: 1, max: 30, step: 1, def: 1 },
    run: (s, n) => { let r = s; for (let i = 0; i < n; i++) r = convolve(r, BLUR, 16); return r },
  },
  sharpen: {
    label: "Netteté",
    param: { label: "Intensité", min: 0, max: 5, step: 0.1, def: 1 },
    // unsharp mask: src + amount * (src - blurred)
    run: (s, a) => {
      const b = convolve(s, BLUR, 16)
      const out = new ImageData(new Uint8ClampedArray(s.data), s.width, s.height)
      for (let i = 0; i < out.data.length; i += 4) for (let c = 0; c < 3; c++) out.data[i + c] = s.data[i + c] + a * (s.data[i + c] - b.data[i + c])
      return out
    },
  },
  emboss: { label: "Relief (emboss)", run: (s) => convolve(s, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 128) },
  sobel: { label: "Contours (Sobel)", run: (s) => sobel(s) },
}

export default function ImageProcessor() {
  const srcRef = useRef<HTMLCanvasElement>(null)
  const outRef = useRef<HTMLCanvasElement>(null)
  const [source, setSource] = useState<ImageData | null>(null)
  const [algo, setAlgo] = useState("gray")
  const [param, setParam] = useState(ALGOS.gray.param?.def ?? 0)
  const [error, setError] = useState("")

  const onFile = (file?: File) => {
    if (!file) return
    setError("")
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
      const c = srcRef.current!
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      const ctx = c.getContext("2d", { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0, c.width, c.height)
      setSource(ctx.getImageData(0, 0, c.width, c.height))
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setError("Fichier image illisible.")
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  useEffect(() => {
    if (!source || !outRef.current) return
    const result = ALGOS[algo].run(source, param)
    const c = outRef.current
    c.width = result.width
    c.height = result.height
    c.getContext("2d")!.putImageData(result, 0, 0)
  }, [source, algo, param])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image-file">Image</Label>
          <Input id="image-file" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="space-y-2">
          <Label>Algorithme</Label>
          <Select value={algo} onValueChange={(k) => { setAlgo(k); setParam(ALGOS[k].param?.def ?? 0) }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ALGOS).map(([k, a]) => (
                <SelectItem key={k} value={k}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {ALGOS[algo].param && (
        <div className="space-y-2">
          <Label>{ALGOS[algo].param.label}: {param}</Label>
          <Slider min={ALGOS[algo].param.min} max={ALGOS[algo].param.max} step={ALGOS[algo].param.step} value={[param]} onValueChange={(v) => setParam(Number(v[0].toFixed(2)))} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Original</p>
          <canvas ref={srcRef} className="w-full h-auto rounded border" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Résultat</p>
          <canvas ref={outRef} className="w-full h-auto rounded border" />
        </div>
      </div>
    </div>
  )
}
