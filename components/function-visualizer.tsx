"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, RotateCcw, Save, Share2, Info, History } from "lucide-react"
import { evaluate, derivative, parse } from "mathjs"
import PlotlyComponent from "@/components/plotly-component"

interface FunctionVisualizerProps {
  mode: "2d" | "3d"
}

export default function FunctionVisualizer({ mode }: FunctionVisualizerProps) {
  const [functionInput, setFunctionInput] = useState(mode === "2d" ? "sin(x)" : "x^2 + y^2")
  const [xRange, setXRange] = useState([-10, 10])
  const [yRange, setYRange] = useState([-10, 10])
  const [zRange, setZRange] = useState([-10, 10])
  const [error, setError] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [plotData, setPlotData] = useState<Record<string, unknown>[]>([])
  const [plotLayout, setPlotLayout] = useState<Record<string, unknown>>({})

  // Examples for quick selection
  const examples =
      mode === "2d"
          ? [
            { label: "Sinus", value: "sin(x)" },
            { label: "Cosinus", value: "cos(x)" },
            { label: "Polynôme", value: "x^3 - 2*x^2 + 3*x - 1" },
            { label: "Exponentielle", value: "exp(x)" },
          ]
          : [
            { label: "Paraboloïde", value: "x^2 + y^2" },
            { label: "Selle", value: "x^2 - y^2" },
            { label: "Sinus 3D", value: "sin(sqrt(x^2 + y^2))" },
            { label: "Complexe", value: "sin(x) * cos(y)" },
          ]

  // Generate a range of values
  const generateRange = (start: number, end: number, points: number) => {
    const step = (end - start) / (points - 1)
    return Array.from({ length: points }, (_, i) => start + i * step)
  }

  // Validate and generate the plot
  const generatePlot = useCallback(() => {
    try {
      setError("")

      if (mode === "2d") {
        // Generate 2D plot
        const xValues = generateRange(xRange[0], xRange[1], 100)
        const yValues = xValues.map((x) => {
          try {
            return evaluate(functionInput, { x })
          } catch {
            return null
          }
        })

        // Calculate derivative for analysis
        try {
          const derivativeExpr = derivative(functionInput, "x").toString()

          // Find critical points (where derivative is zero)
          const criticalPoints = xValues.filter((x, i) => {
            if (i === 0 || i === xValues.length - 1) return false

            const prevY = yValues[i - 1]
            const currY = yValues[i]
            const nextY = yValues[i + 1]

            if (prevY === null || currY === null || nextY === null) return false

            // Check if derivative changes sign
            const prevDeriv = evaluate(derivativeExpr, { x: xValues[i - 1] })
            const nextDeriv = evaluate(derivativeExpr, { x: xValues[i + 1] })

            return prevDeriv * nextDeriv <= 0
          })

          setPlotData([
            {
              x: xValues,
              y: yValues,
              type: "scatter",
              mode: "lines",
              name: functionInput,
              line: { color: "rgb(75, 192, 192)", width: 2 },
            },
            {
              x: criticalPoints,
              y: criticalPoints.map((x) => evaluate(functionInput, { x })),
              type: "scatter",
              mode: "markers",
              name: "Points critiques",
              marker: { color: "red", size: 8 },
            },
          ])
        } catch {
          // If derivative calculation fails, just show the function
          setPlotData([
            {
              x: xValues,
              y: yValues,
              type: "scatter",
              mode: "lines",
              name: functionInput,
              line: { color: "rgb(75, 192, 192)", width: 2 },
            },
          ])
        }

        setPlotLayout({
          title: `f(x) = ${functionInput}`,
          xaxis: { title: "x", range: xRange },
          yaxis: { title: "y", range: yRange },
          autosize: true,
          height: 500,
          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
        })
      } else {
        // Generate 3D plot
        const xValues = generateRange(xRange[0], xRange[1], 30)
        const yValues = generateRange(yRange[0], yRange[1], 30)

        const zValues = []
        for (let i = 0; i < yValues.length; i++) {
          const row = []
          for (let j = 0; j < xValues.length; j++) {
            try {
              row.push(evaluate(functionInput, { x: xValues[j], y: yValues[i] }))
            } catch {
              row.push(null)
            }
          }
          zValues.push(row)
        }

        setPlotData([
          {
            type: "surface",
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: "Viridis",
            contours: {
              z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: { z: true },
              },
            },
          },
        ])

        setPlotLayout({
          title: `f(x,y) = ${functionInput}`,
          autosize: true,
          height: 600,
          scene: {
            xaxis: {
              title: "x",
              range: xRange,
              autorange: false,
            },
            yaxis: {
              title: "y",
              range: yRange,
              autorange: false,
            },
            zaxis: {
              title: "z",
              range: zRange,
              autorange: false,
            },
            camera: {
              eye: { x: 1.5, y: 1.5, z: 1 },
            },
            aspectratio: { x: 1, y: 1, z: 0.8 },
          },
          margin: { l: 0, r: 0, b: 0, t: 50, pad: 4 },
        })
      }

      // Add to history
      if (!history.includes(functionInput)) {
        setHistory((prev) => [functionInput, ...prev].slice(0, 10))
      }
    } catch (_e) {
      setError("Erreur: Fonction invalide ou impossible à évaluer")
      console.error(_e)
    }
  }, [functionInput, xRange, yRange, zRange, mode, history])

  // Validate function syntax
  const validateFunction = (input: string) => {
    try {
      if (mode === "2d") {
        parse(input)
        // Test with a sample value
        evaluate(input, { x: 1 })
      } else {
        parse(input)
        // Test with sample values
        evaluate(input, { x: 1, y: 1 })
      }
      return true
    } catch {
      return false
    }
  }

  // Handle function input change
  const handleFunctionChange = (value: string) => {
    setFunctionInput(value)
    setError("")
  }

  // Handle example selection
  const handleExampleSelect = (value: string) => {
    setFunctionInput(value)
    setError("")
  }

  // Handle min/max range input changes
  const handleMinMaxRangeChange = (axis: "x" | "y" | "z", minOrMax: "min" | "max", value: number) => {
    if (axis === "x") {
      if (minOrMax === "min") {
        setXRange([value, xRange[1]])
      } else {
        setXRange([xRange[0], value])
      }
    } else if (axis === "y") {
      if (minOrMax === "min") {
        setYRange([value, yRange[1]])
      } else {
        setYRange([yRange[0], value])
      }
    } else if (axis === "z") {
      if (minOrMax === "min") {
        setZRange([value, zRange[1]])
      } else {
        setZRange([zRange[0], value])
      }
    }
  }

  // Generate plot on initial render and when function changes
  useEffect(() => {
    generatePlot()
  }, [generatePlot])

  return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="function">Fonction {mode === "2d" ? "f(x)" : "f(x,y)"}</Label>
                <div className="flex mt-1">
                  <Input
                      id="function"
                      value={functionInput}
                      onChange={(e) => handleFunctionChange(e.target.value)}
                      placeholder={mode === "2d" ? "ex: sin(x)" : "ex: x^2 + y^2"}
                      className={error ? "border-red-500" : ""}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Utilisez x {mode === "3d" && "et y"} comme variables.</p>
                        <p>Fonctions supportées: sin, cos, tan, exp, log, sqrt, ^, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div>
                <Label htmlFor="example">Exemples</Label>
                <Select onValueChange={handleExampleSelect}>
                  <SelectTrigger id="example">
                    <SelectValue placeholder="Sélectionner un exemple" />
                  </SelectTrigger>
                  <SelectContent>
                    <>
                      {examples.map((example) => (
                          <SelectItem key={example.value} value={example.value}>
                            {example.label}
                          </SelectItem>
                      ))}
                    </>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plage X</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min</Label>
                    <Input
                        type="number"
                        value={xRange[0]}
                        onChange={(e) => handleMinMaxRangeChange("x", "min", Number.parseFloat(e.target.value))}
                        className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max</Label>
                    <Input
                        type="number"
                        value={xRange[1]}
                        onChange={(e) => handleMinMaxRangeChange("x", "max", Number.parseFloat(e.target.value))}
                        className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Plage Y</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min</Label>
                    <Input
                        type="number"
                        value={yRange[0]}
                        onChange={(e) => handleMinMaxRangeChange("y", "min", Number.parseFloat(e.target.value))}
                        className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max</Label>
                    <Input
                        type="number"
                        value={yRange[1]}
                        onChange={(e) => handleMinMaxRangeChange("y", "max", Number.parseFloat(e.target.value))}
                        className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {mode === "3d" && (
                  <div className="space-y-2">
                    <Label>Plage Z</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Min</Label>
                        <Input
                            type="number"
                            value={zRange[0]}
                            onChange={(e) => handleMinMaxRangeChange("z", "min", Number.parseFloat(e.target.value))}
                            className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input
                            type="number"
                            value={zRange[1]}
                            onChange={(e) => handleMinMaxRangeChange("z", "max", Number.parseFloat(e.target.value))}
                            className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
              )}

              <Button onClick={generatePlot} className="w-full" disabled={!validateFunction(functionInput)}>
                Générer le graphique
              </Button>

              <div className="flex justify-between mt-4">
                <Button variant="outline" size="icon" onClick={() => setShowPanel(!showPanel)}>
                  <History className="h-4 w-4" />
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex justify-end space-x-2 mb-2">
              <Button variant="outline" size="sm">
                <ZoomIn className="h-4 w-4 mr-1" /> Zoom +
              </Button>
              <Button variant="outline" size="sm">
                <ZoomOut className="h-4 w-4 mr-1" /> Zoom -
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" /> Réinitialiser
              </Button>
            </div>

            <div className="w-full h-[500px] border rounded-md">
              {plotData.length > 0 && (
                  <PlotlyComponent
                      data={plotData}
                      layout={plotLayout}
                      config={{ responsive: true, displayModeBar: true }}
                      style={{ width: "100%", height: "100%" }}
                  />
              )}
            </div>
          </CardContent>
        </Card>

        {showPanel && (
            <div className="lg:col-span-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-2">Historique</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {history.map((func, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            onClick={() => handleFunctionChange(func)}
                            className="text-sm truncate"
                        >
                          {func}
                        </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
  )
}