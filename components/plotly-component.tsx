"use client"

import type React from "react"
import type { Layout } from "plotly.js"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Composant de chargement à afficher pendant que Plotly se charge
const LoadingPlot = () => (
    <div className="w-full h-full border rounded-md flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Chargement du graphique...</p>
        </div>
    </div>
)

// Importer Plotly dynamiquement avec SSR désactivé
const Plot = dynamic(() => import("react-plotly.js").then((mod) => mod.default), {
    ssr: false,
    loading: LoadingPlot,
})

// Types pour les props du composant
interface PlotlyComponentProps {
    data: Record<string, unknown>[]
    layout: Record<string, unknown>
    config?: Record<string, unknown>
    style?: React.CSSProperties
}

export default function PlotlyComponent({ data, layout, config, style }: PlotlyComponentProps) {
    // État pour vérifier si nous sommes côté client
    const [isMounted, setIsMounted] = useState(false)

    // Effet pour s'assurer que nous sommes côté client
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Ne rien rendre côté serveur
    if (!isMounted) {
        return <LoadingPlot />
    }

    // Rendre le composant Plotly côté client
    return (
        <Plot
            data={data}
            layout={layout as Partial<Layout>}
            config={config || { responsive: true, displayModeBar: true }}
            style={style || { width: "100%", height: "100%" }}
        />
    )
}

