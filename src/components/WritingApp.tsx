'use client'

import { useState } from 'react'

type DocumentType = 'essay' | 'story' | 'article' | 'product-launch' | 'general'
type DocumentSection = 'introduction' | 'body' | 'conclusion' | 'main' | 'outline'

export default function WritingApp() {
  const [responses, setResponses] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "What type of document would you like to create? (essay/story/article/product-launch)"
  )
  const [documentPreview, setDocumentPreview] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [documentType, setDocumentType] = useState<DocumentType>('general')
  const [currentSection, setCurrentSection] = useState<DocumentSection>('outline')

  const handleResponse = async (response: string) => {
    setError("")
    const newResponses = [...responses, response]
    setResponses(newResponses)

    // Determine document type from first response
    if (responses.length === 0) {
      const lowercaseResponse = response.toLowerCase()
      if (lowercaseResponse.includes('essay')) setDocumentType('essay')
      else if (lowercaseResponse.includes('story')) setDocumentType('story')
      else if (lowercaseResponse.includes('article')) setDocumentType('article')
      else if (lowercaseResponse.includes('product')) setDocumentType('product-launch')
      else setDocumentType('general')
    }

    // Update section based on progress
    if (responses.length === 1) {
      setCurrentSection('introduction')
    } else if (responses.length === 3) {
      setCurrentSection('body')
    } else if (responses.length === 5) {
      setCurrentSection('conclusion')
    }
    
    try {
      const result = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: newResponses,
          documentType: documentType,
          currentSection: currentSection
        })
      })
      
      if (!result.ok) {
        throw new Error('API request failed')
      }

      const data = await result.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setCurrentQuestion(data.question)
      setDocumentPreview(data.documentPreview || '')
    } catch (error) {
      console.error('Failed to generate next question:', error)
      setError(error.message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Document Details:</h2>
            <p>Type: {documentType}</p>
            <p>Current Section: {currentSection}</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Question Display */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Question:</h2>
            <p className="whitespace-pre-wrap">{currentQuestion}</p>
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
              }
            }} 
            className="space-y-4"
          >
            <textarea
              name="response"
              className="w-full p-4 border rounded-lg min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your response here..."
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Document Preview */}
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Document Preview:</h2>
          <div className="prose max-w-none">
            {documentPreview ? (
              <div className="whitespace-pre-wrap bg-white p-4 rounded-lg border">
                {documentPreview}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Your document preview will appear here as you write...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}