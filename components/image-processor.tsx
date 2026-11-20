"use client"

import { useDeferredValue, useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import PlotlyComponent from "@/components/plotly-component"
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

const clone = (s: ImageData) => new ImageData(new Uint8ClampedArray(s.data), s.width, s.height)

// Applies a 256-entry lookup table to every colour channel.
const applyLut = (s: ImageData, lut: (v: number) => number) => {
  const t = Array.from({ length: 256 }, (_, v) => lut(v))
  const out = clone(s)
  for (let i = 0; i < out.data.length; i += 4) for (let c = 0; c < 3; c++) out.data[i + c] = t[out.data[i + c]]
  return out
}

const lumHistogram = (s: ImageData) => {
  const h = new Array(256).fill(0)
  for (let i = 0; i < s.data.length; i += 4) h[Math.round(lum(s.data, i))]++
  return h
}

const toGray = (s: ImageData, f: (x: number, y: number, v: number) => number) => {
  const out = new ImageData(s.width, s.height)
  for (let y = 0; y < s.height; y++) {
    for (let x = 0; x < s.width; x++) {
      const o = (y * s.width + x) * 4
      out.data[o] = out.data[o + 1] = out.data[o + 2] = f(x, y, lum(s.data, o))
      out.data[o + 3] = 255
    }
  }
  return out
}

function equalize(s: ImageData) {
  const hist = lumHistogram(s)
  const total = s.width * s.height
  let acc = 0
  const cdf = hist.map((n) => (acc += n))
  const cdfMin = cdf.find((v) => v > 0) ?? 0
  const lut = cdf.map((v) => (total === cdfMin ? 0 : ((v - cdfMin) / (total - cdfMin)) * 255))
  // scale each pixel by new/old luminance so colours are kept
  const out = clone(s)
  for (let i = 0; i < out.data.length; i += 4) {
    const l = lum(s.data, i)
    const n = lut[Math.round(l)]
    for (let c = 0; c < 3; c++) out.data[i + c] = l === 0 ? n : (s.data[i + c] * n) / l
  }
  return out
}

function otsuThreshold(s: ImageData) {
  const h = lumHistogram(s)
  const total = s.width * s.height
  let sum = 0
  h.forEach((n, v) => (sum += n * v))
  let wB = 0, sumB = 0, best = 0, t = 0
  for (let v = 0; v < 256; v++) {
    wB += h[v]
    if (!wB || wB === total) continue
    sumB += v * h[v]
    const mB = sumB / wB
    const mF = (sum - sumB) / (total - wB)
    const between = wB * (total - wB) * (mB - mF) ** 2
    if (between > best) { best = between; t = v }
  }
  return t
}

function laplacian(s: ImageData) {
  const { width: w, height: h, data } = s
  const L = (x: number, y: number) => lum(data, (Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4)
  return toGray(s, (x, y) => Math.abs(L(x - 1, y) + L(x + 1, y) + L(x, y - 1) + L(x, y + 1) - 4 * L(x, y)))
}

function median(s: ImageData) {
  const { width: w, height: h, data } = s
  const out = clone(s)
  const win = new Uint8Array(9)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let n = 0
        for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
          win[n++] = data[(Math.min(h - 1, Math.max(0, y + j)) * w + Math.min(w - 1, Math.max(0, x + i))) * 4 + c]
        }
        // insertion sort: faster than a generic sort for 9 values
        for (let a = 1; a < 9; a++) {
          const v = win[a]
          let b = a - 1
          for (; b >= 0 && win[b] > v; b--) win[b + 1] = win[b]
          win[b + 1] = v
        }
        out.data[(y * w + x) * 4 + c] = win[4]
      }
    }
  }
  return out
}

