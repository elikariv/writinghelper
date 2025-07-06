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

    // Check if the user has submitted responses
    const responsesCount = Array.isArray(body.responses) ? body.responses.length : 0
    const requiredResponses = 5

    if (responsesCount < requiredResponses) {
      const remainingResponses = requiredResponses - responsesCount
      return NextResponse.json(
        { error: `Please submit ${remainingResponses} more messages to generate your document preview.` },
        { status: 400 }
      )
    }

    const documentType = body.documentType || 'general'
    const currentSection = body.currentSection || 'main'

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    // Call to generate document preview
    const previewCompletion = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are helping to structure and improve a ${documentType}. Based on the user's responses so far, create a document preview that:

1. Clearly separates sections with headings (e.g., Introduction, Body Paragraph 1, Body Paragraph 2, Conclusion).
2. Formats the document to display each section on its own line, with blank lines between sections.
3. Improves the user's content while maintaining their core ideas.
4. Indicates missing sections with placeholders like [Section Name - Not yet written].

For example:
Introduction:
Millennials, the generation born between 1981 and 1996, have been observed to be less religious than previous generations. This shift in religious engagement has led to a growing sense of loneliness among many millennials.

Body Paragraph 1:
[Body Paragraph 1 - Not yet written]

Body Paragraph 2:
[Body Paragraph 2 - Not yet written]

Conclusion:
[Conclusion - Not yet written]

Make sure to only add 1-2 sentences per iteration. We want the user to do most of the work in writing the essay, we just want to help guide the user along by turning their thoughts into structured sentences. 

Do not add AI commentary or meta-descriptions.`,
      messages: [{
         role: "user",
         content: `Current Section: ${currentSection}
User's Writing So Far:
${body.responses.join('\n')}

Please generate a structured preview of the document, improving existing content while marking missing sections.`
      }]
    })

    let previewContent = ''

    if (
      previewCompletion.content &&
      previewCompletion.content[0] &&
      typeof previewCompletion.content[0] === 'object' &&
      'text' in previewCompletion.content[0]
    ) {
      previewContent = (previewCompletion.content[0] as { text: string }).text
    }

    return NextResponse.json({
      documentPreview: previewContent,
      ...(body.responses && { documentType, currentSection }) // Include only if responses exist
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