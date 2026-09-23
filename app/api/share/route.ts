import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db, ensureSchema } from "@/lib/db"

export async function POST(request: NextRequest) {
  const { title, description, functionExpression } = await request.json()

  if (!functionExpression || typeof functionExpression !== "string") {
    return NextResponse.json({ error: "functionExpression requis" }, { status: 400 })
  }

  await ensureSchema()

  const id = randomUUID().slice(0, 8)
  await db.execute({
    sql: "INSERT INTO shared_graphs (id, title, description, function_expression, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, title ?? "", description ?? "", functionExpression, new Date().toISOString()],
  })

  return NextResponse.json({ id })
}