// Grey dilation (max) / erosion (min) with a square window of radius r, per channel.
// A square window is separable: one horizontal pass then one vertical pass, O(r) instead of O(r^2) per pixel.
function morph(s: ImageData, r: number, useMax: boolean) {
  const { width: w, height: h, data } = s
  const tmp = new Uint8ClampedArray(data.length)
  const out = clone(s)
  const init = useMax ? 0 : 255
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let v = init
        for (let i = -r; i <= r; i++) {
          const p = data[(y * w + Math.min(w - 1, Math.max(0, x + i))) * 4 + c]
          v = useMax ? Math.max(v, p) : Math.min(v, p)
        }
        tmp[(y * w + x) * 4 + c] = v
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let v = init
        for (let j = -r; j <= r; j++) {
          const p = tmp[(Math.min(h - 1, Math.max(0, y + j)) * w + x) * 4 + c]
          v = useMax ? Math.max(v, p) : Math.min(v, p)
        }
        out.data[(y * w + x) * 4 + c] = v
      }
    }
  }
  return out
}

function pixelate(s: ImageData, b: number) {
  const { width: w, height: h, data } = s
  const out = clone(s)
  for (let by = 0; by < h; by += b) {
    for (let bx = 0; bx < w; bx += b) {
      const sum = [0, 0, 0]
      let n = 0
      for (let y = by; y < Math.min(h, by + b); y++) for (let x = bx; x < Math.min(w, bx + b); x++, n++) for (let c = 0; c < 3; c++) sum[c] += data[(y * w + x) * 4 + c]
      for (let y = by; y < Math.min(h, by + b); y++) for (let x = bx; x < Math.min(w, bx + b); x++) for (let c = 0; c < 3; c++) out.data[(y * w + x) * 4 + c] = sum[c] / n
    }
  }
  return out
}

// In-place iterative radix-2 FFT (length must be a power of two).
function fft(re: Float64Array, im: Float64Array, inverse: boolean) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len
    const wr = Math.cos(ang), wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr
        re[b] = re[a] - tr; im[b] = im[a] - ti
        re[a] += tr; im[a] += ti
        ;[cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr]
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n }
}

const pow2 = (n: number) => 2 ** Math.ceil(Math.log2(Math.max(n, 1)))

// Mirror index into [0, n): pads with a reflection of the image instead of black, so the borders do not ring.
const reflect = (i: number, n: number) => {
  if (n === 1) return 0
  const p = 2 * (n - 1)
  const m = ((i % p) + p) % p
  return m < n ? m : p - m
}

function fft2(re: Float64Array, im: Float64Array, W: number, H: number, inverse: boolean) {
  for (let y = 0; y < H; y++) fft(re.subarray(y * W, (y + 1) * W), im.subarray(y * W, (y + 1) * W), inverse)
  const cr = new Float64Array(H), ci = new Float64Array(H)
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) { cr[y] = re[y * W + x]; ci[y] = im[y * W + x] }
    fft(cr, ci, inverse)
    for (let y = 0; y < H; y++) { re[y * W + x] = cr[y]; im[y * W + x] = ci[y] }
  }
}

// Forward spectra of R, G, B are cached per source image: moving the slider only redoes mask + inverse.
const spectra = new WeakMap<ImageData, { W: number; H: number; ch: [Float64Array, Float64Array][] }>()

function spectrum(s: ImageData) {
  let sp = spectra.get(s)
  if (!sp) {
    const W = pow2(s.width), H = pow2(s.height)
    const ch = [0, 1, 2].map((c) => {
      const re = new Float64Array(W * H), im = new Float64Array(W * H)
      for (let y = 0; y < H; y++) {
        const sy = reflect(y, s.height)
        for (let x = 0; x < W; x++) re[y * W + x] = s.data[(sy * s.width + reflect(x, s.width)) * 4 + c]
      }
      fft2(re, im, W, H, false)
      return [re, im] as [Float64Array, Float64Array]
    })
    sp = { W, H, ch }
    spectra.set(s, sp)
  }
  return sp
}

