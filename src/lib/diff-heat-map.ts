import { diff_match_patch, DIFF_INSERT, DIFF_DELETE, DIFF_EQUAL } from 'diff-match-patch'

export interface DiffSpan { start: number; end: number; origin: 'user' | 'ai' }

// Copilot‑shortcut: build diff spans using diff‑match‑patch semantic cleanup
export function buildDiffSpans(prev: string, next: string): DiffSpan[] {
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(prev, next)
  dmp.diff_cleanupSemantic(diffs)

  const spans: DiffSpan[] = []
  let cursor = 0
  for (const [type, text] of diffs) {
    const length = text.length
    const origin = type === DIFF_INSERT ? 'ai' : type === DIFF_DELETE ? 'user' : 'user'
    spans.push({ start: cursor, end: cursor + length, origin })
    cursor += length
  }
  return spans
}