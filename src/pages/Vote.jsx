import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Minimal, dark, modern voting page with backend integration
// Polls for active polls every 2 seconds, detects closed polls

const API_BASE_URL = 'http://localhost:3000/api'

export default function VotePage() {
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pollClosed, setPollClosed] = useState(false)
  const [closedPollId, setClosedPollId] = useState(null)

  // Fetch active poll
  async function fetchActivePoll() {
    try {
      const response = await fetch(`${API_BASE_URL}/polls`)
      const data = await response.json()

      if (data.success && data.polls && data.polls.length > 0) {
        // Get the most recent active poll
        const activePoll = data.polls.find(p => p.status === 'active')

        if (activePoll) {
          // Fetch full poll details to get options
          try {
            const pollResponse = await fetch(`${API_BASE_URL}/polls/${activePoll.id}`)
            const pollData = await pollResponse.json()
            if (pollData.success && pollData.poll) {
              setPoll(pollData.poll)
              setPollClosed(false)
            } else {
              setPoll(null)
              setPollClosed(false)
            }
          } catch (err) {
            console.error('Failed to fetch poll details:', err)
            setPoll(null)
            setPollClosed(false)
          }
        } else {
          // No active poll, check if there's a closed one
          const closedPoll = data.polls.find(p => p.status === 'closed')
          if (closedPoll) {
            setPollClosed(true)
            setClosedPollId(closedPoll.id)
            setPoll(null)
          } else {
            setPoll(null)
            setPollClosed(false)
          }
        }
      } else {
        // No polls at all
        setPoll(null)
        setPollClosed(false)
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch polls:', err)
      setPoll(null)
      setPollClosed(false)
      setLoading(false)
    }
  }

  // Poll for active polls every 2 seconds
  useEffect(() => {
    // Fetch immediately on mount
    fetchActivePoll()

    // Set up interval to check every 2 seconds
    const interval = setInterval(() => {
      fetchActivePoll()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>
          <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show "no polls" state
  if (!poll && !pollClosed) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>
          <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2 text-neutral-100">Questions will be live soon.</h2>
              <p className="text-neutral-500 text-sm">Check back in a few moments for a new poll.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show voting interface
  if (poll && poll.options && poll.options.length > 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Title */}
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>

          {/* Card */}
          <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
            <VotingCard poll={poll} pollId={poll.id} />
          </div>
        </div>
      </div>
    )
  }

  // Show results button when poll is closed
  if (pollClosed && closedPollId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>

          <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 mb-4">
                <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-neutral-100">Voting Complete</h2>
              <p className="text-neutral-500 text-sm mb-6">The current poll has ended.</p>
              <button
                onClick={() => navigate(`/results?pollId=${closedPollId}`)}
                className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>
        <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
          <div className="text-center py-12">
            <p className="text-neutral-500">Unable to load poll. Please refresh the page.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function VotingCard({ poll, pollId }) {
  const [selected, setSelected] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Safety check - this should never happen with our parent guard, but just in case
  if (!poll) {
    return <div className="text-center py-8 text-neutral-400">Poll data unavailable</div>
  }

  if (!Array.isArray(poll.options) || poll.options.length === 0) {
    return <div className="text-center py-8 text-neutral-400">No options available</div>
  }

  async function submitVote() {
    if (selected === null) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          optionIndex: selected
        })
      })

      const data = await response.json()

      if (data.success) {
        setHasVoted(true)
      } else {
        setError(data.message || 'Failed to submit vote')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
      console.error('Error submitting vote:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-snug">
        {poll.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {poll.options.map((opt, i) => {
          const active = selected === i
          return (
            <button
              key={i}
              onClick={() => !hasVoted && setSelected(i)}
              disabled={submitting}
              className={`w-full text-left px-5 py-4 rounded-lg border transition-colors
                ${active ? 'border-neutral-100 bg-neutral-900' : 'border-neutral-800 bg-neutral-950'}
                ${hasVoted ? 'cursor-default' : 'hover:border-neutral-600'}
                ${submitting ? 'opacity-50' : ''}`}
            >
              <span className="text-base md:text-lg font-medium">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-3 rounded-lg bg-red-900 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Action */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={submitVote}
          disabled={selected === null || hasVoted || submitting}
          className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold disabled:opacity-40 hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></span>
              Voting...
            </>
          ) : (
            'Vote'
          )}
        </button>

        {hasVoted && (
          <span className="text-sm text-neutral-400">Vote submitted</span>
        )}
      </div>
    </div>
  )
}