"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { evaluate } from "mathjs"
import {Download, RefreshCw} from "lucide-react"

interface DataTableViewProps {
  functionExpression: string
}

export default function DataTableView({ functionExpression }: DataTableViewProps) {
  const [startValue, setStartValue] = useState(-5)
  const [endValue, setEndValue] = useState(5)
  const [step, setStep] = useState(1)
  const [precision, setPrecision] = useState(4)
  const [tableData, setTableData] = useState<{ x: number; y: number }[]>([])
  const [error, setError] = useState("")

  // Generate table data
  const generateTableData = useCallback(() => {
    if (!functionExpression) {
      setError("Veuillez entrer une fonction valide")
      return
    }

    try {
      const data: { x: number; y: number }[] = []

      // Validate step to avoid infinite loops
      if (step <= 0) {
        setError("Le pas doit être supérieur à 0")
        return
      }

      // Limit number of points to prevent performance issues
      const numPoints = Math.floor((endValue - startValue) / step) + 1
      if (numPoints > 1000) {
        setError("Trop de points (max: 1000). Augmentez le pas ou réduisez la plage.")
        return
      }

        for (let x = startValue; x <= endValue; x += step) {
          try {
            const roundedX = Number(x.toFixed(precision))
            const y = evaluate(functionExpression, { x: roundedX })
            data.push({ x: roundedX, y: Number(y.toFixed(precision)) })
          } catch {
            // Skip values that cause evaluation errors
          }
        }

      setTableData(data)
      setError("")
    } catch (_e) {
      setError("Erreur lors du calcul. Vérifiez la fonction.")
      console.error(_e)
    }
  }, [functionExpression, startValue, endValue, step, precision])

  // Export table data as CSV
  const exportCSV = () => {
    if (tableData.length === 0) return

    const csvContent = ["x,y", ...tableData.map((row) => `${row.x},${row.y}`)].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `function_data_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate data on component mount and when function changes
  useEffect(() => {
    if (functionExpression) {
      generateTableData()
    }
  }, [functionExpression, generateTableData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tableau de valeurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-4">
            <div>
              <Label>Fonction</Label>
              <Input value={functionExpression} readOnly className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Début</Label>
                <Input
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Fin</Label>
                <Input
                  type="number"
                  value={endValue}
                  onChange={(e) => setEndValue(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Pas</Label>
                <Input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                  className="mt-1"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Précision décimale</Label>
              <Input
                type="number"
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                className="mt-1"
                min="0"
                max="10"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={generateTableData} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer
              </Button>
              <Button variant="outline" onClick={exportCSV} disabled={tableData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="h-[300px] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>x</TableHead>
                  <TableHead>f(x)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.x}</TableCell>
                      <TableCell>{row.y}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                      {error || "Aucune donnée à afficher"}
                    </TableCell>
                  </TableRow>
                )}
                </>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

