import { NextRequest, NextResponse } from 'next/server'
// import { callClaude } from '@/lib/ai' // Your Anthropic API helper

export async function POST(req: NextRequest) {
  // Copilot‑shortcut: POST json helper using fetch with timeout & graceful error
  const { docId, section, userText } = await req.json()
  // TODO: Call Claude via your /api/claude or direct SDK
  // const nudgeText = await callClaude({ mode: 'SocraticNudge', section, excerpt: userText })
  return NextResponse.json({ nudgeText: "What is your main reason for choosing this approach?" })
}