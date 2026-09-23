import { notFound } from "next/navigation"
import { db, ensureSchema } from "@/lib/db"
import SharedGraphView from "./shared-graph-view"

export default async function SharedGraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await ensureSchema()
  const result = await db.execute({
    sql: "SELECT title, description, function_expression FROM shared_graphs WHERE id = ?",
    args: [id],
  })

  const row = result.rows[0]
  if (!row) notFound()

  return (
    <SharedGraphView
      title={row.title as string}
      description={row.description as string}
      functionExpression={row.function_expression as string}
    />
  )
}
