import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db, ensureSchema } from "@/lib/db"
import { validateShare } from "@/lib/share"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const error = validateShare(body)
  if (error) return NextResponse.json({ error }, { status: 400 })
  const { title = "", description = "", functionExpression } = body

  await ensureSchema()

  // 12 hex chars: 8 gave a visible chance of collision after ~60k shares.
  const id = randomUUID().replace(/-/g, "").slice(0, 12)
  await db.execute({
    sql: "INSERT INTO shared_graphs (id, title, description, function_expression, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, title, description, functionExpression, new Date().toISOString()],
  })

  return NextResponse.json({ id })
}
