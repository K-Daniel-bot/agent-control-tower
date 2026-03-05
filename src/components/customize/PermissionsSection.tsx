'use client'

import { useState } from 'react'
import type { PermissionEntry, PermissionRole } from '@/types/customize'

interface PermissionsSectionProps {
  readonly permissions: readonly PermissionEntry[]
  readonly onChange: (permissions: readonly PermissionEntry[]) => void
}

const ROLES: readonly { value: PermissionRole; label: string; color: string }[] = [
  { value: 'admin', label: 'Admin', color: '#ff6b6b' },
  { value: 'operator', label: 'Operator', color: '#f59e0b' },
  { value: 'viewer', label: 'Viewer', color: '#06b6d4' },
]

function generateId(): string {
  return `perm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function PermissionsSection({ permissions, onChange }: PermissionsSectionProps) {
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<PermissionRole>('viewer')

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return

    const entry: PermissionEntry = {
      id: generateId(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
    }
    onChange([...permissions, entry])
    setNewName('')
    setNewEmail('')
    setNewRole('viewer')
  }

  const handleRemove = (id: string) => {
    onChange(permissions.filter((p) => p.id !== id))
  }

  const handleRoleChange = (id: string, role: PermissionRole) => {
    onChange(permissions.map((p) => (p.id === id ? { ...p, role } : p)))
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#e5e7eb',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 700 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 24 }}>
        권한 관리
      </div>

      {/* Add new entry */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          padding: '12px 14px',
          border: '1px solid #222',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="이름"
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="이메일"
          style={{ ...inputStyle, flex: 1.5 }}
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as PermissionRole)}
          style={{ ...inputStyle, cursor: 'pointer', width: 100 }}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || !newEmail.trim()}
          style={{
            padding: '6px 14px',
            background: newName.trim() && newEmail.trim() ? 'rgba(0,255,136,0.1)' : 'transparent',
            border: `1px solid ${newName.trim() && newEmail.trim() ? '#00ff88' : '#333'}`,
            borderRadius: 4,
            color: newName.trim() && newEmail.trim() ? '#00ff88' : '#666',
            fontSize: 11,
            cursor: newName.trim() && newEmail.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          추가
        </button>
      </div>

      {/* Permissions Table */}
      {permissions.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#555', fontSize: 12 }}>
          등록된 권한이 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr 100px 40px',
              gap: 8,
              padding: '6px 14px',
              fontSize: 10,
              color: '#666',
              fontWeight: 600,
            }}
          >
            <span>이름</span>
            <span>이메일</span>
            <span>역할</span>
            <span />
          </div>

          {/* Entries */}
          {permissions.map((perm) => {
            const roleInfo = ROLES.find((r) => r.value === perm.role)
            return (
              <div
                key={perm.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.5fr 100px 40px',
                  gap: 8,
                  padding: '8px 14px',
                  border: '1px solid #222',
                  borderRadius: 4,
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#e5e7eb',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {perm.name}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#9ca3af' }}>
                  {perm.email}
                </span>
                <select
                  value={perm.role}
                  onChange={(e) => handleRoleChange(perm.id, e.target.value as PermissionRole)}
                  style={{
                    padding: '2px 6px',
                    background: '#0a0a0a',
                    border: `1px solid ${roleInfo?.color ?? '#333'}`,
                    borderRadius: 3,
                    color: roleInfo?.color ?? '#e5e7eb',
                    fontSize: 10,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemove(perm.id)}
                  style={{
                    width: 24,
                    height: 24,
                    background: 'transparent',
                    border: '1px solid #333',
                    borderRadius: 3,
                    color: '#666',
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >
                  x
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
