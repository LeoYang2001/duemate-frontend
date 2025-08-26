interface LoadingSkeletonProps {
  type?: 'dashboard' | 'table' | 'card';
  count?: number;
}

export function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        
        {/* Recent Activity Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-4">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Table Rows */}
        {[...Array(count)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg p-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface GlobalLoadingProps {
  message?: string;
}

export function GlobalLoading({ message = 'Loading...' }: GlobalLoadingProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-700 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}
