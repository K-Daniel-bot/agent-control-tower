import { NextResponse } from 'next/server'
import { getMetrics } from '@/data/agentSettingsData'

export async function GET() {
  const metrics = getMetrics()
  return NextResponse.json({ data: metrics })
}
