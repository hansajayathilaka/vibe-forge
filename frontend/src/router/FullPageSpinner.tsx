export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  )
}
