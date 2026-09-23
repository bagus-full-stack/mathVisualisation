/**
 * Utilitaires pour l'exportation d'images Plotly
 * Ces fonctions ne doivent être appelées que côté client
 */

export const exportPlotlyImage = async (
    elementSelector: string,
    options: {
        format?: "png" | "jpeg" | "webp" | "svg"
        width?: number
        height?: number
        filename?: string
    } = {},
) => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
        console.error("Cette fonction ne peut être appelée que côté client")
        return
    }

    try {
        // Importer Plotly dynamiquement
        const Plotly = await import("plotly.js")

        // Trouver l'élément Plotly
        const plotElement = document.querySelector(elementSelector) as HTMLElement
        if (!plotElement) {
            console.error("Élément Plotly non trouvé")
            return
        }

        // Options par défaut
        const {
            format = "png",
            width = 800,
            height = 600,
            filename = `plot-${new Date().toISOString().slice(0, 10)}`,
        } = options

        // Générer l'image
        const dataUrl = await Plotly.toImage(plotElement, { format, width, height })

        // Créer un lien de téléchargement
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `${filename}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error("Erreur lors de l'exportation de l'image Plotly:", error)
    }
}

