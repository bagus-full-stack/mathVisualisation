export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}
