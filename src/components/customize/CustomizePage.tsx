'use client'

import { useState, useCallback } from 'react'
import type { CustomizeSectionKey } from '@/types/customize'
import { useProjectConfig } from '@/hooks/useProjectConfig'
import CustomizeSidebar from './CustomizeSidebar'
import ProjectSettingsSection from './ProjectSettingsSection'
import AgentArchitectureSection from './AgentArchitectureSection'
import ToolIntegrationSection from './ToolIntegrationSection'
import DashboardLayoutSection from './DashboardLayoutSection'
import PermissionsSection from './PermissionsSection'

export default function CustomizePage() {
  const [activeSection, setActiveSection] = useState<CustomizeSectionKey>('project')
  const { config, dispatch } = useProjectConfig()

  const handleSectionSelect = useCallback((section: CustomizeSectionKey) => {
    setActiveSection(section)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#e5e7eb',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Left Sidebar */}
      <CustomizeSidebar activeSection={activeSection} onSelect={handleSectionSelect} />

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeSection === 'project' && (
          <ProjectSettingsSection
            settings={config.project}
            onChange={(project) => dispatch({ type: 'SET_PROJECT', payload: project })}
          />
        )}

        {activeSection === 'architecture' && (
          <AgentArchitectureSection
            settings={config.agentArchitecture}
            onChange={(arch) => dispatch({ type: 'SET_ARCHITECTURE', payload: arch })}
          />
        )}

        {activeSection === 'tools' && (
          <ToolIntegrationSection
            tools={config.toolIntegrations}
            onChange={(tools) => dispatch({ type: 'SET_TOOLS', payload: tools })}
          />
        )}

        {activeSection === 'layout' && (
          <DashboardLayoutSection
            settings={config.dashboardLayout}
            onChange={(layout) => dispatch({ type: 'SET_LAYOUT', payload: layout })}
          />
        )}

        {activeSection === 'permissions' && (
          <PermissionsSection
            permissions={config.permissions}
            onChange={(perms) => dispatch({ type: 'SET_PERMISSIONS', payload: perms })}
          />
        )}
      </div>
    </div>
  )
}
