# Build Issues & Known Patterns

## ⛔ CRITICAL: DO NOT TOUCH BUILD SYSTEM

When encountering repetitive build errors or compilation issues:

1. **Identify the root cause** - Do NOT apply the same fix multiple times
2. **Fix once, fix correctly** - Address the underlying issue, not the symptom
3. **Document the pattern** - Add to this file for future reference
4. **Never modify**:
   - `next.config.ts`
   - `.next` directory
   - Build cache settings
   - TypeScript compiler options (`tsconfig.json`)
   - Webpack configuration

---

## Known Build Patterns

### Pattern 1: Git LFS Pointer Files
**Issue**: Files show as "LFS pointer" instead of actual content
- `file` command shows: `ASCII text` instead of `JSON data`, `binary`, etc.
- Browser loads cached LFS pointer instead of real file

**Solution**:
```bash
cd /Users/daniel/Desktop/agent-control-tower
git lfs pull  # Pull actual files from LFS
rm -rf .next  # Clear Next.js build cache
npm run dev   # Restart dev server
```

**Do NOT**:
- Modify `.next` settings
- Change build scripts
- Force-delete files
- Edit git LFS config

**Prevention**: Always run `git lfs pull` after cloning or checking out branches

---

### Pattern 2: GaugeChart Import Errors (RESOLVED)
**Issue**: Circular imports or unused component files
- Error: `Cannot find module './GaugeChart'`

**Root Cause**: GaugeChart was used in multiple files (ToolResourceCards, AgentStatusCards)

**Solution Applied** (2026-03-05):
1. Removed GaugeChart.tsx completely
2. Replaced circular gauges with simple percentage displays
3. Kept linear progress bars for usage metrics

**Do NOT**:
- Re-add the original GaugeChart component
- Use circular visualizations in bottom row cards
- Import gauge components in the future

---

## Build Error Checklist

Before modifying code to fix a build error:

- [ ] Is this a **file not found** error? → Check git status + `git lfs pull`
- [ ] Is this a **module import** error? → Check for circular dependencies
- [ ] Is this a **TypeScript** error? → Run `npx tsc --noEmit` to diagnose
- [ ] Is this a **cache** issue? → Clear `.next` directory
- [ ] Have I seen this error before? → Check this document first

If the error is new:
1. Research the root cause thoroughly
2. Fix the underlying issue (not the symptom)
3. Document the solution here
4. Move forward - do not revisit this pattern
