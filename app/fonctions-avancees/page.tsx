"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Each tab is only needed once selected; splitting avoids loading all
// four (each with their own Plotly usage) on the initial page load.
const loading = () => (
  <div className="flex items-center justify-center h-40">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
)
const StatisticsPanel = dynamic(() => import("@/components/statistics-panel"), { loading })
const FunctionComparison = dynamic(() => import("@/components/function-comparison"), { loading })
const TangentVisualizer = dynamic(() => import("@/components/tangent-visualizer"), { loading })
const DataTableView = dynamic(() => import("@/components/data-table-view"), { loading })

export default function FonctionsAvanceesPage() {
  const [functionInput, setFunctionInput] = useState("sin(x)")
  const [xRange, setXRange] = useState<[number, number]>([-10, 10])

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Fonctionnalités avancées</h1>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Fonction de base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="function">Fonction à analyser</Label>
                <Input
                  id="function"
                  value={functionInput}
                  onChange={(e) => setFunctionInput(e.target.value)}
                  placeholder="ex: sin(x)"
                  className="mt-1"
                />
              </div>
              <div className="flex flex-row gap-4">
                <div>
                  <Label htmlFor="xmin">Plage X min</Label>
                  <Input
                    id="xmin"
                    type="number"
                    value={xRange[0]}
                    onChange={(e) => setXRange([Number(e.target.value), xRange[1]])}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="xmax">Plage X max</Label>
                  <Input
                    id="xmax"
                    type="number"
                    value={xRange[1]}
                    onChange={(e) => setXRange([xRange[0], Number(e.target.value)])}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          <TabsTrigger value="compare">Comparaison</TabsTrigger>
          <TabsTrigger value="tangent">Tangentes</TabsTrigger>
          <TabsTrigger value="data">Tableau de valeurs</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics">
          <StatisticsPanel functionExpression={functionInput} xRange={xRange} />
        </TabsContent>

        <TabsContent value="compare">
          <FunctionComparison />
        </TabsContent>

        <TabsContent value="tangent">
          <TangentVisualizer functionExpression={functionInput} />
        </TabsContent>

        <TabsContent value="data">
          <DataTableView functionExpression={functionInput} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

