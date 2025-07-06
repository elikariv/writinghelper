import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const documentType = body.documentType || 'general'
    const currentSection = body.currentSection || 'main'
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    // Generate feedback and next question
    const feedbackCompletion = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: `You are a supportive writing coach helping a user improve their writing. The user will share a piece of writing they're working on, and you should:

📝 **What you should do**:
- 🎉 Acknowledge their effort: Start by recognizing what they've accomplished so far.
- 💡 Provide 1 actionable tip based on their writing:
   - 🔤 Strengthen word choice or sentence structure.
   - 🌊 Improve flow and transitions.
   - ✨ Enhance clarity or conciseness.
   - 🌱 Develop ideas more fully.
   - 📜 Address organization or structure.

❓ **Reflection Question**:
Ask one engaging follow-up question to help them think deeper about their ideas or continue writing. Keep it focused and inspiring!

🔑 **Guidelines**:
- Be encouraging and constructive, never harsh.
- Make your tips concrete and actionable.
- Match your tone to the type of writing (formal for academic, casual for personal, etc.).
- Keep everything concise (3 sentences max).`,
      messages: [{
        role: "user",
        content: `Context:
Document Type: ${documentType}
Current Section: ${currentSection}
Previous Writing:
${body.responses.join('\n')}

Please provide feedback and ask a question to help them continue.`
      }]
    })

    // Extract the question safely
    let feedbackContent = ''

    if (
      feedbackCompletion.content &&
      feedbackCompletion.content[0] &&
      typeof feedbackCompletion.content[0] === 'object' &&
      'text' in feedbackCompletion.content[0]
    ) {
      feedbackContent = (feedbackCompletion.content[0] as { text: string }).text
    }

    return NextResponse.json({
      question: feedbackContent,
      documentType: documentType,
      currentSection: currentSection
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      })
      return NextResponse.json(
        { error: `Server error: ${error.message}` },
        { status: 500 }
      )
    } else {
      console.error('Unknown error:', error)
      return NextResponse.json(
        { error: `Server error: ${JSON.stringify(error)}` },
        { status: 500 }
      )
    }
  }
}