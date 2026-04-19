import { useState, useEffect, useCallback } from 'react'

/* Generic data-fetching hook with loading + error + refetch */
export function useApi(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}

/* Shared spinner component — inline so no extra file needed */
export function Spinner({ c }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: `${c?.accent || '#568F7C'} transparent transparent transparent` }} />
    </div>
  )
}

/* Shared error component */
export function ApiError({ message, onRetry, c }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="text-2xl">⚠️</div>
      <div className="text-sm font-medium" style={{ color: c?.danger || '#E05A3A' }}>
        {message || 'Could not load data'}
      </div>
      <div className="text-xs" style={{ color: c?.textDim || '#568F7C' }}>
        Make sure the backend server is running on port 3001
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{ background: `${c?.accent || '#568F7C'}20`, color: c?.accent || '#568F7C',
            border: `1px solid ${c?.borderStrong || 'rgba(86,143,124,0.4)'}` }}>
          Retry
        </button>
      )}
    </div>
  )
}
