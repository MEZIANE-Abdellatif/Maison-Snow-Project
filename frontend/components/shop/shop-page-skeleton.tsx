export function ShopPageSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="border-b border-border bg-cream-dark/50">
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="h-3 w-24 bg-border mx-auto rounded mb-4" />
          <div className="h-10 md:h-12 max-w-md bg-border mx-auto rounded mb-4" />
          <div className="h-4 max-w-lg bg-border mx-auto rounded" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-11 w-20 rounded-full bg-border" />
          ))}
        </div>
        <div className="h-11 w-full sm:w-56 bg-border rounded-md mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-border rounded-sm" />
              <div className="h-4 bg-border rounded mx-auto w-3/4" />
              <div className="h-3 bg-border rounded mx-auto w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
