export interface TerminalTheme {
  readonly background: string
  readonly foreground: string
  readonly cursor: string
  readonly cursorAccent: string
  readonly selectionBackground: string
  readonly black: string
  readonly red: string
  readonly green: string
  readonly yellow: string
  readonly blue: string
  readonly magenta: string
  readonly cyan: string
  readonly white: string
  readonly brightBlack: string
  readonly brightRed: string
  readonly brightGreen: string
  readonly brightYellow: string
  readonly brightBlue: string
  readonly brightMagenta: string
  readonly brightCyan: string
  readonly brightWhite: string
}

export type ThemeName = 'kaku-dark' | 'noc-green' | 'monokai' | 'dracula'

export type CursorStyle = 'block' | 'underline' | 'bar'

export interface TerminalConfig {
  readonly fontSize: number
  readonly fontFamily: string
  readonly themeName: ThemeName
  readonly cursorStyle: CursorStyle
  readonly cursorBlink: boolean
  readonly opacity: number
  readonly scrollback: number
}

export interface ServerMessage {
  readonly type: 'output' | 'exit' | 'ready'
  readonly data?: string
  readonly code?: number
}

export interface ClientMessage {
  readonly type: 'input' | 'resize' | 'command' | 'cd'
  readonly data?: string
  readonly cols?: number
  readonly rows?: number
  readonly command?: string
  readonly path?: string
}

// ── Split Pane Types ──

export type PaneId = string

export type SplitDirection = 'horizontal' | 'vertical'

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

export interface PaneLeaf {
  readonly type: 'leaf'
  readonly id: PaneId
}

export interface PaneSplit {
  readonly type: 'split'
  readonly id: PaneId
  readonly direction: SplitDirection
  readonly ratio: number
  readonly first: SplitNode
  readonly second: SplitNode
}

export type SplitNode = PaneLeaf | PaneSplit

export interface PaneManagerState {
  readonly root: SplitNode
  readonly activePaneId: PaneId
}

export type RightPanelTab = 'skill' | 'note' | 'graph' | null
