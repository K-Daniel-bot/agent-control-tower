import { NextRequest, NextResponse } from 'next/server'
import type { Paragraph, Participant } from '@/types/voice'

interface SummarizeRequest {
  title: string
  paragraphs: readonly Paragraph[]
  participants: readonly Participant[]
}

interface SummarizeResponse {
  summary: string
  topics: readonly string[]
  actionItems: readonly string[]
  sentiment: string
  duration: string
}

function extractTopics(text: string): readonly string[] {
  // Simple topic extraction: look for repeated keywords
  const words = text.toLowerCase().split(/[\s,\.!?;:\-()]+/)
  const wordFreq = new Map<string, number>()

  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    '그리고', '또는', '하지만', '에서', '에', '를', '를', '이', '가', '은', '는', '것', '수',
    '있다', '없다', '한다', '하다', '되다', '되었다', '할', '했다', '될',
  ])

  words.forEach((word) => {
    if (word.length > 2 && !stopwords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) ?? 0) + 1)
    }
  })

  return Array.from(wordFreq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

function extractActionItems(text: string): readonly string[] {
  const items: string[] = []
  const sentences = text.split(/[.!?。]+/)

  const patterns = [
    /(?:해야|해결|필요|진행|확인|검토|작업|처리)(?:하.*|.*해)/gi,
    /(?:해주|부탁|요청|알려).*(?:주|세요|줄)/gi,
    /(?:다음|내일|이번주|이번달)에.*(?:할|하기)/gi,
  ]

  sentences.forEach((sentence) => {
    patterns.forEach((pattern) => {
      const match = sentence.match(pattern)
      if (match) {
        const item = sentence.trim()
        if (item.length > 5 && item.length < 200) {
          items.push(item)
        }
      }
    })
  })

  return items.slice(0, 5)
}

function analyzeSentiment(text: string): string {
  const positiveKeywords = [
    '좋다', '훌륭하다', '탁월하다', '뛰어나다', '훌륭', '좋', '만족', '긍정',
    'great', 'excellent', 'good', 'awesome', 'fantastic',
  ]
  const negativeKeywords = [
    '나쁘다', '안좋다', '문제', '이슈', '오류', '버그', '실패', '부족',
    'bad', 'poor', 'issue', 'problem', 'error', 'failure',
  ]

  const textLower = text.toLowerCase()
  const positiveCount = positiveKeywords.reduce(
    (count, keyword) => count + (textLower.match(new RegExp(keyword, 'g')) ?? []).length,
    0
  )
  const negativeCount = negativeKeywords.reduce(
    (count, keyword) => count + (textLower.match(new RegExp(keyword, 'g')) ?? []).length,
    0
  )

  if (positiveCount > negativeCount) return '긍정적'
  if (negativeCount > positiveCount) return '부정적'
  return '중립적'
}

function calculateDuration(paragraphs: readonly Paragraph[]): string {
  if (paragraphs.length === 0) return '0분'

  const timestamps = paragraphs
    .filter((p) => p.timestamp)
    .map((p) => new Date(p.timestamp).getTime())
    .sort((a, b) => a - b)

  if (timestamps.length < 2) return '1분'

  const durationMs = timestamps[timestamps.length - 1] - timestamps[0]
  const minutes = Math.round(durationMs / 60000)

  return `${minutes}분`
}

export async function POST(request: NextRequest): Promise<NextResponse<SummarizeResponse>> {
  try {
    const body = (await request.json()) as SummarizeRequest

    const allText = body.paragraphs.map((p) => p.text).join(' ')
    const sentences = allText.split(/[.!?。]+/).filter((s) => s.trim().length > 0)

    // Generate summary by concatenating key sentences
    const summary = sentences
      .slice(0, Math.min(3, Math.max(1, Math.floor(sentences.length / 3))))
      .join('. ')
      .trim()

    const topics = extractTopics(allText)
    const actionItems = extractActionItems(allText)
    const sentiment = analyzeSentiment(allText)
    const duration = calculateDuration(body.paragraphs)

    return NextResponse.json({
      summary: summary || '회의 내용을 분석하지 못했습니다.',
      topics,
      actionItems,
      sentiment,
      duration,
    })
  } catch (error) {
    console.error('Voice summarize error:', error)
    return NextResponse.json(
      {
        summary: '요청 처리 중 오류가 발생했습니다.',
        topics: [],
        actionItems: [],
        sentiment: '중립적',
        duration: '0분',
      },
      { status: 500 }
    )
  }
}
