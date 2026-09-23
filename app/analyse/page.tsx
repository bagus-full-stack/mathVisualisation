"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { derivative, simplify, evaluate } from "mathjs"

// mathjs has no symbolic `integrate`; approximate the definite integral numerically.
function trapezoidalIntegral(expr: string, variable: string, a: number, b: number, steps = 1000) {
  const h = (b - a) / steps
  let sum = (evaluate(expr, { [variable]: a }) + evaluate(expr, { [variable]: b })) / 2
  for (let i = 1; i < steps; i++) {
    sum += evaluate(expr, { [variable]: a + i * h })
  }
  return sum * h
}

// No symbolic solver either; find critical points by sampling the derivative
// and flagging sign changes (same approach as function-visualizer.tsx).
function findCriticalPoints(derivativeExpr: string, variable: string, a: number, b: number, steps = 500) {
  const points: number[] = []
  const h = (b - a) / steps
  let prevX = a
  let prevD = evaluate(derivativeExpr, { [variable]: prevX })

  for (let i = 1; i <= steps; i++) {
    const x = a + i * h
    const d = evaluate(derivativeExpr, { [variable]: x })

    if (
      typeof prevD === "number" && Number.isFinite(prevD) &&
      typeof d === "number" && Number.isFinite(d) &&
      prevD * d <= 0 && !(prevD === 0 && d === 0)
    ) {
      const point = Number(((prevX + x) / 2).toFixed(4))
      // Skip near-duplicates: a sign change straddling the grid can trip two
      // adjacent steps for the same root.
      if (points.length === 0 || Math.abs(point - points[points.length - 1]) > h * 1.5) {
        points.push(point)
      }
    }

    prevX = x
    prevD = d
  }

  return points
}

interface AnalysisResult {
  original: string
  simplified: string
  derivative: string
  simplifiedDerivative: string
  secondDerivative: string
  simplifiedSecondDerivative: string
  criticalPoints: string
  definiteIntegral: string
}

export default function AnalysePage() {
  const [functionInput, setFunctionInput] = useState("")
  const [variable, setVariable] = useState("x")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  const analyzeFunction = () => {
    try {
      setError("")

      const derivativeExpr = derivative(functionInput, variable).toString()
      const secondDerivativeExpr = derivative(derivativeExpr, variable).toString()

      const simplifiedFunction = simplify(functionInput).toString()
      const simplifiedDerivative = simplify(derivativeExpr).toString()
      const simplifiedSecondDerivative = simplify(secondDerivativeExpr).toString()

      const searchRange: [number, number] = [-10, 10]
      let criticalPoints: string
      try {
        const points = findCriticalPoints(derivativeExpr, variable, searchRange[0], searchRange[1])
        criticalPoints =
          points.length > 0
            ? points.map((x) => `${variable} ≈ ${x}`).join(", ")
            : `Aucun point critique trouvé sur [${searchRange[0]}, ${searchRange[1]}]`
      } catch {
        criticalPoints = "Impossible à calculer les points critiques"
      }

      let definiteIntegral = "Non calculé"
      try {
        definiteIntegral = trapezoidalIntegral(functionInput, variable, -1, 1).toFixed(6)
      } catch {
        definiteIntegral = "Impossible à calculer numériquement"
      }

      setAnalysisResult({
        original: functionInput,
        simplified: simplifiedFunction,
        derivative: derivativeExpr,
        simplifiedDerivative,
        secondDerivative: secondDerivativeExpr,
        simplifiedSecondDerivative,
        criticalPoints,
        definiteIntegral,
      })
    } catch (_e) {
      setError("Erreur: Fonction invalide ou impossible à analyser")
      console.error(_e)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Analyse de Fonctions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entrée de la fonction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="function">Fonction à analyser</Label>
                <Input id="function" value={functionInput} onChange={(e) => setFunctionInput(e.target.value)} placeholder="ex: x^2 - 2*x + 1" className={error ? "border-red-500" : ""} />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div>
                <Label htmlFor="variable">Variable</Label>
                <Input id="variable" value={variable} onChange={(e) => setVariable(e.target.value)} placeholder="x" />
              </div>

              <Button onClick={analyzeFunction} className="w-full">Analyser la fonction</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats de l&apos;analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <>
              {analysisResult ? (
                <div className="space-y-4">
                  <div>
                    <Label>Fonction originale</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.original}</div>
                  </div>

                  <div>
                    <Label>Fonction simplifiée</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.simplified}</div>
                  </div>

                  <div>
                    <Label>Dérivée première</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.simplifiedDerivative}</div>
                  </div>

                  <div>
                    <Label>Dérivée seconde</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.simplifiedSecondDerivative}</div>
                  </div>

                  <div>
                    <Label>Points critiques (sur [-10, 10])</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.criticalPoints}</div>
                  </div>

                  <div>
                    <Label>Intégrale définie (de -1 à 1)</Label>
                    <div className="p-2 bg-muted rounded-md mt-1">{analysisResult.definiteIntegral}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  Entrez une fonction et cliquez sur &quot;Analyser&quot; pour voir les résultats
                </div>
              )}
            </>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
