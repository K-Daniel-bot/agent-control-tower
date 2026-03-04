import { NextResponse } from 'next/server'
import { getEvents } from '@/data/agentSettingsData'

export async function GET() {
  const events = getEvents()
  return NextResponse.json({ data: events })
}
