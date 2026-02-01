import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const API_BASE_URL = 'http://localhost:3000/api'

export default function ResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pollId = searchParams.get('pollId')

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pollClosed, setPollClosed] = useState(false)
  const [newPollAvailable, setNewPollAvailable] = useState(false)

  // Fetch poll results
  async function fetchResults() {
    if (!pollId) {
      setError('No poll ID provided')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
        setPollClosed(data.status === 'closed')
        setError('')
      } else {
        setError(data.message || 'Failed to fetch results')
      }
      setLoading(false)
    } catch (err) {
      setError('Network error: ' + err.message)
      console.error('Error fetching results:', err)
      setLoading(false)
    }
  }

  // Check if a new poll is available
  async function checkForNewPoll() {
    try {
      const response = await fetch(`${API_BASE_URL}/polls`)
      const data = await response.json()

      if (data.success && data.polls && data.polls.length > 0) {
        // Check if there's a different active poll
        const activePoll = data.polls.find(p => p.status === 'active')
        if (activePoll && activePoll.id !== pollId) {
          setNewPollAvailable(true)
        } else {
          setNewPollAvailable(false)
        }
      }
    } catch (err) {
      console.error('Error checking for new polls:', err)
    }
  }

  // Initial fetch and set up auto-refresh
  useEffect(() => {
    fetchResults()
    checkForNewPoll()

    // Set up interval to refresh results every 5 seconds
    const interval = setInterval(() => {
      fetchResults()
      checkForNewPoll()
    }, 5000)

    return () => clearInterval(interval)
  }, [pollId])

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

  // Show error state
  if (error || !results) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>
          <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error || 'Unable to load results'}</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors"
              >
                Return to Vote
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const options = results.results.map(r => r.option)
  const values = results.results.map(r => parseInt(r.votes))
  const maxVotes = Math.max(...values, 1)

  const chartData = {
    labels: options.map((_, i) => `${i + 1}`),
    datasets: [
      {
        data: values,
        backgroundColor: '#e5e7eb', // neutral-200
        borderRadius: 6,
        barThickness: 22
      }
    ]
  }

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0a0a0a',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return 'Votes: ' + context.parsed.x
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        max: Math.ceil(maxVotes * 1.1)
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#a3a3a3',
          font: { size: 14, weight: '500' }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <h1 className="text-2xl md:text-2xl font-bold tracking-wide text-center w-full mb-10 text-neutral-300">
          InvisionX
        </h1>

        {/* New Poll Available Banner */}
        {newPollAvailable && (
          <div className="mb-6 border border-green-900 bg-neutral-900 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-300">
                  A new poll is live! Vote now.
                </span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1 text-xs font-medium bg-green-900 text-green-300 hover:bg-green-800 rounded transition-colors"
              >
                Go Vote
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="border border-neutral-800 rounded-xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {results.question}
                </h2>
                <p className="text-sm text-neutral-500">
                  Total votes: <span className="text-neutral-400 font-medium">{results.totalVotes}</span>
                </p>
              </div>
              <div>
                {pollClosed ? (
                  <span className="px-3 py-1 bg-red-900 text-red-300 text-xs font-semibold rounded-full">
                    CLOSED
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-900 text-green-300 text-xs font-semibold rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}


          {/* Results Table */}
          <div className="mb-8 border-t border-neutral-800 pt-6 space-y-3">
            {results.results.map((result, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 text-neutral-600 font-medium">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-neutral-300">{result.option}</span>
                    <span className="text-sm text-neutral-500">
                      {result.votes} <span className="text-neutral-600">({result.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-300 rounded-full transition-all duration-300"
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Action */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-semibold hover:bg-neutral-200 transition-colors"
              >
                Back to Voting
              </button>
              {!pollClosed && (
                <button
                  onClick={fetchResults}
                  className="px-6 py-3 rounded-lg border border-neutral-700 text-neutral-300 font-semibold hover:border-neutral-600 hover:text-neutral-200 transition-colors"
                >
                  Refresh Now
                </button>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs text-neutral-600 mb-1">
                {pollClosed ? 'Voting ended' : 'Updates every 5s'}
              </p>
              <p className="text-xs text-neutral-500">
                Poll ID: {pollId.slice(0, 12)}...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}