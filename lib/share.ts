import { parse } from "mathjs"

const MAX = { title: 200, description: 2000, expression: 500 }
// Shared expressions run in every visitor's browser, so only plain
// arithmetic and these functions are accepted (no matrices, no factorial...).
const FUNCTIONS = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
  "exp", "log", "log10", "log2", "sqrt", "cbrt", "abs", "floor", "ceil",
  "round", "sign", "pow", "min", "max", "mod",
])
const SYMBOLS = new Set(["x", "pi", "e"])
const NODES = new Set(["ConstantNode", "SymbolNode", "OperatorNode", "ParenthesisNode", "FunctionNode"])

export function validateShare(body: unknown): string | null {
  const { title = "", description = "", functionExpression } = (body ?? {}) as Record<string, unknown>
  if (typeof title !== "string" || title.length > MAX.title) return "title invalide"
  if (typeof description !== "string" || description.length > MAX.description) return "description invalide"
  if (typeof functionExpression !== "string" || !functionExpression || functionExpression.length > MAX.expression)
    return "functionExpression invalide"
  try {
    let ok = true
    parse(functionExpression).traverse((node) => {
      const n = node as { type: string; name?: string; fn?: { name?: string } }
      if (!NODES.has(n.type)) ok = false
      else if (n.type === "SymbolNode" && !SYMBOLS.has(n.name!) && !FUNCTIONS.has(n.name!)) ok = false
      else if (n.type === "FunctionNode" && !FUNCTIONS.has(n.fn?.name ?? "")) ok = false
    })
    return ok ? null : "expression non autorisée"
  } catch {
    return "expression invalide"
  }
}
