'use client'

import { useCallback } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { NODE_TYPE_CONFIG } from '@/types/automation'
import type { WorkflowNodeData } from '@/types/automation'
import { useAutomation } from './context/AutomationContext'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

function FieldRow({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: NocTheme.textMuted, marginBottom: 4, letterSpacing: '0.04em' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder,
}: {
  readonly value: string
  readonly onChange: (v: string) => void
  readonly placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '6px 8px',
        background: NocTheme.surfaceAlt,
        border: `1px solid ${NocTheme.border}`,
        borderRadius: 4,
        color: NocTheme.textPrimary,
        fontSize: 11,
        fontFamily: FONT,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  )
}

function SelectInput({
  value, options, onChange,
}: {
  readonly value: string
  readonly options: readonly { value: string; label: string }[]
  readonly onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '6px 8px',
        background: NocTheme.surfaceAlt,
        border: `1px solid ${NocTheme.border}`,
        borderRadius: 4,
        color: NocTheme.textPrimary,
        fontSize: 11,
        fontFamily: FONT,
        outline: 'none',
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export default function PropertyEditor() {
  const { state, updateNodeData, deleteNode } = useAutomation()
  const { selectedNodeId, nodes } = state
  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const handleLabelChange = useCallback((label: string) => {
    if (!selectedNodeId) return
    updateNodeData(selectedNodeId, { label })
  }, [selectedNodeId, updateNodeData])

  const handleDescChange = useCallback((description: string) => {
    if (!selectedNodeId) return
    updateNodeData(selectedNodeId, { description })
  }, [selectedNodeId, updateNodeData])

  const handleConfigChange = useCallback((key: string, value: string) => {
    if (!selectedNodeId || !selectedNode) return
    const d = selectedNode.data as WorkflowNodeData
    updateNodeData(selectedNodeId, {
      config: { ...d.config, [key]: value },
    })
  }, [selectedNodeId, selectedNode, updateNodeData])

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return
    deleteNode(selectedNodeId)
  }, [selectedNodeId, deleteNode])

  if (!selectedNode) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT, color: NocTheme.textMuted,
        padding: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>🖱️</div>
        <div style={{ fontSize: 11 }}>노드를 선택하면</div>
        <div style={{ fontSize: 11 }}>속성을 편집할 수 있습니다</div>
      </div>
    )
  }

  const d = selectedNode.data as WorkflowNodeData
  const typeCfg = NODE_TYPE_CONFIG[d.nodeType]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: NocTheme.textPrimary,
      overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, paddingBottom: 10,
        borderBottom: `1px solid ${NocTheme.border}`,
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${typeCfg.color}15`, fontSize: 14,
        }}>
          {typeCfg.icon}
        </span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: typeCfg.color }}>{typeCfg.label}</div>
          <div style={{ fontSize: 9, color: NocTheme.textMuted }}>{selectedNode.id}</div>
        </div>
      </div>

      {/* Common fields */}
      <FieldRow label="이름">
        <TextInput value={d.label} onChange={handleLabelChange} placeholder="노드 이름" />
      </FieldRow>
      <FieldRow label="설명">
        <TextInput value={d.description ?? ''} onChange={handleDescChange} placeholder="설명 (선택)" />
      </FieldRow>

      {/* Type-specific config */}
      {d.nodeType === 'trigger' && (
        <>
          <FieldRow label="트리거 유형">
            <SelectInput
              value={String(d.config.triggerType ?? 'manual')}
              options={[
                { value: 'schedule', label: '스케줄 (Cron)' },
                { value: 'event', label: '이벤트' },
                { value: 'webhook', label: '웹훅' },
                { value: 'manual', label: '수동 실행' },
              ]}
              onChange={v => handleConfigChange('triggerType', v)}
            />
          </FieldRow>
          {d.config.triggerType === 'schedule' && (
            <FieldRow label="Cron 표현식">
              <TextInput value={String(d.config.cron ?? '')} onChange={v => handleConfigChange('cron', v)} placeholder="0 9 * * *" />
            </FieldRow>
          )}
        </>
      )}

      {d.nodeType === 'condition' && (
        <>
          <FieldRow label="필드">
            <TextInput value={String(d.config.field ?? '')} onChange={v => handleConfigChange('field', v)} placeholder="비교 대상 필드" />
          </FieldRow>
          <FieldRow label="연산자">
            <SelectInput
              value={String(d.config.operator ?? 'equals')}
              options={[
                { value: 'equals', label: '같음 (==)' },
                { value: 'not_equals', label: '다름 (!=)' },
                { value: 'greater', label: '크다 (>)' },
                { value: 'less', label: '작다 (<)' },
                { value: 'contains', label: '포함' },
              ]}
              onChange={v => handleConfigChange('operator', v)}
            />
          </FieldRow>
          <FieldRow label="값">
            <TextInput value={String(d.config.value ?? '')} onChange={v => handleConfigChange('value', v)} placeholder="비교 값" />
          </FieldRow>
        </>
      )}

      {d.nodeType === 'action' && (
        <>
          <FieldRow label="액션 유형">
            <SelectInput
              value={String(d.config.actionType ?? 'http_request')}
              options={[
                { value: 'http_request', label: 'HTTP 요청' },
                { value: 'send_message', label: '메시지 전송' },
                { value: 'file_operation', label: '파일 작업' },
                { value: 'agent_command', label: '에이전트 명령' },
                { value: 'delay', label: '지연 (대기)' },
                { value: 'script', label: '스크립트 실행' },
              ]}
              onChange={v => handleConfigChange('actionType', v)}
            />
          </FieldRow>
          {d.config.actionType === 'http_request' && (
            <>
              <FieldRow label="URL">
                <TextInput value={String(d.config.url ?? '')} onChange={v => handleConfigChange('url', v)} placeholder="https://api.example.com" />
              </FieldRow>
              <FieldRow label="메서드">
                <SelectInput
                  value={String(d.config.method ?? 'GET')}
                  options={[
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' },
                    { value: 'PUT', label: 'PUT' },
                    { value: 'DELETE', label: 'DELETE' },
                  ]}
                  onChange={v => handleConfigChange('method', v)}
                />
              </FieldRow>
            </>
          )}
          {d.config.actionType === 'agent_command' && (
            <FieldRow label="명령어">
              <TextInput value={String(d.config.command ?? '')} onChange={v => handleConfigChange('command', v)} placeholder="에이전트 명령" />
            </FieldRow>
          )}
        </>
      )}

      {d.nodeType === 'parallel' && (
        <FieldRow label="최대 병렬 수">
          <TextInput value={String(d.config.maxParallel ?? '3')} onChange={v => handleConfigChange('maxParallel', v)} placeholder="3" />
        </FieldRow>
      )}

      {/* Delete button */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          type="button"
          onClick={handleDelete}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: `${NocTheme.red}10`,
            border: `1px solid ${NocTheme.red}30`,
            borderRadius: 4,
            color: NocTheme.red,
            fontSize: 11,
            fontFamily: FONT,
            cursor: 'pointer',
            transition: 'all 0.12s',
          }}
        >
          🗑 노드 삭제
        </button>
      </div>
    </div>
  )
}
