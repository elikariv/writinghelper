'use client'

import React, { useState } from 'react'

export default function WritingApp() {
  const [responses, setResponses] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(
    "What would you like to write about? This can be an essay, a document, an email, or anything you like. Start with a few sentences and we can take it from there."
  )
  const [documentPreview, setDocumentPreview] = useState("")
  const [error, setError] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false) // Loading state for question generation
  const [isLoadingPreview, setIsLoadingPreview] = useState(false) // Loading state for document preview

  const handleResponse = async (response) => {
    setError("") // Clear previous error messages
    setIsLoadingQuestion(true) // Start loading animation for question

    // Check word count for the first response
    if (responses.length === 0 && wordCount < 10) {
      setError("Your response must be at least 10 words. Please try again.")
      setIsLoadingQuestion(false) // Stop loading animation for question
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
        setIsLoadingPreview(true) // Start loading animation for preview
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
          setError(previewData.error || 'Error generating preview. Please try again.')
        }
        setIsLoadingPreview(false) // Stop loading animation for preview
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(String(error))
      }
    }

    setIsLoadingQuestion(false) // Stop loading animation for question
  }

  const handleWordCount = (text) => {
    const count = text.split(/\s+/).filter(Boolean).length
    setWordCount(count)
  }

  return React.createElement(
    "div",
    { className: "bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen p-6" },
    React.createElement(
      "div",
      { className: "max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8" },
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
        React.createElement(
          "div",
          { className: "space-y-6" },
          isLoadingQuestion &&
            React.createElement(
              "div",
              { className: "flex justify-center items-center" },
              React.createElement("div", { className: "loader" }) // Add CSS for spinner
            ),
          error &&
            React.createElement(
              "div",
              { className: "p-4 bg-red-100 text-red-700 rounded-lg" },
              React.createElement("strong", {}, "Error:"),
              ` ${error}`
            ),
          React.createElement(
            "div",
            { className: "p-4 bg-blue-100 rounded-lg" },
            React.createElement(
              "h2",
              { className: "font-bold mb-2 text-blue-800 text-lg" },
              "Question:"
            ),
            React.createElement(
              "p",
              { className: "whitespace-pre-wrap text-gray-800" },
              currentQuestion
            )
          ),
          React.createElement(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const response = formData.get('response')
                if (response.trim()) {
                  handleResponse(response.trim())
                  e.currentTarget.reset()
                  setWordCount(0) // Reset word count after submission
                }
              },
              className: "space-y-4",
            },
            React.createElement("textarea", {
              name: "response",
              className: "w-full p-4 border rounded-lg min-h-[150px] focus:ring-2 focus:ring-green-500 focus:border-green-500",
              placeholder: "Type your response here...",
              onChange: (e) => handleWordCount(e.target.value),
            }),
            React.createElement(
              "p",
              { className: "text-sm text-gray-600" },
              `Minimum Word Requirement: ${wordCount} / 10`
            ),
            React.createElement(
              "button",
              {
                type: "submit",
                className: `w-full px-6 py-3 rounded-lg transition-colors font-bold text-lg ${
                  wordCount >= 10
                    ? "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`,
                disabled: wordCount < 10,
              },
              "Submit"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "space-y-4" },
          React.createElement(
            "h2",
            { className: "font-bold mb-4 text-blue-800 text-lg" },
            "Here is what you have so far:"
          ),
          React.createElement(
            "div",
            { className: "border rounded-lg p-6 bg-gray-50" },
            isLoadingPreview
              ? React.createElement("div", { className: "loader" }) // Add CSS for preview spinner
              : documentPreview
              ? React.createElement(
                  "div",
                  { className: "whitespace-pre-wrap text-gray-800" },
                  documentPreview
                )
              : responses.length < 5
              ? React.createElement(
                  "p",
                  { className: "text-gray-600 italic" },
                  error
                    ? error
                    : `Your document preview will appear after you submit ${
                        5 - responses.length
                      } more responses.`
                )
              : React.createElement(
                  "p",
                  { className: "text-gray-600 italic" },
                  "Loading your document..."
                )
          )
        )
      )
    )
  )
}