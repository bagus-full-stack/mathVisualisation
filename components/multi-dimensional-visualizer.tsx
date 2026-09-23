"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { evaluate, parse } from "mathjs"
import { PlusCircle, MinusCircle, RefreshCw, Download } from "lucide-react"
import PlotlyComponent from "@/components/plotly-component"

// Types of visualizations for higher dimensions
type VisualizationMethod = "slice" | "color" | "animation" | "parallel" | "projection"

interface Dimension {
  name: string
  min: number
  max: number
  value: number
  steps: number
}

export default function MultiDimensionalVisualizer() {
  // Function expression and error state
  const [functionExpression, setFunctionExpression] = useState("x^2 + y^2 + z^2 + w^2")
  const [error, setError] = useState("")

  // Dimensions configuration
  const [dimensions, setDimensions] = useState<Dimension[]>([
    { name: "x", min: -5, max: 5, value: 0, steps: 20 },
    { name: "y", min: -5, max: 5, value: 0, steps: 20 },
    { name: "z", min: -5, max: 5, value: 0, steps: 20 },
    { name: "w", min: -5, max: 5, value: 0, steps: 20 },
  ])

  // Visualization settings
  const [visibleDimensions, setVisibleDimensions] = useState<string[]>(["x", "y", "z"])
  const [visualizationMethod, setVisualizationMethod] = useState<VisualizationMethod>("slice")
  const [animationSpeed, setAnimationSpeed] = useState(500) // ms
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null)

  // Plot data
  const [plotData, setPlotData] = useState<Record<string, unknown>[]>([])
  const [plotLayout, setPlotLayout] = useState<Record<string, unknown>>({})

  // Add a new dimension
  const addDimension = () => {
    // Generate next dimension name (after x, y, z, w, use v, u, t, s, etc.)
    const dimensionNames = "xyzwvutspqrmnolkjihgfedcba"
    const usedNames = dimensions.map((d) => d.name)
    let nextName = ""

    for (let i = 0; i < dimensionNames.length; i++) {
      const name = dimensionNames[i]
      if (!usedNames.includes(name)) {
        nextName = name
        break
      }
    }

    if (!nextName) {
      nextName = `dim${dimensions.length + 1}`
    }

    setDimensions([...dimensions, { name: nextName, min: -5, max: 5, value: 0, steps: 20 }])
  }

  // Remove the last dimension
  const removeDimension = () => {
    if (dimensions.length <= 3) {
      setError("Une fonction doit avoir au moins 3 dimensions")
      return
    }

    const newDimensions = [...dimensions]
    newDimensions.pop()
    setDimensions(newDimensions)

    // Update visible dimensions if needed
    if (visibleDimensions.includes(dimensions[dimensions.length - 1].name)) {
      const newVisible = [...visibleDimensions]
      newVisible.pop()
      setVisibleDimensions(newVisible)
    }
  }

  // Update dimension value (for sliders)
  const updateDimensionValue = (index: number, value: number) => {
    const newDimensions = [...dimensions]
    newDimensions[index].value = value
    setDimensions(newDimensions)
  }

  // Update dimension range
  const updateDimensionRange = (index: number, min: number, max: number) => {
    const newDimensions = [...dimensions]
    newDimensions[index].min = min
    newDimensions[index].max = max
    setDimensions(newDimensions)
  }

  // Update dimension steps
  const updateDimensionSteps = (index: number, steps: number) => {
    const newDimensions = [...dimensions]
    newDimensions[index].steps = steps
    setDimensions(newDimensions)
  }

  // Toggle animation
  const toggleAnimation = () => {
    if (isAnimating) {
      // Stop animation
      if (animationInterval) {
        clearInterval(animationInterval)
        setAnimationInterval(null)
      }
      setIsAnimating(false)
    } else {
      // Start animation
      const animatedDimension = dimensions.find((d) => !visibleDimensions.includes(d.name))

      if (!animatedDimension) {
        setError("Aucune dimension disponible pour l'animation")
        return
      }

      let frame = 0
      const interval = setInterval(() => {
        frame = (frame + 1) % animatedDimension.steps

        // Update the dimension value based on the frame
        const dimIndex = dimensions.findIndex((d) => d.name === animatedDimension.name)
        const newValue =
          animatedDimension.min +
          (frame / (animatedDimension.steps - 1)) * (animatedDimension.max - animatedDimension.min)

        updateDimensionValue(dimIndex, newValue)
      }, animationSpeed)

      setAnimationInterval(interval)
      setIsAnimating(true)
    }
  }

  // Generate plot data based on the selected visualization method
  const generatePlotMemoized = useCallback(() => {
    try {
      // Validate function
      parse(functionExpression)

      // Determine which dimensions are visible and which are fixed
      const fixedDimensions = dimensions.filter((d) => !visibleDimensions.includes(d.name))

      if (visibleDimensions.length < 2 || visibleDimensions.length > 3) {
        setError("Vous devez sélectionner 2 ou 3 dimensions visibles")
        return
      }

      // Create variable values for plotting
      const dimValues: Record<string, number[]> = {}

      // Generate values for visible dimensions
      visibleDimensions.forEach((name) => {
        const dim = dimensions.find((d) => d.name === name)
        if (dim) {
          dimValues[name] = Array.from(
            { length: dim.steps },
            (_, i) => dim.min + (i / (dim.steps - 1)) * (dim.max - dim.min),
          )
        }
      })

      // Create fixed values for non-visible dimensions
      const fixedValues: Record<string, number> = {}
      fixedDimensions.forEach((dim) => {
        fixedValues[dim.name] = dim.value
      })

      // Generate plot data based on visible dimensions
      if (visibleDimensions.length === 2) {
        // 2D plot
        const xName = visibleDimensions[0]
        const yName = visibleDimensions[1]

        const xValues = dimValues[xName]
        const yValues = dimValues[yName]

        const zValues: number[][] = []

        for (let i = 0; i < yValues.length; i++) {
          const row: number[] = []
          for (let j = 0; j < xValues.length; j++) {
            const variables: Record<string, number> = { ...fixedValues }
            variables[xName] = xValues[j]
            variables[yName] = yValues[i]

            try {
              row.push(evaluate(functionExpression, variables))
            } catch {
              row.push(Number.NaN)
            }
          }
          zValues.push(row)
        }

        setPlotData([
          {
            x: xValues,
            y: yValues,
            z: zValues,
            type: "heatmap",
            colorscale: "Viridis",
          },
        ])

        setPlotLayout({
          title: `f(${dimensions.map((d) => d.name).join(", ")})`,
          xaxis: { title: xName },
          yaxis: { title: yName },
          autosize: true,
          height: 600,
          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
        })
      } else if (visibleDimensions.length === 3) {
        // 3D plot
        const xName = visibleDimensions[0]
        const yName = visibleDimensions[1]
        const zName = visibleDimensions[2]

        const xValues = dimValues[xName]
        const yValues = dimValues[yName]
        const zValues = dimValues[zName]

        // For 3D visualization, we have several options:

        if (visualizationMethod === "slice") {
          // 3D surface plot (slice through higher dimensions)
          const surfaceZ: number[][] = []

          for (let i = 0; i < yValues.length; i++) {
            const row: number[] = []
            for (let j = 0; j < xValues.length; j++) {
              const variables: Record<string, number> = { ...fixedValues }
              variables[xName] = xValues[j]
              variables[yName] = yValues[i]
              variables[zName] = zValues[Math.floor(zValues.length / 2)] // Middle slice

              try {
                row.push(evaluate(functionExpression, variables))
              } catch {
                row.push(Number.NaN)
              }
            }
            surfaceZ.push(row)
          }

          setPlotData([
            {
              type: "surface",
              x: xValues,
              y: yValues,
              z: surfaceZ,
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
        } else if (visualizationMethod === "color") {
          // 3D scatter plot with color as 4th dimension
          const points: { x: number; y: number; z: number; value: number }[] = []

          // Reduce the number of points for performance
          const stride = 3

          for (let i = 0; i < xValues.length; i += stride) {
            for (let j = 0; j < yValues.length; j += stride) {
              for (let k = 0; k < zValues.length; k += stride) {
                const variables: Record<string, number> = { ...fixedValues }
                variables[xName] = xValues[i]
                variables[yName] = yValues[j]
                variables[zName] = zValues[k]

                try {
                  const value = evaluate(functionExpression, variables)
                  points.push({ x: xValues[i], y: yValues[j], z: zValues[k], value })
                } catch {
                  // Skip invalid points
                }
              }
            }
          }

          setPlotData([
            {
              type: "scatter3d",
              mode: "markers",
              x: points.map((p) => p.x),
              y: points.map((p) => p.y),
              z: points.map((p) => p.z),
              marker: {
                size: 3,
                color: points.map((p) => p.value),
                colorscale: "Viridis",
                colorbar: { title: "Valeur" },
              },
            },
          ])
        } else if (visualizationMethod === "projection") {
          // Isosurfaces (level sets)
          // For simplicity, we'll use a 3D scatter plot with size representing the function value
          const points: { x: number; y: number; z: number; value: number }[] = []

          // Reduce the number of points for performance
          const stride = 3

          for (let i = 0; i < xValues.length; i += stride) {
            for (let j = 0; j < yValues.length; j += stride) {
              for (let k = 0; k < zValues.length; k += stride) {
                const variables: Record<string, number> = { ...fixedValues }
                variables[xName] = xValues[i]
                variables[yName] = yValues[j]
                variables[zName] = zValues[k]

                try {
                  const value = evaluate(functionExpression, variables)
                  // Only show points near a specific isosurface value
                  const isoValue = 0
                  const threshold = 0.5
                  if (Math.abs(value - isoValue) < threshold) {
                    points.push({ x: xValues[i], y: yValues[j], z: zValues[k], value })
                  }
                } catch {
                  // Skip invalid points
                }
              }
            }
          }

          setPlotData([
            {
              type: "scatter3d",
              mode: "markers",
              x: points.map((p) => p.x),
              y: points.map((p) => p.y),
              z: points.map((p) => p.z),
              marker: {
                size: 4,
                color: points.map((p) => p.value),
                colorscale: "Viridis",
                colorbar: { title: "Valeur" },
              },
            },
          ])
        }

        setPlotLayout({
          title: `f(${dimensions.map((d) => d.name).join(", ")})`,
          autosize: true,
          height: 600,
          scene: {
            xaxis: { title: xName },
            yaxis: { title: yName },
            zaxis: { title: zName },
            camera: {
              eye: { x: 1.5, y: 1.5, z: 1 },
            },
            aspectratio: { x: 1, y: 1, z: 1 },
          },
          margin: { l: 0, r: 0, b: 0, t: 50, pad: 4 },
        })
      }

      setError("")
    } catch (_e) {
      setError(`Erreur: ${_e instanceof Error ? _e.message : "Fonction invalide"}`)
      console.error(_e)
    }
  }, [dimensions, visibleDimensions, visualizationMethod, functionExpression])

  // Update plot when dimensions or visualization method changes
  useEffect(() => {
    generatePlotMemoized()

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval)
      }
    }
  }, [generatePlotMemoized, animationInterval])

  // Handle dimension selection change
  const handleVisibleDimensionsChange = (selected: string[]) => {
    if (selected.length < 2 || selected.length > 3) {
      setError("Vous devez sélectionner 2 ou 3 dimensions visibles")
      return
    }

    setVisibleDimensions(selected)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualisation multi-dimensionnelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="function">Fonction à {dimensions.length} variables</Label>
                <div className="flex mt-1">
                  <Input
                    id="function"
                    value={functionExpression}
                    onChange={(e) => setFunctionExpression(e.target.value)}
                    placeholder={`ex: ${dimensions.map((d) => d.name).join("^2 + ")}^2`}
                    className={error ? "border-red-500" : ""}
                  />
                  <Button variant="outline" className="ml-2" onClick={generatePlotMemoized}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Dimensions ({dimensions.length})</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={addDimension}>
                    <PlusCircle className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeDimension} disabled={dimensions.length <= 3}>
                    <MinusCircle className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {dimensions.map((dim, index) => (
                  <div key={dim.name} className="space-y-2 p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{dim.name}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`visible-${dim.name}`}
                          checked={visibleDimensions.includes(dim.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleVisibleDimensionsChange([...visibleDimensions, dim.name])
                            } else {
                              handleVisibleDimensionsChange(visibleDimensions.filter((d) => d !== dim.name))
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`visible-${dim.name}`} className="text-xs">
                          Visible
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Min</Label>
                        <Input
                          type="number"
                          value={dim.min}
                          onChange={(e) => updateDimensionRange(index, Number(e.target.value), dim.max)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input
                          type="number"
                          value={dim.max}
                          onChange={(e) => updateDimensionRange(index, dim.min, Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Points</Label>
                        <Input
                          type="number"
                          value={dim.steps}
                          onChange={(e) => updateDimensionSteps(index, Number(e.target.value))}
                          className="mt-1"
                          min={5}
                          max={50}
                        />
                      </div>
                    </div>

                    {!visibleDimensions.includes(dim.name) && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-xs">Valeur: {dim.value.toFixed(2)}</Label>
                        </div>
                        <Slider
                          min={dim.min}
                          max={dim.max}
                          step={(dim.max - dim.min) / 100}
                          value={[dim.value]}
                          onValueChange={(value) => updateDimensionValue(index, value[0])}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Méthode de visualisation</Label>
                <Select
                  value={visualizationMethod}
                  onValueChange={(value) => setVisualizationMethod(value as VisualizationMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slice">Tranches (Slices)</SelectItem>
                    <SelectItem value="color">Couleur comme dimension</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="projection">Projection (Isosurfaces)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {visualizationMethod === "animation" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Vitesse d&apos;animation</Label>
                    <span>{animationSpeed} ms</span>
                  </div>
                  <Slider
                    min={100}
                    max={2000}
                    step={100}
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                  />
                  <Button
                    onClick={toggleAnimation}
                    variant={isAnimating ? "destructive" : "default" as "destructive" | "default"}
                    className="w-full mt-2"
                  >
                    {isAnimating ? "Arrêter l'animation" : "Démarrer l'animation"}
                  </Button>
                </div>
              )}

              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Guide de visualisation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Pour visualiser des fonctions à plus de 3 dimensions:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Sélectionnez 2 ou 3 dimensions comme &quot;Visible&quot;</li>
                  <li>Utilisez les curseurs pour définir les valeurs des autres dimensions</li>
                  <li>Essayez différentes méthodes de visualisation</li>
                  <li>Pour l&apos;animation, une dimension non visible sera animée</li>
                </ul>
              </div>

              <div className="mt-4">
                {/*<Button*/}
                {/*  variant="outline"*/}
                {/*  className="w-full"*/}
                {/*  onClick={() => {*/}
                {/*    // Export current visualization as PNG*/}
                {/*    const plotElement = document.querySelector(".js-plotly-plot") as HTMLElement*/}
                {/*    if (plotElement) {*/}
                {/*      // @ts-expect-error - Plotly is attached to the element*/}
                {/*      const plotlyInstance = plotElement._fullLayout._glplot*/}
                {/*      if (plotlyInstance) {*/}
                {/*        // @ts-expect-error - toImage is a Plotly method*/}
                {/*        Plotly.toImage(plotElement, { format: "png", width: 800, height: 600 }).then((dataUrl) => {*/}
                {/*          const link = document.createElement("a")*/}
                {/*          link.href = dataUrl*/}
                {/*          link.download = `multidim-${new Date().toISOString().slice(0, 10)}.png`*/}
                {/*          link.click()*/}
                {/*        })*/}
                {/*      }*/}
                {/*    }*/}
                {/*  }}*/}
                {/*>*/}
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const plotElement = document.querySelector(".js-plotly-plot") as HTMLElement;
                      if (plotElement) {
                        import("plotly.js")
                            .then((Plotly) => Plotly.toImage(plotElement, { format: "png", width: 800, height: 600 }))
                            .then((dataUrl) => {
                              const link = document.createElement("a");
                              link.href = dataUrl;
                              link.download = `multidim-${new Date().toISOString().slice(0, 10)}.png`;
                              link.click();
                            })
                            .catch((error) => {
                              console.error("Erreur lors de l'exportation du graphique :", error);
                            });
                      }
                    }}
                >


                  <Download className="h-4 w-4 mr-2" /> Exporter l&apos;image
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="w-full h-[600px]">
            <PlotlyComponent
              data={plotData}
              layout={plotLayout}
              config={{ responsive: true, displayModeBar: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

