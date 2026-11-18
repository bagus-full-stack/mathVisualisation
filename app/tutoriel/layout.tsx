import type { Metadata } from "next"

export const metadata: Metadata = { title: "Tutoriel" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
