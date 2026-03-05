'use client'

import type { TerminalConfig, ThemeName, CursorStyle } from '@/types/terminal'
import { THEME_NAMES, FONT_OPTIONS, THEMES } from '@/data/terminalThemes'

type Action =
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_FONT_FAMILY'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'SET_CURSOR_STYLE'; payload: CursorStyle }
  | { type: 'SET_CURSOR_BLINK'; payload: boolean }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_SCROLLBACK'; payload: number }
  | { type: 'RESET' }

interface TerminalCustomizerProps {
  config: TerminalConfig
  dispatch: React.Dispatch<Action>
  onClose: () => void
}

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  color: '#9ca3af',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 3,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  background: 'transparent',
  border: '1px solid #333333',
  borderRadius: 4,
  color: '#e6edf3',
  fontSize: 10,
  outline: 'none',
}

export default function TerminalCustomizer({ config, dispatch, onClose }: TerminalCustomizerProps) {
  return (
    <div
      style={{
        width: 220,
        height: '100%',
        background: 'transparent',
        borderLeft: '1px solid #333333',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflow: 'auto',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#e6edf3' }}>터미널 설정</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, padding: 2 }}
        >
          ✕
        </button>
      </div>

      <div style={{ height: 1, background: '#333333' }} />

      {/* Font size */}
      <div>
        <div style={labelStyle}>폰트 크기: {config.fontSize}px</div>
        <input
          type="range"
          min={10}
          max={24}
          step={1}
          value={config.fontSize}
          onChange={(e) => dispatch({ type: 'SET_FONT_SIZE', payload: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      {/* Font family */}
      <div>
        <div style={labelStyle}>폰트</div>
        <select
          value={config.fontFamily}
          onChange={(e) => dispatch({ type: 'SET_FONT_FAMILY', payload: e.target.value })}
          style={selectStyle}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Theme */}
      <div>
        <div style={labelStyle}>테마</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {THEME_NAMES.map((t) => {
            const isActive = config.themeName === t.key
            const theme = THEMES[t.key]
            return (
              <button
                key={t.key}
                onClick={() => dispatch({ type: 'SET_THEME', payload: t.key })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  background: isActive ? 'rgba(0,255,136,0.1)' : '#000000',
                  border: `1px solid ${isActive ? 'rgba(0,255,136,0.4)' : '#333333'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Color swatch */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {[theme.background, theme.green, theme.blue, theme.red].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: c,
                        border: '1px solid rgba(46,53,69,0.6)',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 9, color: isActive ? '#00ff88' : '#9ca3af' }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cursor style */}
      <div>
        <div style={labelStyle}>커서 스타일</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['block', 'underline', 'bar'] as const).map((s) => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_CURSOR_STYLE', payload: s })}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 9,
                background: config.cursorStyle === s ? 'rgba(0,255,136,0.1)' : '#000000',
                border: `1px solid ${config.cursorStyle === s ? 'rgba(0,255,136,0.4)' : '#333333'}`,
                borderRadius: 4,
                color: config.cursorStyle === s ? '#00ff88' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              {s === 'block' ? '█' : s === 'underline' ? '_' : '|'} {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cursor blink */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>커서 깜빡임</span>
        <button
          onClick={() => dispatch({ type: 'SET_CURSOR_BLINK', payload: !config.cursorBlink })}
          style={{
            width: 36,
            height: 18,
            borderRadius: 9,
            background: config.cursorBlink ? 'rgba(0,255,136,0.3)' : '#333333',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: config.cursorBlink ? '#00ff88' : '#6b7280',
              position: 'absolute',
              top: 2,
              left: config.cursorBlink ? 20 : 2,
              transition: 'all 0.2s',
            }}
          />
        </button>
      </div>

      {/* Opacity */}
      <div>
        <div style={labelStyle}>투명도: {(config.opacity * 100).toFixed(0)}%</div>
        <input
          type="range"
          min={70}
          max={100}
          step={5}
          value={config.opacity * 100}
          onChange={(e) => dispatch({ type: 'SET_OPACITY', payload: Number(e.target.value) / 100 })}
          style={{ width: '100%', accentColor: '#00ff88' }}
        />
      </div>

      {/* Scrollback */}
      <div>
        <div style={labelStyle}>스크롤백 라인</div>
        <select
          value={config.scrollback}
          onChange={(e) => dispatch({ type: 'SET_SCROLLBACK', payload: Number(e.target.value) })}
          style={selectStyle}
        >
          {[1000, 3000, 5000, 10000].map((v) => (
            <option key={v} value={v}>{v.toLocaleString()}</option>
          ))}
        </select>
      </div>

      <div style={{ height: 1, background: '#333333' }} />

      {/* Reset */}
      <button
        onClick={() => dispatch({ type: 'RESET' })}
        style={{
          padding: '6px 10px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 4,
          color: '#ef4444',
          fontSize: 9,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        기본값 복원
      </button>
    </div>
  )
}
