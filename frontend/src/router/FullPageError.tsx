interface FullPageErrorProps {
  error: Error
}

export function FullPageError({ error }: FullPageErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow border border-red-200">
        <p className="text-lg font-semibold text-red-700 mb-2">Failed to load screens</p>
        <p className="text-sm text-gray-600 font-mono break-all">{error.message}</p>
      </div>
    </div>
  )
}
