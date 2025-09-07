export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`skeleton-vintage ${className}`} />
    );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card ${className}`}>
      <div className="h-48 w-full bg-white/10 backdrop-blur-md rounded-2xl mb-4 animate-pulse" />
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-white/10 backdrop-blur-md rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-white/10 backdrop-blur-md rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-white/10 backdrop-blur-md rounded-full animate-pulse" />
          <div className="h-4 w-20 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-white/10 backdrop-blur-md rounded-full animate-pulse" />
          <div className="h-4 w-16 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        </div>
      </div>
      <div className="h-10 w-full bg-white/10 backdrop-blur-md rounded-2xl mt-4 animate-pulse" />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="relative">
        <div className="bg-gradient-secondary p-4">
          <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="absolute top-2 right-2">
          <div className="h-4 w-4 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-4 w-32 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-24 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-20 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-28 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-4 w-16 bg-white/10 backdrop-blur-md rounded animate-pulse" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="card-vintage overflow-hidden">
            {/* Header */}
            <div className="bg-vintage-sage p-4">
                <div className="skeleton-vintage h-6 w-32 bg-white/20" />
            </div>
            
            {/* Rows */}
            <div className="p-4 space-y-3">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <div className="skeleton-vintage h-4 w-32" />
                        <div className="skeleton-vintage h-4 w-24" />
                        <div className="skeleton-vintage h-4 w-20" />
                        <div className="skeleton-vintage h-4 w-28" />
                        <div className="skeleton-vintage h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="card-vintage space-y-6">
            {/* Title */}
            <div className="skeleton-vintage h-8 w-1/3" />
            
            {/* Form fields */}
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="skeleton-vintage h-4 w-24" />
                        <div className="skeleton-vintage h-12 w-full rounded-lg" />
                    </div>
                ))}
            </div>
            
            {/* Button */}
            <div className="skeleton-vintage h-12 w-32 rounded-lg" />
        </div>
    );
}

export function ProfileSkeleton() {
  return (
    <div className="glass-card space-y-6">
      <div className="text-center">
        <div className="h-8 w-1/3 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-6 animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-24 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        <div className="h-12 w-full bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" />
      </div>
      <div className="flex space-x-4">
        <div className="h-12 w-32 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" />
        <div className="h-12 w-32 bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="skeleton-vintage h-12 w-1/3 mx-auto mb-4" />
                <div className="skeleton-vintage h-6 w-1/2 mx-auto" />
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="stats-card">
                        <div className="text-center">
                            <div className="skeleton-vintage h-12 w-20 mx-auto mb-2 bg-vintage-cream" />
                            <div className="skeleton-vintage h-4 w-24 mx-auto bg-vintage-cream" />
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Main content */}
            <div className="card-vintage">
                <div className="skeleton-vintage h-8 w-1/4 mb-6" />
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-vintage h-20 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DashboardCardSkeleton() {
  return (
    <div className="glass-card">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-6 w-32 bg-white/10 backdrop-blur-md rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/10 backdrop-blur-md rounded animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-white/10 backdrop-blur-md rounded-full animate-pulse" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-16 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-2 animate-pulse" />
        <div className="h-4 w-20 bg-white/10 backdrop-blur-md rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 w-full bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export function HomepageSkeleton() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <div className="h-12 w-1/3 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-4 animate-pulse" />
        <div className="h-6 w-1/2 bg-white/10 backdrop-blur-md rounded mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="glass-card">
      <div className="h-8 w-1/4 bg-white/10 backdrop-blur-md rounded-2xl mb-6 animate-pulse" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-white/10 backdrop-blur-md rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
