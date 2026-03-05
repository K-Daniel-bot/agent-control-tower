# Agent Control Tower — Development Guidelines

## ⛔ Critical Components — DO NOT MODIFY

### TopologyMap & NocDashboard
**Status**: Stable production component
- **Location**: `src/components/topology/TopologyMap.tsx`, `src/components/noc/NocDashboard.tsx`
- **Responsibility**: Core EMS (NocDashboard) visualization engine
- **Rule**: Do NOT randomly modify, refactor, or change this component without explicit user request
- **Impact**: Changes affect the entire dashboard layout, all panels, and real-time visualization

**Allowed changes**:
- Bug fixes with clear evidence of the issue
- Performance improvements with benchmarks
- Adding new features explicitly requested by the user

**Forbidden changes**:
- Cosmetic refactoring
- Renaming for "clarity"
- Restructuring component hierarchy
- "Simplifying" the code
- Reorganizing panel layouts without user request

---

## Project Standards

### Immutability (CRITICAL)
- Always create new objects, never mutate
- Use spread operators: `{ ...obj, prop: value }`
- No direct assignments to state or props

### Type Safety
- TypeScript strict mode enabled
- All components must be properly typed
- readonly arrays and interfaces for immutability

### File Organization
- Keep files under 800 lines
- Functions under 50 lines
- High cohesion, low coupling

### Error Handling
- Always handle errors comprehensively
- Validate at system boundaries (user input, external APIs)
- Use error boundaries for React components

## Recent Fixes (Session 2026-03-05)

### NewsWorldMap - Map Pan Disabled
- Removed mouse drag panning from D3 zoom filter
- **Allowed**: Wheel zoom only (no mouse drag)
- **Fixed**: Icon staying in place while map moves

### NocDashboard - GaugeChart Removed
- Deleted `src/components/noc/bottom/GaugeChart.tsx`
- Removed circular gauge visualization from ToolResourceCards
- Kept linear usage bars for tool status display

### News Data Quality
- All articles have multi-paragraph `content` field
- VideoUrl fields present only when valid
- Use ArticleDetailPopup.content for full article display
- VideoPlayer filters for valid YouTube URLs
