import { useState } from 'react'

interface NudgeProps { section: string; userText: string }

export default function SocraticNudge({ section, userText }: NudgeProps) {
  const [question, setQuestion] = useState<string>()

  async function fetchNudge() {
    const res = await fetch('/api/nudge', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, userText }) 
    })
    const { nudgeText } = await res.json()
    setQuestion(nudgeText)
  }

  return (
    <button
      onClick={fetchNudge}
      className="chip chip-outline px-3 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-sm"
      type="button"
    >
      {question ?? '🤔 Why this?'}
    </button>
  )
}