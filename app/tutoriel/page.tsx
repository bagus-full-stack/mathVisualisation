import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TutorielPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Tutoriel</h1>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="basics">Bases</TabsTrigger>
          <TabsTrigger value="functions">Fonctions</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
              <CardHeader>
                <CardTitle>Débuter avec l&apos;application</CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Navigation dans l&apos;interface</h3>
                <p className="text-muted-foreground mt-1">
                  L&apos;application est divisée en plusieurs sections accessibles depuis le menu principal :
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Visualisation 2D et 3D</li>
                  <li>Analyse de fonctions</li>
                  <li>Partage et collaboration</li>
                  <li>Tutoriels et aide</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Saisie d&apos;une fonction</h3>
                <p className="text-muted-foreground mt-1">
                  Pour saisir une fonction, utilisez la syntaxe mathématique standard :
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>
                    Utilisez <code>x</code> comme variable en 2D
                  </li>
                  <li>
                    Utilisez <code>x</code> et <code>y</code> comme variables en 3D
                  </li>
                  <li>
                    Les opérations supportées : <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>,{" "}
                    <code>^</code> (puissance)
                  </li>
                  <li>
                    Fonctions supportées : <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>exp</code>,{" "}
                    <code>log</code>, <code>sqrt</code>, etc.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Exemples de fonctions simples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Fonction linéaire</p>
                      <code>2*x + 1</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Fonction quadratique</p>
                      <code>x^2 - 2*x + 1</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Fonction trigonométrique</p>
                      <code>sin(x) + cos(2*x)</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Fonction exponentielle</p>
                      <code>exp(-x^2)</code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions">
          <Card>
            <CardHeader>
              <CardTitle>Fonctions avancées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Fonctions mathématiques supportées</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Trigonométriques</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>sin(x), cos(x), tan(x)</li>
                        <li>asin(x), acos(x), atan(x)</li>
                        <li>sinh(x), cosh(x), tanh(x)</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Exponentielles et logarithmes</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>exp(x), log(x), log10(x)</li>
                        <li>pow(x, y), sqrt(x)</li>
                        <li>abs(x), sign(x)</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Spéciales</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>floor(x), ceil(x), round(x)</li>
                        <li>max(x, y), min(x, y)</li>
                        <li>random(), factorial(n)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Exemples de fonctions 3D</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Paraboloïde</p>
                      <code>x^2 + y^2</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Selle de cheval</p>
                      <code>x^2 - y^2</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Sinus 3D</p>
                      <code>sin(sqrt(x^2 + y^2))</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Fonction complexe</p>
                      <code>sin(x) * cos(y)</code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de fonctions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Outils d&apos;analyse disponibles</h3>
                <p className="text-muted-foreground mt-1">
                  L&apos;application propose plusieurs outils pour analyser les fonctions mathématiques :
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Calcul de dérivées (première, seconde, etc.)</li>
                  <li>Calcul d&apos;intégrales (définies et indéfinies)</li>
                  <li>Identification des points critiques (extrema, points d&apos;inflexion)</li>
                  <li>Simplification d&apos;expressions mathématiques</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Exemple d&apos;analyse</h3>
                <p className="text-muted-foreground mt-1">
                  Pour la fonction <code>f(x) = x^3 - 3*x^2 + 2*x</code> :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Dérivée première</p>
                      <code>f&apos;(x) = 3*x^2 - 6*x + 2</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Dérivée seconde</p>
                      <code>f&apos;&apos;(x) = 6*x - 6</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Points critiques</p>
                      <code>x ≈ 0.38 et x ≈ 1.62</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="font-medium">Intégrale de 0 à 1</p>
                      <code>∫₀¹ f(x) dx = 0</code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités avancées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Animation et paramètres</h3>
                <p className="text-muted-foreground mt-1">
                  Vous pouvez créer des animations en faisant varier un paramètre dans le temps :
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>
                    Utilisez <code>t</code> comme paramètre de temps
                  </li>
                  <li>
                    Exemple : <code>sin(x + t)</code> pour une onde se déplaçant
                  </li>
                  <li>Réglez la vitesse d&apos;animation selon vos besoins</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Personnalisation avancée</h3>
                <p className="text-muted-foreground mt-1">Personnalisez l&apos;apparence de vos graphiques :</p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Couleurs et styles de courbes</li>
                  <li>Échelles (linéaire, logarithmique)</li>
                  <li>Grilles et axes</li>
                  <li>Annotations et étiquettes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Collaboration et partage</h3>
                <p className="text-muted-foreground mt-1">Partagez vos visualisations avec d&apos;autres utilisateurs :</p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>Générez des liens de partage</li>
                  <li>Exportez en différents formats (PNG, SVG, PDF)</li>
                  <li>Intégrez dans des pages web ou documents</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

