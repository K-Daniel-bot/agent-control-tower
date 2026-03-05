'use client'

import React, { useCallback, useEffect, useState } from 'react'

interface GitRepoModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

interface GitConfig {
  readonly repositoryUrl: string
  readonly branchName: string
  readonly autoPush: boolean
  readonly remoteName: string
}

const STORAGE_KEY = 'act-git-config'

const DEFAULT_CONFIG: GitConfig = {
  repositoryUrl: '',
  branchName: 'main',
  autoPush: false,
  remoteName: 'origin',
}

function loadConfig(): GitConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_CONFIG
    const parsed = JSON.parse(stored)
    return {
      repositoryUrl: typeof parsed.repositoryUrl === 'string' ? parsed.repositoryUrl : '',
      branchName: typeof parsed.branchName === 'string' ? parsed.branchName : 'main',
      autoPush: typeof parsed.autoPush === 'boolean' ? parsed.autoPush : false,
      remoteName: typeof parsed.remoteName === 'string' ? parsed.remoteName : 'origin',
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveConfig(config: GitConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save git config:', error)
  }
}

type ModalStep = 'confirm' | 'form'

export default function GitRepoModal({ isOpen, onClose }: GitRepoModalProps) {
  const [step, setStep] = useState<ModalStep>('confirm')
  const [config, setConfig] = useState<GitConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    if (isOpen) {
      const loaded = loadConfig()
      setConfig(loaded)
      setStep(loaded.repositoryUrl ? 'form' : 'confirm')
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const handleConfirm = useCallback(() => {
    setStep('form')
  }, [])

  const handleFieldChange = useCallback(
    (field: keyof GitConfig, value: string | boolean) => {
      setConfig((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSave = useCallback(() => {
    saveConfig(config)
    onClose()
  }, [config, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }

  const modalStyle: React.CSSProperties = {
    background: '#000000',
    border: '1px solid #333333',
    borderRadius: 8,
    padding: 28,
    minWidth: 400,
    maxWidth: 480,
    width: '100%',
    fontFamily: 'monospace',
    color: '#e0e0e0',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: '#00ff88',
    marginBottom: 20,
    letterSpacing: '0.04em',
    fontFamily: 'monospace',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#8b95a5',
    marginBottom: 6,
    display: 'block',
    fontFamily: 'monospace',
    letterSpacing: '0.03em',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 13,
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const buttonBase: React.CSSProperties = {
    padding: '8px 20px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'monospace',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 0.15s',
    border: '1px solid #333333',
  }

  const primaryButton: React.CSSProperties = {
    ...buttonBase,
    background: 'rgba(0,255,136,0.12)',
    color: '#00ff88',
    border: '1px solid rgba(0,255,136,0.35)',
  }

  const secondaryButton: React.CSSProperties = {
    ...buttonBase,
    background: 'transparent',
    color: '#8b95a5',
  }

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: 16,
  }

  if (step === 'confirm') {
    return (
      <div style={overlayStyle} onClick={handleBackdropClick}>
        <div style={modalStyle}>
          <div style={titleStyle}>Git Repository</div>
          <p
            style={{
              fontSize: 13,
              color: '#e0e0e0',
              marginBottom: 24,
              lineHeight: 1.6,
              fontFamily: 'monospace',
            }}
          >
            Git 리포지토리를 설정하시겠습니까?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button style={secondaryButton} onClick={onClose}>
              취소
            </button>
            <button style={primaryButton} onClick={handleConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlayStyle} onClick={handleBackdropClick}>
      <div style={modalStyle}>
        <div style={titleStyle}>Git Repository Settings</div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Repository URL</label>
          <input
            type="text"
            value={config.repositoryUrl}
            onChange={(e) => handleFieldChange('repositoryUrl', e.target.value)}
            placeholder="https://github.com/org/repo.git"
            style={inputStyle}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Branch</label>
          <input
            type="text"
            value={config.branchName}
            onChange={(e) => handleFieldChange('branchName', e.target.value)}
            placeholder="main"
            style={inputStyle}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Remote Name</label>
          <input
            type="text"
            value={config.remoteName}
            onChange={(e) => handleFieldChange('remoteName', e.target.value)}
            placeholder="origin"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            ...fieldGroupStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>Auto-push</label>
          <button
            onClick={() => handleFieldChange('autoPush', !config.autoPush)}
            style={{
              width: 44,
              height: 22,
              borderRadius: 11,
              border: `1px solid ${config.autoPush ? 'rgba(0,255,136,0.35)' : '#333'}`,
              background: config.autoPush ? 'rgba(0,255,136,0.18)' : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: config.autoPush ? '#00ff88' : '#555',
                position: 'absolute',
                top: 2,
                left: config.autoPush ? 24 : 2,
                transition: 'all 0.2s',
              }}
            />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #222',
          }}
        >
          <button style={secondaryButton} onClick={onClose}>
            닫기
          </button>
          <button style={primaryButton} onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
