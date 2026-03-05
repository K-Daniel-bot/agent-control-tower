/**
 * NOC Dashboard Theme Colors
 * Extracted from reference image (w.png)
 * Deep, professional dark theme for operations center
 */

export const NocTheme = {
  // Base colors
  background: '#000000',      // Main background - pure black
  surface: '#000000',         // Panel/UI surface
  surfaceAlt: '#0a0a0a',     // Alternative surface
  border: '#333333',          // Borders and dividers
  borderLight: '#444444',     // Lighter borders
  divider: '#333333',         // Simple dividers

  // Text colors
  textPrimary: '#e5e7eb',     // Main text - light gray
  textSecondary: '#9ca3af',   // Secondary text
  textTertiary: '#6b7280',    // Tertiary text
  textMuted: '#4b5563',       // Muted text
  textDark: '#8b95a5',        // Dark labels

  // Status/Accent colors
  purple: '#a855f7',          // Primary accent - bright purple
  purpleLight: '#c084fc',     // Light purple
  purpleDark: '#7c3aed',      // Dark purple

  orange: '#f59e0b',          // Warning/Activity - amber
  orangeBright: '#ff6b35',    // Bright orange

  green: '#10b981',           // Success - emerald
  greenBright: '#00ff00',     // Bright green

  red: '#ef4444',             // Error - red
  redPink: '#ff3366',         // Red-pink accent

  pink: '#ec4899',            // Pink accent

  cyan: '#06b6d4',            // Cyan accent

  blue: '#3b82f6',            // Blue accent

  yellow: '#ffcc00',          // Yellow accent

  // Semantic colors
  active: '#a855f7',          // Active state
  inactive: '#6b7280',        // Inactive state
  hover: '#1a1a1a',           // Hover state
  success: '#10b981',         // Success
  warning: '#f59e0b',         // Warning
  error: '#ef4444',           // Error
  info: '#3b82f6',            // Information

  // Surface variants
  surfaceLight: '#1a1a1a',    // Light surface

  // Chart colors (organized by type)
  chartColors: [
    '#a855f7',                // Purple
    '#f59e0b',                // Orange
    '#10b981',                // Green
    '#ec4899',                // Pink
    '#06b6d4',                // Cyan
    '#3b82f6',                // Blue
    '#ff3366',                // Red-pink
    '#ffcc00',                // Yellow
  ],
} as const

// Helper function for transparency
export const withAlpha = (color: string, alpha: number): string => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
