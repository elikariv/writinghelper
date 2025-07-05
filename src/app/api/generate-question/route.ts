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

    // First call to get feedback and next question
    const feedbackCompletion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: `You are a supportive writing coach helping a user improve their writing. The user will share a piece of writing they're working on, and you should:

1. Acknowledge their effort - Start by recognizing what they've accomplished so far
2. Provide 1 actionable tips based on their writing, such as:
   - Strengthening word choice or sentence structure
   - Improving flow and transitions
   - Enhancing clarity or conciseness
   - Developing ideas more fully
   - Addressing organization or structure
3. Ask one engaging follow-up question that helps them continue writing or think deeper about their work

Guidelines:
- Be encouraging and constructive, never harsh or overly critical
- Focus on specific elements you notice rather than generic advice
- Make your tips concrete and actionable
- Ask questions that spark creativity or help them overcome potential blocks
- Keep your response concise (3 sentences max)
- Match your tone to the type of writing (formal for academic, casual for personal, etc.)`,
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

    // Second call to generate document preview
    const previewCompletion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: `You are helping to structure and improve a ${documentType}. Based on the user's responses so far, create a document preview that:

1. Shows completed sections with improved writing while maintaining the user's core ideas
2. Indicates missing sections with placeholders
3. Formats the document appropriately for its type

For example, for an essay:
- Introduction with thesis (if provided)
- [Body Paragraph 1 - Not yet written]
- [Body Paragraph 2 - Not yet written]
- [Conclusion - Not yet written]

For a story:
- Opening scene (if provided)
- [Character Development - Not yet written]
- [Rising Action - Not yet written]
- [Climax - Not yet written]

Keep any content the user has provided but improve its clarity and structure.
Mark missing sections clearly with [Section Name - Not yet written].`,
      messages: [{
        role: "user",
        content: `Document Type: ${documentType}
Current Section: ${currentSection}
User's Writing So Far:
${body.responses.join('\n')}

Please generate a structured preview of the document, improving existing content while marking missing sections.`
      }]
    })

    // Get the response content safely
    let feedbackContent = ''
    let previewContent = ''

    // Handle the response content
    if (feedbackCompletion.content[0] && 'text' in feedbackCompletion.content[0]) {
      feedbackContent = feedbackCompletion.content[0].text
    }

    if (previewCompletion.content[0] && 'text' in previewCompletion.content[0]) {
      previewContent = previewCompletion.content[0].text
    }

    return NextResponse.json({
      question: feedbackContent,
      documentPreview: previewContent,
      documentType: documentType,
      currentSection: currentSection
    })

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })

    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}