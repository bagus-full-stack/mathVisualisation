"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { evaluate, derivative, parse } from "mathjs"
import type { Data } from "plotly.js"
import PlotlyComponent from "@/components/plotly-component"

interface TangentVisualizerProps {
  functionExpression: string
}

export default function TangentVisualizer({ functionExpression }: TangentVisualizerProps) {
  const [showTangent, setShowTangent] = useState(true)
  const [showNormal, setShowNormal] = useState(false)
  const [tangentPoint, setTangentPoint] = useState(0)
  const [xRange, setXRange] = useState([-10, 10])
  const [error, setError] = useState("")

  // Calculate tangent line at a point
  const calculateTangentLine = useCallback((x0: number, xValues: number[]) => {
    try {
      // Calculate derivative expression
      const derivativeExpr = derivative(functionExpression, "x").toString()

      // Calculate f(x0) and f'(x0)
      const y0 = evaluate(functionExpression, { x: x0 })
      const slope = evaluate(derivativeExpr, { x: x0 })

      // Tangent line equation: y - y0 = m(x - x0) => y = m(x - x0) + y0
      const tangentYValues = xValues.map((x) => slope * (x - x0) + y0)

      return {
        tangent: tangentYValues,
        slope,
        y0,
        equation: `y = ${slope.toFixed(3)}(x - ${x0}) + ${y0.toFixed(3)}`,
      }
    } catch (e) {
      console.error("Error calculating tangent:", e)
      return null
    }
  }, [functionExpression])

  // Calculate normal line at a point (perpendicular to tangent)
  const calculateNormalLine = (x0: number, slope: number, y0: number, xValues: number[]) => {
    // Normal line has slope = -1/m if m ≠ 0
    if (slope === 0) {
      // If tangent is horizontal, normal is vertical (undefined slope)
      // For plotting, we create a vertical line at x0
      return xValues.map(() => null)
    }

    const normalSlope = -1 / slope
    // Normal line equation: y - y0 = m_normal(x - x0) => y = m_normal(x - x0) + y0
    return xValues.map((x) => normalSlope * (x - x0) + y0)
  }

  const plotData = useMemo(() => {
    try {
      parse(functionExpression)

      const xValues = Array.from({ length: 1000 }, (_, i) => xRange[0] + (i / 999) * (xRange[1] - xRange[0]))

      const yValues = xValues.map((x) => {
        try {
          return evaluate(functionExpression, { x })
        } catch {
          return null
        }
      })

      const data: Data[] = [
        {
          x: xValues,
          y: yValues,
          type: "scatter",
          mode: "lines",
          name: `f(x) = ${functionExpression}`,
          line: { color: "rgb(75, 192, 192)", width: 2 },
        },
      ]

      if (showTangent || showNormal) {
        const tangentResult = calculateTangentLine(tangentPoint, xValues)

        if (tangentResult) {
          const { tangent, slope, y0, equation } = tangentResult

          const pointTrace: Data = {
            x: [tangentPoint],
            y: [y0],
            type: "scatter",
            mode: "markers",
            name: `Point (${tangentPoint.toFixed(2)}, ${y0.toFixed(2)})`,
            marker: { color: "red", size: 10 },
          }

          data.push(pointTrace)

          if (showTangent) {
            const tangentTrace: Data = {
              x: xValues,
              y: tangent,
              type: "scatter",
              mode: "lines",
              name: `Tangente: ${equation}`,
              line: { color: "rgba(255, 99, 132, 0.8)", width: 1.5, dash: "dash" },
            }

            data.push(tangentTrace)
          }

          if (showNormal) {
            const normalYValues = calculateNormalLine(tangentPoint, slope, y0, xValues)
            const normalTrace: Data = {
              x: xValues,
              y: normalYValues,
              type: "scatter",
              mode: "lines",
              name: "Normale",
              line: { color: "rgba(54, 162, 235, 0.8)", width: 1.5, dash: "dot" },
            }

            data.push(normalTrace)
          }
        }
      }

      setError("")
      return data
    } catch (e) {
      setError("Erreur: fonction invalide ou impossible à dériver")
      console.error(e)
      return []
    }
  }, [functionExpression, xRange, tangentPoint, showTangent, showNormal, calculateTangentLine])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tangent-point">Point de tangence: x = {tangentPoint}</Label>
                <Input
                  id="tangent-point-input"
                  type="number"
                  value={tangentPoint}
                  onChange={(e) => setTangentPoint(Number(e.target.value))}
                  className="w-20 h-8"
                />
              </div>
              <Slider
                id="tangent-point"
                min={xRange[0]}
                max={xRange[1]}
                step={0.1}
                value={[tangentPoint]}
                onValueChange={(value) => setTangentPoint(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="show-tangent" checked={showTangent} onCheckedChange={setShowTangent} />
                <Label htmlFor="show-tangent">Afficher la tangente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-normal" checked={showNormal} onCheckedChange={setShowNormal} />
                <Label htmlFor="show-normal">Afficher la normale</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plage X</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    value={xRange[0]}
                    onChange={(e) => setXRange([Number(e.target.value), xRange[1]])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={xRange[1]}
                    onChange={(e) => setXRange([xRange[0], Number(e.target.value)])}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="lg:col-span-2">
            <PlotlyComponent
              data={plotData}
              layout={{
                title: "Visualisation de la tangente et de la normale",
                xaxis: { title: "x", range: xRange },
                yaxis: { title: "y" },
                autosize: true,
                height: 500,
                margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                legend: { orientation: "h", y: -0.2 },
                hovermode: "closest",
              }}
              config={{ responsive: true, displayModeBar: true }}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
