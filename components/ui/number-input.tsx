"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"

type Props = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number
  onValueChange: (n: number) => void
}

// Keeps the raw text locally so "-", "-0." or "" can be typed; only finite numbers reach the parent.
export function NumberInput({ value, onValueChange, ...props }: Props) {
  const [text, setText] = React.useState(String(value))

  React.useEffect(() => {
    setText((t) => (Number.parseFloat(t) === value ? t : String(value)))
  }, [value])

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const t = e.target.value.replace(",", ".")
        if (!/^-?\d*\.?\d*$/.test(t)) return
        setText(t)
        const n = Number.parseFloat(t)
        if (Number.isFinite(n)) onValueChange(n)
      }}
      onBlur={(e) => {
        setText(String(value))
        props.onBlur?.(e)
      }}
    />
  )
}
