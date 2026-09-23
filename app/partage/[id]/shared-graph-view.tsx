"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { evaluate } from "mathjs"
import PlotlyComponent from "@/components/plotly-component"

interface SharedGraphViewProps {
  title: string
  description: string
  functionExpression: string
}

export default function SharedGraphView({ title, description, functionExpression }: SharedGraphViewProps) {
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
    title: title || `f(x) = ${functionExpression}`,
    autosize: true,
    height: 500,
    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{title || `f(x) = ${functionExpression}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {description && <p className="text-muted-foreground">{description}</p>}
          <div className="w-full h-[500px] border rounded-md">
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
