'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Loader2, RefreshCw, Users, Zap, MessageCircle, Eye, Heart } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import parseLLMJson from '@/utils/jsonParser'

interface TrendingTopic {
  rank: number
  topic: string
  post_count: number
  trend_direction: string
  trend_percentage: number
}

interface TopPost {
  title: string
  author: string
  author_title: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  sentiment: string
  published_date: string
  url: string
}

interface KeyInfluencer {
  rank: number
  name: string
  title: string
  post_count: number
  avg_engagement: number
  profile_url: string
}

interface LinkedInInsights {
  result: {
    trending_topics: TrendingTopic[]
    top_posts: TopPost[]
    key_influencers: KeyInfluencer[]
    sentiment_analysis: {
      positive: number
      neutral: number
      negative: number
    }
    engagement_metrics: {
      avg_likes: number
      avg_comments: number
      avg_shares: number
      total_posts_analyzed: number
    }
    content_themes: Array<{
      theme: string
      percentage: number
      post_count: number
    }>
  }
  status: string
  confidence: number
  metadata: {
    processing_time: string
    sources_used: string[]
    timestamp: string
    posts_analyzed: number
    search_query_used: string
  }
}

function App() {
  const [insights, setInsights] = useState<LinkedInInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('last_7_days')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchInsights = async () => {
    setError('')
    setLoading(true)

    try {
      const message = `Search LinkedIn for Agentic AI content and analyze it. Return insights in this exact JSON format:
      {
        "result": {
          "trending_topics": [{"rank": 1, "topic": "#Topic", "post_count": 100, "trend_direction": "↑", "trend_percentage": 12.5}],
          "top_posts": [{"title": "Post Title", "author": "Name", "author_title": "Title", "engagement": {"likes": 100, "comments": 10, "shares": 5, "views": 1000}, "sentiment": "positive", "published_date": "2024-01-15", "url": "https://linkedin.com/..."}],
          "key_influencers": [{"rank": 1, "name": "Name", "title": "Title", "post_count": 10, "avg_engagement": 500, "profile_url": "https://linkedin.com/..."}],
          "sentiment_analysis": {"positive": 65, "neutral": 25, "negative": 10},
          "engagement_metrics": {"avg_likes": 450, "avg_comments": 35, "avg_shares": 18, "total_posts_analyzed": 150},
          "content_themes": [{"theme": "Technical", "percentage": 35, "post_count": 52}]
        },
        "status": "success",
        "confidence": 0.92,
        "metadata": {"processing_time": "3.2s", "sources_used": ["LinkedIn web search"], "timestamp": "${new Date().toISOString()}", "posts_analyzed": 150, "search_query_used": "Agentic AI LinkedIn"}
      }`

      const response = await callAIAgent(message, '6924cf95eb6b7de42273efcb', {
        user_id: 'linkedin-insights-tracker',
        session_id: `session-${Date.now()}`,
      })

      if (response.success && response.response) {
        const parsed = parseLLMJson(response.response, { attemptFix: true })

        if (parsed && parsed.result) {
          setInsights(parsed as LinkedInInsights)
          setLastUpdated(new Date().toLocaleString())
        } else {
          setError('Failed to parse insights from agent response. Please try again.')
        }
      } else {
        setError(response.error || 'Failed to fetch insights. Please try again.')
      }
    } catch (err) {
      setError('Error fetching insights. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetchInsights()
  }, [])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-50 border-green-200'
      case 'negative':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agentic AI Insights Tracker</h1>
              <p className="text-slate-600 text-sm mt-1">LinkedIn Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange} disabled={loading}>
                <SelectTrigger className="w-40 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={fetchInsights}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Fetch Latest Insights
                  </>
                )}
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-3">Last updated: {lastUpdated}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && !insights && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Searching LinkedIn for Agentic AI insights...</p>
            </div>
          </div>
        )}

        {insights && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-slate-600 text-sm font-medium">Posts Analyzed</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {insights.result.engagement_metrics.total_posts_analyzed}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-slate-600 text-sm font-medium">Avg Engagement</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {Math.round(insights.result.engagement_metrics.avg_likes)}
                    </p>
                    <p className="text-xs text-slate-500">likes per post</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-slate-600 text-sm font-medium">Sentiment</p>
                    <p className="text-3xl font-bold text-green-600">
                      {insights.result.sentiment_analysis.positive}%
                    </p>
                    <p className="text-xs text-slate-500">positive</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-slate-600 text-sm font-medium">Confidence</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(insights.confidence * 100)}%
                    </p>
                    <p className="text-xs text-slate-500">analysis quality</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trending Topics */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.result.trending_topics.slice(0, 5).map((topic) => (
                    <div key={topic.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-slate-400 w-8 text-center">{topic.rank}</span>
                          <div>
                            <p className="font-semibold text-slate-900">{topic.topic}</p>
                            <p className="text-xs text-slate-600">{topic.post_count} posts</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {topic.trend_direction} {topic.trend_percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Themes */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Content Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.result.content_themes.map((theme, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900">{theme.theme}</span>
                        <span className="text-sm font-semibold text-blue-600">{theme.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${theme.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{theme.post_count} posts</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-slate-600 mb-2">Positive</p>
                    <p className="text-3xl font-bold text-green-600">{insights.result.sentiment_analysis.positive}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-slate-600 mb-2">Neutral</p>
                    <p className="text-3xl font-bold text-gray-600">{insights.result.sentiment_analysis.neutral}%</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-slate-600 mb-2">Negative</p>
                    <p className="text-3xl font-bold text-red-600">{insights.result.sentiment_analysis.negative}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Influencers */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5 text-orange-600" />
                  Key Influencers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.result.key_influencers.slice(0, 5).map((influencer) => (
                    <div key={influencer.rank} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                              #{influencer.rank}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{influencer.name}</p>
                              <p className="text-xs text-slate-600">{influencer.title}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="text-xs">
                          <p className="text-slate-600 mb-1">Posts</p>
                          <p className="font-semibold text-slate-900">{influencer.post_count}</p>
                        </div>
                        <div className="text-xs">
                          <p className="text-slate-600 mb-1">Avg Engagement</p>
                          <p className="font-semibold text-slate-900">{influencer.avg_engagement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  Top Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.result.top_posts.slice(0, 5).map((post, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${getSentimentColor(post.sentiment)}`}>
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 flex-1 line-clamp-2">{post.title}</h3>
                          <Badge className={`ml-2 ${getSentimentBadgeColor(post.sentiment)} capitalize`}>
                            {post.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{post.author}</p>
                        <p className="text-xs text-slate-600 mb-3">{post.author_title} • {post.published_date}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-inherit">
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
                            <Heart className="h-3 w-3" /> Likes
                          </p>
                          <p className="font-semibold text-slate-900 text-sm">{post.engagement.likes}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
                            <MessageCircle className="h-3 w-3" /> Comments
                          </p>
                          <p className="font-semibold text-slate-900 text-sm">{post.engagement.comments}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1">Shares</p>
                          <p className="font-semibold text-slate-900 text-sm">{post.engagement.shares}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1 flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3" /> Views
                          </p>
                          <p className="font-semibold text-slate-900 text-sm">{post.engagement.views}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm">Analysis Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Processing Time</p>
                    <p className="font-semibold text-slate-900">{insights.metadata.processing_time}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Timestamp</p>
                    <p className="font-semibold text-slate-900 text-xs">{new Date(insights.metadata.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Posts Analyzed</p>
                    <p className="font-semibold text-slate-900">{insights.metadata.posts_analyzed}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Sources</p>
                    <p className="font-semibold text-slate-900 text-xs">{insights.metadata.sources_used.join(', ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
