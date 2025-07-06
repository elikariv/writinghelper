'use client'

import { useState } from 'react'

export default function WritingApp() {
  const [responses, setResponses] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "What would you like to write about? This can be an essay, a document, an email, or anything you like. Start with a few sentences and we can take it from there."
  )
  const [documentPreview, setDocumentPreview] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [wordCount, setWordCount] = useState<number>(0)

  const handleResponse = async (response: string) => {
    setError("") // Clear previous error messages

    // Check word count for the first response
    if (responses.length === 0 && wordCount < 10) {
      setError("Your response must be at least 10 words. Please try again.")
      return
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)

    try {
      // Generate a question to help the user expand their thinking
      const questionResult = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: newResponses,
        })
      })

      if (!questionResult.ok) {
        throw new Error('Failed to generate question')
      }

      const questionData = await questionResult.json()

      if (questionData.error) {
        throw new Error(questionData.error)
      }

      setCurrentQuestion(questionData.question)

      // Generate document preview only after 5 responses
      if (newResponses.length >= 5) {
        const previewResult = await fetch('/api/generate-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses: newResponses,
          })
        })

        const previewData = await previewResult.json()

        if (previewResult.ok && previewData.documentPreview) {
          setDocumentPreview(previewData.documentPreview)
        } else {
          // Show dynamic error message from the backend
          setError(previewData.error || 'Failed to generate document preview')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(String(error))
      }
    }
  }

  const handleWordCount = (text: string) => {
    const count = text.split(/\s+/).filter(Boolean).length
    setWordCount(count)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Question Display */}
            <div className="p-4 bg-blue-100 rounded-lg">
              <h2 className="font-bold mb-2 text-blue-800 text-lg">Question:</h2>
              <p className="whitespace-pre-wrap text-gray-800">{currentQuestion}</p>
            </div>

            {/* Response Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const response = formData.get('response') as string
                if (response.trim()) {
                  handleResponse(response.trim())
                  e.currentTarget.reset()
                  setWordCount(0) // Reset word count after submission
                }
              }}
              className="space-y-4"
            >
              <textarea
                name="response"
                className="w-full p-4 border rounded-lg min-h-[150px] focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Type your response here..."
                onChange={(e) => handleWordCount(e.target.value)}
              />
              <p className="text-sm text-gray-600">Minimum Word Requirement: {wordCount} / 10</p>
              <button
                type="submit"
                className={`w-full px-6 py-3 rounded-lg transition-colors font-bold text-lg ${
                  wordCount >= 10
                    ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={wordCount < 10}
              >
                Submit
              </button>
            </form>
          </div>

          {/* Document Preview */}
          <div className="space-y-4">
            <h2 className="font-bold mb-4 text-blue-800 text-lg">Here is what you have so far:</h2>
            <div className="border rounded-lg p-6 bg-gray-50">
              {documentPreview ? (
                <div className="whitespace-pre-wrap text-gray-800">{documentPreview}</div>
              ) : responses.length < 5 ? (
                <p className="text-gray-600 italic">
                  {error ? error : `Your document preview will appear after you submit ${5 - responses.length} more responses.`}
                </p>
              ) : (
                <p className="text-gray-600 italic">Error generating preview. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}