// Gaussian low-pass (high-pass = 1 - low-pass) on each colour channel; the smooth mask avoids the ringing of a hard cutoff.
function fourier(s: ImageData, cutoffPct: number, low: boolean) {
  const { W, H, ch } = spectrum(s)
  const sigma = cutoffPct / 50
  const mask = new Float64Array(W * H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(Math.min(x, W - x) / (W / 2), Math.min(y, H - y) / (H / 2))
      const g = Math.exp(-(d * d) / (2 * sigma * sigma))
      mask[y * W + x] = low ? g : 1 - g
    }
  }
  const out = new ImageData(s.width, s.height)
  ch.forEach(([sre, sim], c) => {
    const re = new Float64Array(sre), im = new Float64Array(sim)
    for (let i = 0; i < mask.length; i++) { re[i] *= mask[i]; im[i] *= mask[i] }
    fft2(re, im, W, H, true)
    for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) out.data[(y * s.width + x) * 4 + c] = re[y * W + x] + (low ? 0 : 128)
  })
  for (let i = 3; i < out.data.length; i += 4) out.data[i] = 255
  return out
}

type Param = { label: string; min: number; max: number; step: number; def: number }
type Algo = { label: string; params?: Param[]; run: (s: ImageData, p: number[]) => ImageData }
const bw = (s: ImageData, t: number) => pixelMap(s, (r, g, b) => { const v = 0.299 * r + 0.587 * g + 0.114 * b >= t ? 255 : 0; return [v, v, v] })

const ALGOS: Record<string, Algo> = {
  gray: { label: "Niveaux de gris", run: (s) => pixelMap(s, (r, g, b) => { const v = 0.299 * r + 0.587 * g + 0.114 * b; return [v, v, v] }) },
  invert: { label: "Négatif", run: (s) => pixelMap(s, (r, g, b) => [255 - r, 255 - g, 255 - b]) },
  sepia: { label: "Sépia", run: (s) => pixelMap(s, (r, g, b) => [0.393 * r + 0.769 * g + 0.189 * b, 0.349 * r + 0.686 * g + 0.168 * b, 0.272 * r + 0.534 * g + 0.131 * b]) },
  brightness: {
    label: "Luminosité / contraste",
    params: [
      { label: "Contraste (a)", min: 0, max: 3, step: 0.05, def: 1 },
      { label: "Luminosité (b)", min: -255, max: 255, step: 1, def: 0 },
    ],
    run: (s, [a, b]) => applyLut(s, (v) => a * (v - 128) + 128 + b),
  },
  gamma: {
    label: "Correction gamma",
    params: [{ label: "Gamma (γ)", min: 0.1, max: 5, step: 0.05, def: 1 }],
    run: (s, [g]) => applyLut(s, (v) => 255 * (v / 255) ** (1 / g)),
  },
  posterize: {
    label: "Posterisation",
    params: [{ label: "Niveaux", min: 2, max: 16, step: 1, def: 4 }],
    run: (s, [n]) => applyLut(s, (v) => Math.round((v / 255) * (n - 1)) * (255 / (n - 1))),
  },
  pixelate: {
    label: "Pixelisation",
    params: [{ label: "Taille des blocs", min: 2, max: 64, step: 1, def: 8 }],
    run: (s, [b]) => pixelate(s, b),
  },
  equalize: { label: "Égalisation d'histogramme", run: (s) => equalize(s) },
  threshold: {
    label: "Seuillage (noir/blanc)",
    params: [{ label: "Seuil", min: 0, max: 255, step: 1, def: 128 }],
    run: (s, [t]) => bw(s, t),
  },
  otsu: { label: "Seuillage automatique (Otsu)", run: (s) => bw(s, otsuThreshold(s)) },
  blur: {
    label: "Flou gaussien",
    params: [{ label: "Intensité (passes)", min: 1, max: 30, step: 1, def: 1 }],
    run: (s, [n]) => { let r = s; for (let i = 0; i < n; i++) r = convolve(r, BLUR, 16); return r },
  },
  median: { label: "Filtre médian 3×3", run: (s) => median(s) },
  sharpen: {
    label: "Netteté",
    params: [{ label: "Intensité", min: 0, max: 5, step: 0.1, def: 1 }],
    // unsharp mask: src + amount * (src - blurred)
    run: (s, [a]) => {
      const b = convolve(s, BLUR, 16)
      const out = clone(s)
      for (let i = 0; i < out.data.length; i += 4) for (let c = 0; c < 3; c++) out.data[i + c] = s.data[i + c] + a * (s.data[i + c] - b.data[i + c])
      return out
    },
  },
  emboss: { label: "Relief (emboss)", run: (s) => convolve(s, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 128) },
  sobel: { label: "Contours (Sobel)", run: (s) => sobel(s) },
  laplacian: { label: "Contours (Laplacien)", run: (s) => laplacian(s) },
  dilate: {
    label: "Dilatation",
    params: [{ label: "Rayon", min: 1, max: 5, step: 1, def: 1 }],
    run: (s, [r]) => morph(s, r, true),
  },
  erode: {
    label: "Érosion",
    params: [{ label: "Rayon", min: 1, max: 5, step: 1, def: 1 }],
    run: (s, [r]) => morph(s, r, false),
  },
  lowpass: {
    label: "Fourier : passe-bas",
    params: [{ label: "Fréquence de coupure (%)", min: 1, max: 100, step: 1, def: 20 }],
    run: (s, [c]) => fourier(s, c, true),
  },
  highpass: {
    label: "Fourier : passe-haut",
    params: [{ label: "Fréquence de coupure (%)", min: 1, max: 100, step: 1, def: 10 }],
    run: (s, [c]) => fourier(s, c, false),
  },
}

