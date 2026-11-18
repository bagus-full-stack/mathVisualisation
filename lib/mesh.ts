export type Parsed = { x: number[]; y: number[]; z: number[]; i?: number[]; j?: number[]; k?: number[] }

// Minimal Wavefront OBJ support: "v x y z" vertices and "f a b c ..." faces
// (fan-triangulated if a face has more than 3 vertices). Texture/normal
// indices after "/" are ignored.
export function parseObj(text: string): Parsed {
  const x: number[] = [], y: number[] = [], z: number[] = []
  const i: number[] = [], j: number[] = [], k: number[] = []
  for (const line of text.split("\n")) {
    const parts = line.trim().split(/\s+/)
    if (parts[0] === "v") {
      x.push(Number(parts[1])); y.push(Number(parts[2])); z.push(Number(parts[3]))
    } else if (parts[0] === "f") {
      // Negative indices count back from the last vertex read so far.
      const idx = parts.slice(1).map((p) => {
        const v = Number(p.split("/")[0])
        return v < 0 ? x.length + v : v - 1
      })
      if (idx.some((v) => !Number.isInteger(v) || v < 0 || v >= x.length)) continue
      for (let n = 1; n < idx.length - 1; n++) {
        i.push(idx[0]); j.push(idx[n]); k.push(idx[n + 1])
      }
    }
  }
  return { x, y, z, i, j, k }
}

// STL: binary if the file size matches header(80) + count(4) + count*50 bytes
// exactly, otherwise ASCII ("facet normal ... vertex x y z ... endfacet").
// Vertices aren't deduplicated between triangles (STL doesn't share them
// either), so wireframe edges from adjacent faces may overlap visually.
export function parseStl(buffer: ArrayBuffer): Parsed {
  const view = new DataView(buffer)
  const triCount = buffer.byteLength >= 84 ? view.getUint32(80, true) : -1
  if (80 + 4 + triCount * 50 === buffer.byteLength) return parseStlBinary(view, triCount)
  return parseStlAscii(new TextDecoder().decode(buffer))
}

function parseStlBinary(view: DataView, triCount: number): Parsed {
  const x: number[] = [], y: number[] = [], z: number[] = []
  const i: number[] = [], j: number[] = [], k: number[] = []
  let offset = 84
  for (let t = 0; t < triCount; t++) {
    offset += 12 // skip normal vector
    const base = x.length
    for (let v = 0; v < 3; v++) {
      x.push(view.getFloat32(offset, true))
      y.push(view.getFloat32(offset + 4, true))
      z.push(view.getFloat32(offset + 8, true))
      offset += 12
    }
    i.push(base); j.push(base + 1); k.push(base + 2)
    offset += 2 // attribute byte count
  }
  return { x, y, z, i, j, k }
}

function parseStlAscii(text: string): Parsed {
  const x: number[] = [], y: number[] = [], z: number[] = []
  const i: number[] = [], j: number[] = [], k: number[] = []
  const vertexRe = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g
  let match: RegExpExecArray | null
  while ((match = vertexRe.exec(text))) {
    x.push(Number(match[1])); y.push(Number(match[2])); z.push(Number(match[3]))
    if (x.length % 3 === 0) {
      const base = x.length - 3
      i.push(base); j.push(base + 1); k.push(base + 2)
    }
  }
  return { x, y, z, i, j, k }
}
