"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, Download } from "lucide-react"
import {Input} from "@/components/ui/input";
import { evaluate } from "mathjs"
import PlotlyComponent from "@/components/plotly-component"
import { exportPlotlyImage } from "@/lib/plotly-utils"

export default function PartagePage() {
  const [graphTitle, setGraphTitle] = useState("")
  const [graphDescription, setGraphDescription] = useState("")
  const [functionExpression, setFunctionExpression] = useState("sin(x)")
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const xValues = Array.from({ length: 200 }, (_, i) => -10 + (i / 199) * 20)
  const plotData = [
    {
      x: xValues,
      y: xValues.map((x) => {
        try {
          return evaluate(functionExpression, { x })
        } catch {
          return null
        }
      }),
      type: "scatter",
      mode: "lines",
      line: { color: "rgb(75, 192, 192)", width: 2 },
    },
  ]
  const plotLayout = {
    title: graphTitle || `f(x) = ${functionExpression}`,
    autosize: true,
    height: 300,
    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
  }

  const generateShareLink = async () => {
    try {
      setError("")
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: graphTitle, description: graphDescription, functionExpression }),
      })
      if (!res.ok) throw new Error("request failed")
      const { id } = await res.json()
      setShareLink(`${window.location.origin}/partage/${id}`)
    } catch {
      setError("Erreur lors de la génération du lien de partage")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Partager votre Graphique</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du graphique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du graphique</Label>
                <Input
                  id="title"
                  value={graphTitle}
                  onChange={(e) => setGraphTitle(e.target.value)}
                  placeholder="ex: Analyse de la fonction sinus"
                />
              </div>

              <div>
                <Label htmlFor="function">Fonction à partager</Label>
                <Input
                  id="function"
                  value={functionExpression}
                  onChange={(e) => setFunctionExpression(e.target.value)}
                  placeholder="ex: sin(x)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={graphDescription}
                  onChange={(e) => setGraphDescription(e.target.value)}
                  placeholder="Décrivez votre graphique et son utilité..."
                  rows={4}
                />
              </div>

              <Button onClick={generateShareLink} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Générer un lien de partage
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options de partage</CardTitle>
          </CardHeader>
          <CardContent>
            <>
            {shareLink ? (
              <div className="space-y-4">
                <div>
                  <Label>Lien de partage</Label>
                  <div className="flex mt-1">
                    <Input value={shareLink} readOnly />
                    <Button variant="outline" className="ml-2" onClick={copyToClipboard}>
                      {copied ? "Copié!" : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Aperçu du graphique</Label>
                  <div className="w-full h-[300px] border rounded-md mt-1">
                    <PlotlyComponent
                      data={plotData}
                      layout={plotLayout}
                      config={{ responsive: true, displayModeBar: false }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => exportPlotlyImage(".js-plotly-plot", { format: "png", filename: graphTitle || "graphique" })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportPlotlyImage(".js-plotly-plot", { format: "svg", filename: graphTitle || "graphique" })}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    SVG
                  </Button>
                </div>

                <div className="mt-4">
                  <Label>Code d&apos;intégration</Label>
                  <Textarea
                    readOnly
                    value={`<iframe src="${shareLink}" width="600" height="400" frameborder="0"></iframe>`}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                Générez un lien de partage pour voir les options disponibles
              </div>
            )}
            </>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

