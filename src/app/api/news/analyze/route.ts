import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const MEMORY_DIR = path.join(process.env.HOME ?? '~', '.claude', 'news-analysis')

interface AnalyzeRequest {
  articleId: string
  title: string
  summary: string
  category: string
  tags: string[]
}

function generateAnalysis(req: AnalyzeRequest) {
  const sentiments = ['positive', 'negative', 'neutral'] as const
  const impacts = ['critical', 'high', 'medium', 'low'] as const

  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]!
  const impact = impacts[Math.floor(Math.random() * 2)]!

  const analysisText = [
    `[분석] ${req.title}`,
    ``,
    `카테고리: ${req.category}`,
    `감성: ${sentiment === 'positive' ? '긍정적' : sentiment === 'negative' ? '부정적' : '중립'}`,
    `영향도: ${impact}`,
    `키워드: ${req.tags.join(', ')}`,
    ``,
    `요약 분석:`,
    `이 사건은 ${req.category} 분야에서 ${impact === 'critical' ? '매우 중대한' : impact === 'high' ? '상당한' : '보통 수준의'} 영향을 미칠 것으로 분석됩니다.`,
    `관련 키워드(${req.tags.slice(0, 3).join(', ')})를 기반으로 추적 감시가 권장됩니다.`,
    ``,
    `분석 시각: ${new Date().toISOString()}`,
  ].join('\n')

  return {
    id: `analysis-${req.articleId}`,
    articleId: req.articleId,
    summary: analysisText,
    sentiment,
    impact,
    keywords: req.tags,
    analyzedAt: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AnalyzeRequest

    if (!body.articleId || !body.title) {
      return NextResponse.json({ error: 'articleId and title required' }, { status: 400 })
    }

    const analysis = generateAnalysis(body)

    // Save to memory
    await fs.mkdir(MEMORY_DIR, { recursive: true })
    const filename = `${body.category}-${Date.now()}.md`
    const memoryContent = [
      `# ${body.title}`,
      ``,
      `- **분석 시각**: ${analysis.analyzedAt}`,
      `- **카테고리**: ${body.category}`,
      `- **감성**: ${analysis.sentiment}`,
      `- **영향도**: ${analysis.impact}`,
      `- **키워드**: ${body.tags.join(', ')}`,
      ``,
      `## 에이전트 분석`,
      analysis.summary,
      ``,
      `## 원문 요약`,
      body.summary,
    ].join('\n')

    await fs.writeFile(path.join(MEMORY_DIR, filename), memoryContent, 'utf-8')

    return NextResponse.json({ analysis, savedTo: path.join(MEMORY_DIR, filename) })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
