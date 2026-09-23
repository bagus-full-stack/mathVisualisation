"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { evaluate, derivative } from "mathjs"

interface StatisticsPanelProps {
  functionExpression: string
  xRange: [number, number]
}

export default function StatisticsPanel({ functionExpression, xRange }: StatisticsPanelProps) {
  const [stats, setStats] = useState<{
    min: { x: number; y: number } | null
    max: { x: number; y: number } | null
    average: number | null
    inflectionPoints: { x: number; y: number }[]
    domain: string
    range: string
    increasing: string[]
    decreasing: string[]
  }>({
    min: null,
    max: null,
    average: null,
    inflectionPoints: [],
    domain: "",
    range: "",
    increasing: [],
    decreasing: [],
  })
  const [error, setError] = useState("")

  const calculateStatistics = useCallback(() => {
    try {
      // Generate points
      const numPoints = 1000
      const xValues = Array.from(
        { length: numPoints },
        (_, i) => xRange[0] + (i / (numPoints - 1)) * (xRange[1] - xRange[0]),
      )

      // Only keep real, finite results - domain-restricted functions (sqrt, log...)
      // return a mathjs Complex outside their domain, which has no .toFixed and
      // would otherwise crash the average/min/max calculation below.
      const points = xValues
        .map((x) => {
          try {
            const y = evaluate(functionExpression, { x })
            return typeof y === "number" && Number.isFinite(y) ? { x, y } : null
          } catch {
            return null
          }
        })
        .filter((p): p is { x: number; y: number } => p !== null)

      if (points.length === 0) {
        throw new Error("Aucune valeur valide calculée")
      }

      const yValues = points.map((p) => p.y)

      // Find min and max
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      let minX = xRange[0]
      let maxX = xRange[0]

      points.forEach(({ x, y }) => {
        if (y < minY) {
          minY = y
          minX = x
        }
        if (y > maxY) {
          maxY = y
          maxX = x
        }
      })

      // Calculate average
      const average = yValues.reduce((sum, y) => sum + y, 0) / yValues.length

      // Find critical points and inflection points
      const derivativeExpr = derivative(functionExpression, "x").toString()
      const secondDerivativeExpr = derivative(derivativeExpr, "x").toString()

      const increasing: [number, number][] = []
      const decreasing: [number, number][] = []
      let currentInterval: [number, number] | null = null
      let currentType: "increasing" | "decreasing" | null = null

      // Find intervals of increase and decrease
      for (let i = 0; i < xValues.length - 1; i++) {
        const x1 = xValues[i]
        const x2 = xValues[i + 1]

        try {
          const d1 = evaluate(derivativeExpr, { x: x1 })
          const d2 = evaluate(derivativeExpr, { x: x2 })

          // If derivative changes sign, we've found a critical point
          if (d1 * d2 <= 0 && d1 !== 0 && d2 !== 0) {
            // End previous interval if we had one
            if (currentInterval && currentType) {
              currentInterval[1] = x1
              if (currentType === "increasing") {
                increasing.push([...currentInterval])
              } else {
                decreasing.push([...currentInterval])
              }
            }

            // Start new interval
            currentInterval = [x1, 0]
            currentType = d2 > 0 ? "increasing" : "decreasing"
          } else if (currentInterval === null) {
            // Start initial interval
            currentInterval = [x1, 0]
            currentType = d1 > 0 ? "increasing" : "decreasing"
          }
        } catch {
          // Skip if we can't evaluate derivative
        }
      }

      // Close final interval
      if (currentInterval && currentType) {
        currentInterval[1] = xValues[xValues.length - 1]
        if (currentType === "increasing") {
          increasing.push([...currentInterval])
        } else {
          decreasing.push([...currentInterval])
        }
      }

      // Find inflection points (where second derivative is zero)
      const inflectionPoints: { x: number; y: number }[] = []
      for (let i = 0; i < xValues.length - 1; i++) {
        const x1 = xValues[i]
        const x2 = xValues[i + 1]

        try {
          const sd1 = evaluate(secondDerivativeExpr, { x: x1 })
          const sd2 = evaluate(secondDerivativeExpr, { x: x2 })

          // If second derivative changes sign, we've found an inflection point
          if (sd1 * sd2 <= 0 && sd1 !== 0 && sd2 !== 0) {
            // Approximate the inflection point as the midpoint
            const xInflection = (x1 + x2) / 2
            const yInflection = evaluate(functionExpression, { x: xInflection })
            inflectionPoints.push({ x: xInflection, y: yInflection })
          }
        } catch {
          // Skip if we can't evaluate second derivative
        }
      }

      // Format intervals for display
      const formatIntervals = (intervals: [number, number][]) => {
        return intervals.map(([start, end]) => `[${start.toFixed(2)}, ${end.toFixed(2)}]`)
      }

      setStats({
        min: { x: minX, y: minY },
        max: { x: maxX, y: maxY },
        average,
        inflectionPoints,
        domain: `[${xRange[0]}, ${xRange[1]}]`,
        range: `[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`,
        increasing: formatIntervals(increasing),
        decreasing: formatIntervals(decreasing),
      })

      setError("")
    } catch (_e) {
      setError("Erreur lors du calcul des statistiques")
      console.error(_e)
    }
  }, [functionExpression, xRange])

  useEffect(() => {
    if (!functionExpression) return
    calculateStatistics()
  }, [functionExpression, xRange, calculateStatistics])



  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse statistique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="font-medium">Fonction</Label>
            <div className="p-2 bg-muted rounded-md mt-1">f(x) = {functionExpression}</div>
          </div>

          <div>
            <Label className="font-medium">Domaine étudié</Label>
            <div className="p-2 bg-muted rounded-md mt-1">{stats.domain}</div>
          </div>

          <div>
            <Label className="font-medium">Minimum</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.min ? `(${stats.min.x.toFixed(2)}, ${stats.min.y.toFixed(4)})` : "Non trouvé"}
            </div>
          </div>

          <div>
            <Label className="font-medium">Maximum</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.max ? `(${stats.max.x.toFixed(2)}, ${stats.max.y.toFixed(4)})` : "Non trouvé"}
            </div>
          </div>

          <div>
            <Label className="font-medium">Image</Label>
            <div className="p-2 bg-muted rounded-md mt-1">{stats.range}</div>
          </div>

          <div>
            <Label className="font-medium">Moyenne de f(x)</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.average ? stats.average.toFixed(4) : "Non calculé"}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label className="font-medium">Intervalles de croissance</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.increasing.length > 0 ? stats.increasing.join(", ") : "Non calculés"}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label className="font-medium">Intervalles de décroissance</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.decreasing.length > 0 ? stats.decreasing.join(", ") : "Non calculés"}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label className="font-medium">Points d&apos;inflexion</Label>
            <div className="p-2 bg-muted rounded-md mt-1">
              {stats.inflectionPoints.length > 0
                ? stats.inflectionPoints.map((p) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`).join(", ")
                : "Non trouvés"}
            </div>
          </div>
        </div>
        <>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </>
      </CardContent>
    </Card>
  )
}