const defaults = (k: string) => ALGOS[k].params?.map((p) => p.def) ?? []

export default function ImageProcessor() {
  const srcRef = useRef<HTMLCanvasElement>(null)
  const outRef = useRef<HTMLCanvasElement>(null)
  const [source, setSource] = useState<ImageData | null>(null)
  const [algo, setAlgo] = useState("gray")
  const [params, setParams] = useState<number[]>(defaults("gray"))
  const [error, setError] = useState("")
  const [hists, setHists] = useState<{ src: number[]; out: number[] } | null>(null)
  const deferred = useDeferredValue(params)

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
    const result = ALGOS[algo].run(source, deferred)
    const c = outRef.current
    c.width = result.width
    c.height = result.height
    c.getContext("2d")!.putImageData(result, 0, 0)
    setHists({ src: lumHistogram(source), out: lumHistogram(result) })
  }, [source, algo, deferred])

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
          <Select value={algo} onValueChange={(k) => { setAlgo(k); setParams(defaults(k)) }}>
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

      {ALGOS[algo].params?.map((p, i) => (
        <div key={p.label} className="space-y-2">
          <Label>{p.label}: {params[i]}</Label>
          <Slider min={p.min} max={p.max} step={p.step} value={[params[i]]} onValueChange={(v) => setParams((prev) => prev.map((x, n) => (n === i ? Number(v[0].toFixed(2)) : x)))} />
        </div>
      ))}

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

      {hists && (
        <PlotlyComponent
          data={[
            { type: "scatter", mode: "lines", fill: "tozeroy", name: "Original", x: hists.src.map((_, i) => i), y: hists.src },
            { type: "scatter", mode: "lines", fill: "tozeroy", name: "Résultat", x: hists.out.map((_, i) => i), y: hists.out },
          ]}
          layout={{
            title: "Histogramme de luminance",
            xaxis: { title: "Niveau (0-255)" },
            yaxis: { title: "Pixels" },
            height: 280,
            margin: { l: 60, r: 20, b: 50, t: 40 },
            legend: { orientation: "h", y: -0.3 },
          }}
          style={{ width: "100%" }}
        />
      )}
    </div>
  )
}
