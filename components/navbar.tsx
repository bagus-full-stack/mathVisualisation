"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Home, LineChart, Share2, BookOpen, Menu, X, Award, CuboidIcon as Cube, Upload } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const routes = [
    { href: "/", label: "Accueil", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/analyse", label: "Analyse", icon: <LineChart className="h-4 w-4 mr-2" /> },
    { href: "/fonctions-avancees", label: "Avancé", icon: <Award className="h-4 w-4 mr-2" /> },
    { href: "/dimensions", label: "N-Dimensions", icon: <Cube className="h-4 w-4 mr-2" /> },
    { href: "/objet-3d", label: "Objet 3D", icon: <Upload className="h-4 w-4 mr-2" /> },
    { href: "/partage", label: "Partage", icon: <Share2 className="h-4 w-4 mr-2" /> },
    { href: "/tutoriel", label: "Tutoriel", icon: <BookOpen className="h-4 w-4 mr-2" /> },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <LineChart className="h-6 w-6" />
            <span className="font-bold">MathViz</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-2">
            {routes.map((route) => (
              <Button key={route.href} variant={pathname === route.href ? "default" : "ghost" as "default" | "ghost"} asChild>
                <Link href={route.href}>
                  <>
                  {route.icon}
                  {route.label}
                  </>
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </>
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="grid grid-cols-1 gap-2 p-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "default" : "ghost" as "default" | "ghost"}
                className="justify-start"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={route.href}>
                  <>
                  {route.icon}
                  {route.label}
                  </>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

