'use client'

import { useState } from 'react'
import { SKILLS, CATEGORY_LABELS, type Skill } from '@/data/skills'

interface SkillPanelProps {
  readonly onSendCommand: (cmd: string) => void
  readonly projectDir?: string | null
}

export default function SkillPanel({ onSendCommand, projectDir }: SkillPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set())
  const [installedPaths, setInstalledPaths] = useState<Map<string, string>>(new Map())
  const [installError, setInstallError] = useState<string | null>(null)

  const visible = filter === 'all' ? SKILLS : SKILLS.filter(s => s.category === filter)

  function handleCopy(skill: Skill) {
    navigator.clipboard.writeText(skill.command).catch(() => {})
    setCopiedId(skill.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function toggleExpand(skillId: string) {
    setExpandedId(prev => prev === skillId ? null : skillId)
  }

  async function handleInstall(skill: Skill) {
    if (!projectDir) {
      setInstallError('프로젝트 디렉토리를 먼저 선택해주세요 (좌측 패널 CD 버튼)')
      setTimeout(() => setInstallError(null), 3000)
      return
    }

    setInstallingId(skill.id)
    setInstallError(null)

    try {
      const res = await fetch('/api/fs/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dirPath: projectDir,
          skill: {
            id: skill.id,
            name: skill.name,
            nameKo: skill.nameKo,
            description: skill.description,
            detailedDescription: skill.detailedDescription,
            command: skill.command,
            tags: skill.tags,
          },
        }),
      })

      const data = await res.json() as { path?: string; error?: string }

      if (!res.ok || data.error) {
        setInstallError(data.error ?? '설치 실패')
        setTimeout(() => setInstallError(null), 3000)
        return
      }

      setInstalledIds(prev => new Set([...prev, skill.id]))
      if (data.path) {
        setInstalledPaths(prev => new Map([...prev, [skill.id, data.path!]]))
      }
    } catch {
      setInstallError('설치 중 오류가 발생했습니다')
      setTimeout(() => setInstallError(null), 3000)
    } finally {
      setInstallingId(null)
    }
  }

  return (
    <div
      style={{
        width: 300,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        borderLeft: '1px solid #333333',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #333333', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          스킬 라이브러리
        </div>
        <div style={{ fontSize: 8, color: '#374151', marginTop: 2 }}>
          {SKILLS.length}개 스킬 · AI 스킬은 프로젝트에 설치 가능
        </div>
        {projectDir && (
          <div
            style={{
              fontSize: 7,
              color: '#00ff88',
              marginTop: 3,
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={`설치 경로 1: ${projectDir}/.claude/skills/\n설치 경로 2: ${projectDir}/.agents/skills/`}
          >
            📁 {projectDir} → .claude/skills/ + .agents/skills/
          </div>
        )}
        {installError && (
          <div style={{ fontSize: 8, color: '#ef4444', marginTop: 3 }}>{installError}</div>
        )}
      </div>

      {/* Category filter */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '5px 8px',
          borderBottom: '1px solid #333333',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => {
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '1px 6px',
                background: active ? `${color}15` : 'transparent',
                border: `1px solid ${active ? `${color}40` : '#333333'}`,
                borderRadius: 8,
                color: active ? color : '#505661',
                fontSize: 8,
                cursor: 'pointer',
                fontWeight: active ? 700 : 400,
                transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Skill list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.map(skill => {
          const cat = CATEGORY_LABELS[skill.category]
          const isExpanded = expandedId === skill.id
          const isAI = skill.category === 'ai'
          const isInstalled = installedIds.has(skill.id)
          const isInstalling = installingId === skill.id

          return (
            <div
              key={skill.id}
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{skill.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#e6edf3' }}>{skill.name}</div>
                  <div style={{ fontSize: 8, color: '#505661' }}>{skill.nameKo}</div>
                </div>
                <span
                  style={{
                    fontSize: 7,
                    color: cat.color,
                    padding: '1px 4px',
                    background: `${cat.color}10`,
                    borderRadius: 3,
                    border: `1px solid ${cat.color}25`,
                    flexShrink: 0,
                  }}
                >
                  {cat.label}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.4 }}>
                {skill.description}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  style={{
                    fontSize: 8.5,
                    color: '#9ca3af',
                    lineHeight: 1.6,
                    background: '#000000',
                    borderLeft: '2px solid rgba(0,255,136,0.4)',
                    padding: '6px 8px',
                    borderRadius: '0 4px 4px 0',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    marginTop: 2,
                  }}
                >
                  {skill.detailedDescription}
                </div>
              )}

              {/* Command preview */}
              <div
                style={{
                  fontSize: 8,
                  color: '#505661',
                  fontFamily: 'monospace',
                  background: '#000000',
                  padding: '2px 6px',
                  borderRadius: 3,
                  border: '1px solid #333333',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={skill.command}
              >
                $ {skill.command}
              </div>

              {/* Tags + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                  {skill.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 7,
                        color: '#374151',
                        padding: '0 4px',
                        background: '#000000',
                        borderRadius: 3,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {/* 설명 버튼 */}
                  <button
                    onClick={() => toggleExpand(skill.id)}
                    style={{
                      padding: '2px 7px',
                      background: isExpanded ? 'rgba(96,165,250,0.15)' : '#000000',
                      border: `1px solid ${isExpanded ? 'rgba(96,165,250,0.4)' : '#333333'}`,
                      borderRadius: 3,
                      color: isExpanded ? '#60a5fa' : '#6b7280',
                      fontSize: 7,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isExpanded ? '접기' : '설명'}
                  </button>

                  {/* AI 카테고리: 설치 버튼 / 그 외: 복사+실행 버튼 */}
                  {isAI ? (
                    <button
                      onClick={() => handleInstall(skill)}
                      disabled={isInstalling}
                      style={{
                        padding: '2px 8px',
                        background: isInstalled
                          ? 'rgba(0,255,136,0.15)'
                          : isInstalling
                            ? 'rgba(168,85,247,0.1)'
                            : 'rgba(168,85,247,0.1)',
                        border: `1px solid ${isInstalled ? 'rgba(0,255,136,0.4)' : 'rgba(168,85,247,0.35)'}`,
                        borderRadius: 3,
                        color: isInstalled ? '#00ff88' : '#a855f7',
                        fontSize: 7,
                        fontWeight: 600,
                        cursor: isInstalling ? 'wait' : 'pointer',
                        transition: 'all 0.15s',
                        opacity: isInstalling ? 0.6 : 1,
                      }}
                      title={
                        isInstalled
                          ? `설치됨:\n• ${projectDir}/.claude/skills/${skill.id}.md\n• ${projectDir}/.agents/skills/${skill.id}.md`
                          : `설치 위치:\n• ${projectDir ?? '경로 미선택'}/.claude/skills/${skill.id}.md\n• ${projectDir ?? '경로 미선택'}/.agents/skills/${skill.id}.md`
                      }
                    >
                      {isInstalled ? '✓ 설치됨' : isInstalling ? '설치중...' : '📦 설치'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopy(skill)}
                        style={{
                          padding: '2px 7px',
                          background: copiedId === skill.id ? 'rgba(0,255,136,0.1)' : '#000000',
                          border: `1px solid ${copiedId === skill.id ? 'rgba(0,255,136,0.3)' : '#333333'}`,
                          borderRadius: 3,
                          color: copiedId === skill.id ? '#00ff88' : '#6b7280',
                          fontSize: 7,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {copiedId === skill.id ? '복사됨!' : '복사'}
                      </button>
                      <button
                        onClick={() => onSendCommand(skill.command)}
                        style={{
                          padding: '2px 7px',
                          background: 'rgba(0,255,136,0.08)',
                          border: '1px solid rgba(0,255,136,0.25)',
                          borderRadius: 3,
                          color: '#00ff88',
                          fontSize: 7,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                      >
                        ▶ 실행
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
