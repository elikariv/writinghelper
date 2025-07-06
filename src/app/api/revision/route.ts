import { NextRequest, NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase' // Uncomment if you have a supabase client

export async function POST(req: NextRequest) {
  // Copilot‑shortcut: POST json helper using fetch with timeout & graceful error
  const { docId, content, source } = await req.json()
  // TODO: Insert into Supabase 'revisions' table, return new revisionId
  // const { data, error } = await supabase.from('revisions').insert([{ docId, content, source }]).select().single()
  // if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // return NextResponse.json({ revisionId: data.id }, { status: 201 })
  return NextResponse.json({ revisionId: 'mock-revision-id' }, { status: 201 })
}