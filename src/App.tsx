import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Copy, Share2, Loader2, CheckCircle2 } from 'lucide-react'
import { callAIAgent } from '@/utils/aiAgent'
import parseLLMJson from '@/utils/jsonParser'

interface PoemResponse {
  result?: {
    poem: string
    style: string
    mood: string
    topic: string
    line_count: number
    confidence: number
  }
  confidence?: number
  metadata?: {
    processing_time: string
    style_compliance: string
    mood_captured: boolean
  }
  poem?: string
  style?: string
  mood?: string
  topic?: string
}

const STYLES = [
  { value: 'freeform', label: 'Freeform' },
  { value: 'haiku', label: 'Haiku' },
  { value: 'limerick', label: 'Limerick' },
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'free_verse', label: 'Free Verse' },
  { value: 'acrostic', label: 'Acrostic' },
]

const MOODS = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'funny', label: 'Funny' },
  { value: 'sad', label: 'Sad' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'peaceful', label: 'Peaceful' },
]

function App() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('freeform')
  const [mood, setMood] = useState('inspirational')
  const [poem, setPoem] = useState('')
  const [poemMetadata, setPoemMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGeneratePoem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      setError('Please enter a topic or prompt')
      return
    }

    setError('')
    setLoading(true)
    setPoem('')
    setPoemMetadata(null)

    try {
      const prompt = `Generate a ${style} poem with a ${mood} mood about: "${topic}"`

      const response = await callAIAgent(prompt, '68fa9bdca39d463331e020cd')

      const parsedResponse = parseLLMJson(response.response, {})

      if (parsedResponse.result?.poem) {
        setPoem(parsedResponse.result.poem)
        setPoemMetadata(parsedResponse)
      } else if (parsedResponse.poem) {
        setPoem(parsedResponse.poem)
        setPoemMetadata(parsedResponse)
      } else {
        setError('Failed to generate poem. Please try again.')
      }
    } catch (err) {
      setError('Error generating poem. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(poem)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy poem')
    }
  }

  const handleShare = async () => {
    if (!navigator.share) {
      handleCopy()
      return
    }

    try {
      await navigator.share({
        title: 'My Poem',
        text: poem,
      })
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl shadow-lg border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-light tracking-tight text-slate-900">
            Poem Generator
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2 font-light">
            Create beautiful poetry with AI
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form Section */}
          <form onSubmit={handleGeneratePoem} className="space-y-4">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Topic or Prompt</label>
              <Input
                type="text"
                placeholder="Enter a poem topic or prompt…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="border-slate-200 focus-visible:ring-slate-400 text-base"
              />
            </div>

            {/* Style & Mood Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Poetic Style</label>
                <Select value={style} onValueChange={setStyle} disabled={loading}>
                  <SelectTrigger className="border-slate-200 focus:ring-slate-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mood</label>
                <Select value={mood} onValueChange={setMood} disabled={loading}>
                  <SelectTrigger className="border-slate-200 focus:ring-slate-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-base font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Poem...
                </>
              ) : (
                'Create Poem'
              )}
            </Button>
          </form>

          {/* Poem Display Section */}
          {poem && (
            <>
              <Separator className="my-8" />

              <div className="space-y-4">
                {/* Poem Text */}
                <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
                  <p className="text-slate-900 text-lg leading-8 whitespace-pre-wrap font-light">
                    {poem}
                  </p>
                </div>

                {/* Metadata Display */}
                {poemMetadata && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-500 font-medium">Style</p>
                      <p className="text-sm text-slate-900 capitalize mt-1">
                        {poemMetadata.result?.style || poemMetadata.style || style}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-500 font-medium">Mood</p>
                      <p className="text-sm text-slate-900 capitalize mt-1">
                        {poemMetadata.result?.mood || poemMetadata.mood || mood}
                      </p>
                    </div>
                    {poemMetadata.metadata?.processing_time && (
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-500 font-medium">Processing Time</p>
                        <p className="text-sm text-slate-900 mt-1">
                          {poemMetadata.metadata.processing_time}
                        </p>
                      </div>
                    )}
                    {poemMetadata.result?.line_count && (
                      <div className="bg-slate-50 rounded p-3">
                        <p className="text-xs text-slate-500 font-medium">Lines</p>
                        <p className="text-sm text-slate-900 mt-1">
                          {poemMetadata.result.line_count}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-900 hover:bg-slate-50 h-10"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-900 hover:bg-slate-50 h-10"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App