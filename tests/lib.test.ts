import { test } from "node:test"
import assert from "node:assert/strict"
import { parseObj, parseStl } from "../lib/mesh.ts"
import { validateShare } from "../lib/share.ts"

test("parseObj: face, quad fan, negative index, bad index skipped", () => {
  const obj = "v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\nf -1 -2 -3\nf 1 2 9"
  const m = parseObj(obj)
  assert.equal(m.x.length, 4)
  assert.deepEqual(m.i, [0, 0, 3])
  assert.deepEqual(m.j, [1, 2, 2])
  assert.deepEqual(m.k, [2, 3, 1])
})

test("parseStl: ascii and binary give the same triangle", () => {
  const ascii = "solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid"
  const a = parseStl(new TextEncoder().encode(ascii).buffer as ArrayBuffer)
  const buf = new ArrayBuffer(84 + 50)
  const v = new DataView(buf)
  v.setUint32(80, 1, true)
  ;[0, 0, 0, 1, 0, 0, 0, 1, 0].forEach((n, idx) => v.setFloat32(96 + idx * 4, n, true))
  const b = parseStl(buf)
  assert.deepEqual(a.x, b.x)
  assert.deepEqual(a.y, b.y)
  assert.deepEqual(a.i, [0])
})

test("validateShare: accepts plain maths, rejects the rest", () => {
  const ok = (e: unknown, extra = {}) => validateShare({ functionExpression: e, ...extra })
  assert.equal(ok("x^2 + sin(x) * pi"), null)
  assert.ok(ok("factorial(1e9)"))
  assert.ok(ok("zeros(1000000)"))
  assert.ok(ok("[1,2,3]"))
  assert.ok(ok("x".repeat(501)))
  assert.ok(ok(""))
  assert.ok(ok(5))
  assert.ok(ok("x", { title: {} }))
  assert.ok(ok("x", { description: "a".repeat(2001) }))
  assert.ok(validateShare(null))
})
