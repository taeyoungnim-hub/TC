export function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Summary skeleton */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="skeleton h-16 w-full rounded-xl mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </div>

      {/* Review card skeletons */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="skeleton w-5 h-5 rounded" />
              <div className="skeleton h-4 w-20 rounded-full" />
              <div className="skeleton h-3 w-28" />
            </div>
            <div className="skeleton w-16 h-7 rounded-lg" />
          </div>
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-3 w-2/3" />
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
