"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, Download } from "lucide-react"
import {Input} from "@/components/ui/input";

export default function PartagePage() {
  const [graphTitle, setGraphTitle] = useState("")
  const [graphDescription, setGraphDescription] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)

  const generateShareLink = () => {
    // Dans une application réelle, cela générerait un lien unique
    // ou enregistrerait les données dans une base de données
    const mockLink = `https://math-viz.example.com/share/${Math.random().toString(36).substring(2, 10)}`
    setShareLink(mockLink)
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

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    SVG
                  </Button>
                </div>

                <div className="mt-4">
                  <Label>Code d&apos;intégration</Label>
                  <Textarea
                    readOnly
                    value={`<iframe src="${shareLink}/embed" width="600" height="400" frameborder="0"></iframe>`}
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

