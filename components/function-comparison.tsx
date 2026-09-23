"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"
import { evaluate } from "mathjs"
import { Badge } from "@/components/ui/badge"
import PlotlyComponent from "@/components/plotly-component"

const DEFAULT_FUNCTIONS = [
  { id: 1, expression: "sin(x)", color: "#4285F4", active: true },
  { id: 2, expression: "cos(x)", color: "#DB4437", active: true },
]

const COLOR_PALETTE = [
  "#4285F4", // Google Blue
  "#DB4437", // Google Red
  "#F4B400", // Google Yellow
  "#0F9D58", // Google Green
  "#9C27B0", // Purple
  "#00ACC1", // Cyan
  "#FF7043", // Deep Orange
  "#3949AB", // Indigo
]

export default function FunctionComparison() {
  const [functions, setFunctions] = useState(DEFAULT_FUNCTIONS)
  const [xRange, setXRange] = useState([-10, 10])
  const [yRange, setYRange] = useState([-2, 2])
  const [error, setError] = useState("")

  // Generate a new unique ID for functions
  const generateId = () => {
    return Math.max(0, ...functions.map((f) => f.id)) + 1
  }

  // Add a new function
  const addFunction = () => {
    if (functions.length >= 8) {
      setError("Maximum de 8 fonctions atteint.")
      return
    }

    setError("")
    const newColor = COLOR_PALETTE[functions.length % COLOR_PALETTE.length]
    setFunctions([...functions, { id: generateId(), expression: "", color: newColor, active: true }])
  }

  // Remove a function
  const removeFunction = (id: number) => {
    if (functions.length <= 1) {
      setError("Vous devez conserver au moins une fonction.")
      return
    }

    setError("")
    setFunctions(functions.filter((f) => f.id !== id))
  }

  // Update function expression
  const updateFunction = (id: number, expression: string) => {
    setFunctions(functions.map((f) => (f.id === id ? { ...f, expression } : f)))
  }

  // Toggle function visibility
  const toggleFunction = (id: number) => {
    setFunctions(functions.map((f) => (f.id === id ? { ...f, active: !f.active } : f)))
  }

  const plotData = useMemo(() => {
    const xValues = Array.from({ length: 100 }, (_, i) => xRange[0] + (i / 99) * (xRange[1] - xRange[0]))

    return functions
      .filter((f) => f.active && f.expression.trim() !== "")
      .map((f) => {
        try {
          const yValues = xValues.map((x) => {
            try {
              return evaluate(f.expression, { x })
            } catch {
              return null
            }
          })

          return {
            x: xValues,
            y: yValues,
            type: "scatter",
            mode: "lines",
            name: f.expression,
            line: { color: f.color, width: 2 },
          }
        } catch {
          return null
        }
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
  }, [functions, xRange])

  // Update range values
  const updateRange = (axis: "x" | "y", index: 0 | 1, value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    if (axis === "x") {
      const newRange = [...xRange]
      newRange[index] = numValue
      setXRange(newRange)
    } else {
      const newRange = [...yRange]
      newRange[index] = numValue
      setYRange(newRange)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Comparaison de fonctions</h2>
        <Button variant="outline" onClick={addFunction} disabled={functions.length >= 8}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter une fonction
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {functions.map((func) => (
          <Card key={func.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: func.color }} />
                <Badge
                  variant={func.active ? "default" : "outline" as "default" | "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFunction(func.id)}
                >
                  {func.active ? "Visible" : "Masquée"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-8 w-8 p-0"
                  onClick={() => removeFunction(func.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`function-${func.id}`}>f(x) =</Label>
                <Input
                  id={`function-${func.id}`}
                  value={func.expression}
                  onChange={(e) => updateFunction(func.id, e.target.value)}
                  placeholder="ex: sin(x)"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Label>Plage X</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                value={xRange[0]}
                onChange={(e) => updateRange("x", 0, e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                value={xRange[1]}
                onChange={(e) => updateRange("x", 1, e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Label>Plage Y</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                value={yRange[0]}
                onChange={(e) => updateRange("y", 0, e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                value={yRange[1]}
                onChange={(e) => updateRange("y", 1, e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <PlotlyComponent
            data={plotData}
            layout={{
              title: "Comparaison de fonctions",
              xaxis: { title: "x", range: xRange },
              yaxis: { title: "y", range: yRange },
              autosize: true,
              height: 500,
              legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.2,
              },
              margin: { l: 50, r: 50, b: 100, t: 50, pad: 4 },
              hovermode: "closest",
            }}
            config={{ responsive: true, displayModeBar: true }}
            style={{ width: "100%" }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

