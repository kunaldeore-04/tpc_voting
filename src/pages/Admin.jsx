import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Minimal, dark, modern admin page with backend integration
// Poll creation, management, and termination

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL

export default function AdminPage() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePoll, setActivePoll] = useState(null)
  const [createdPollId, setCreatedPollId] = useState(null)
  const [closingPoll, setClosingPoll] = useState(false)

  // Load active polls on mount
  useEffect(() => {
    fetchActivePoll()
  }, [])

  async function fetchActivePoll() {
    try {
      const response = await fetch(`${API_BASE_URL}/polls`)
      const data = await response.json()

      if (data.success && data.polls.length > 0) {
        // Get the most recent active poll
        const active = data.polls.find(p => p.status === 'active')
        if (active) {
          setActivePoll(active)
        }
      }
    } catch (err) {
      console.error('Failed to fetch polls:', err)
    }
  }

  function handleQuestionChange(e) {
    setQuestion(e.target.value)
    setError('')
  }

  function handleOptionChange(index, value) {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  function addOption() {
    setOptions([...options, ''])
  }

  function removeOption(index) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  async function submitQuestion() {
    // Validation
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    const filledOptions = options.filter(opt => opt.trim())
    if (filledOptions.length < 2) {
      setError('Please provide at least 2 options')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/polls/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question.trim(),
          options: filledOptions
        })
      })

      const data = await response.json()

      if (data.success) {
        setCreatedPollId(data.pollId)
        setActivePoll(data.poll)
        setSubmitted(true)

        // Reset form after success
        setTimeout(() => {
          setQuestion('')
          setOptions(['', ''])
          setSubmitted(false)
        }, 2500)
      } else {
        setError(data.message || 'Failed to create poll')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
      console.error('Error creating poll:', err)
    } finally {
      setLoading(false)
    }
  }

  async function closePoll() {
    if (!activePoll) return

    setClosingPoll(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${activePoll.id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setActivePoll(null)
        // Optionally navigate to results
        navigate(`/results?pollId=${activePoll.id}`)
      } else {
        setError(data.message || 'Failed to close poll')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
      console.error('Error closing poll:', err)
    } finally {
      setClosingPoll(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-10">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>
          <p className="text-sm text-neutral-500">Admin Panel</p>
        </div>

        {/* Active Poll Status */}
        {activePoll && (
          <div className="mb-8 border border-green-900 bg-neutral-900 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">Active Poll</h3>
                <p className="text-lg font-semibold text-neutral-100">{activePoll.question}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Total votes: <span className="text-neutral-400 font-medium">{activePoll.totalVotes}</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-green-900 text-green-300 text-xs font-semibold rounded-full">
                {activePoll.status.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/results?pollId=${activePoll.id}`)}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 font-medium hover:border-neutral-600 hover:text-neutral-200 transition-colors text-sm"
              >
                View Live Results
              </button>
              <button
                onClick={closePoll}
                disabled={closingPoll}
                className="flex-1 px-4 py-2 rounded-lg bg-red-900 text-red-200 font-medium hover:bg-red-800 disabled:opacity-50 transition-colors text-sm"
              >
                {closingPoll ? 'Closing...' : 'Close Poll'}
              </button>
            </div>
          </div>
        )}

        {/* Create Poll Card */}
        <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
          {!submitted ? (
            <form onSubmit={(e) => { e.preventDefault(); submitQuestion() }}>
              {/* Question Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-neutral-300 mb-3">
                  New Question
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder="Enter your question here"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 resize-none disabled:opacity-50"
                  rows="3"
                />
              </div>

              {/* Options Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-neutral-300">
                    Options
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    disabled={loading}
                    className="text-xs font-medium text-neutral-400 hover:text-neutral-300 border border-neutral-700 hover:border-neutral-600 px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-neutral-600 font-medium w-6 text-right">{i + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 disabled:opacity-50"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          disabled={loading}
                          className="px-3 py-2 text-neutral-500 hover:text-neutral-300 border border-neutral-800 hover:border-neutral-600 rounded transition-colors disabled:opacity-50"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-900 border border-red-800 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Poll'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-semibold hover:border-neutral-600 hover:text-neutral-200 disabled:opacity-50 transition-colors"
                >
                  View Voting
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800">
                  <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Poll Created</h3>
              <p className="text-neutral-400 mb-2">Your poll is now live and ready for voting.</p>
              <p className="text-xs text-neutral-500 mb-6">Poll ID: {createdPollId}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Create Another
                </button>
                <button
                  onClick={() => navigate(`/results?pollId=${createdPollId}`)}
                  className="px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-semibold hover:border-neutral-600 hover:text-neutral-200 transition-colors"
                >
                  View Results
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-xs text-neutral-600 mt-6 text-center">
          Backend connected • API: {API_BASE_URL}
        </p>
      </div>
    </div>
  )
}