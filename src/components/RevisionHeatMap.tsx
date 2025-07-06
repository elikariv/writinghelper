import { useMemo } from 'react'
import { buildDiffSpans } from '@/lib/diff-heat-map'

interface Props { prev: string; next: string }

export default function RevisionHeatMap({ prev, next }: Props) {
  const spans = useMemo(() => buildDiffSpans(prev, next), [prev, next])
  return (
    <p className="whitespace-pre-wrap font-mono leading-6">
      {spans.map(({ start, end, origin }, i) => (
        <span
          key={i}
          className={`px-0.5 rounded transition-colors duration-200 ${
            origin === 'ai'
              ? 'bg-red-100 dark:bg-red-900/80'
              : 'bg-green-100 dark:bg-green-900/80'
          }`}
          data-origin={origin}
          title={origin === 'ai' ? 'AI suggestion' : 'Your edit'}
        >
          {next.slice(start, end)}
        </span>
      ))}
    </p>
  )
}