export interface Paragraph {
  readonly id: string
  readonly text: string
  readonly timestamp: string
  readonly speaker?: string
  readonly aiSummary?: string
}

export interface Participant {
  readonly id: string
  readonly name: string
  readonly color: string
}

export interface MeetingNote {
  readonly id: string
  readonly title: string
  readonly createdAt: string
  readonly paragraphs: readonly Paragraph[]
  readonly participants: readonly Participant[]
}
