import type { PaneId, SplitDirection, SplitNode, PaneLeaf, PaneSplit } from '@/types/terminal'

let paneCounter = 0

export function generatePaneId(): PaneId {
  paneCounter += 1
  return `pane-${paneCounter}-${Date.now().toString(36)}`
}

export function createInitialPane(): PaneLeaf {
  return { type: 'leaf', id: generatePaneId() }
}

export function countLeaves(node: SplitNode): number {
  if (node.type === 'leaf') return 1
  return countLeaves(node.first) + countLeaves(node.second)
}

export function collectLeafIds(node: SplitNode): readonly PaneId[] {
  if (node.type === 'leaf') return [node.id]
  return [...collectLeafIds(node.first), ...collectLeafIds(node.second)]
}

export function splitLeaf(
  node: SplitNode,
  targetId: PaneId,
  direction: SplitDirection,
): SplitNode {
  if (node.type === 'leaf') {
    if (node.id !== targetId) return node
    const newPane: PaneLeaf = { type: 'leaf', id: generatePaneId() }
    const split: PaneSplit = {
      type: 'split',
      id: generatePaneId(),
      direction,
      ratio: 0.5,
      first: node,
      second: newPane,
    }
    return split
  }

  const newFirst = splitLeaf(node.first, targetId, direction)
  const newSecond = splitLeaf(node.second, targetId, direction)

  if (newFirst === node.first && newSecond === node.second) return node

  return { ...node, first: newFirst, second: newSecond }
}

export function removeLeaf(node: SplitNode, targetId: PaneId): SplitNode | null {
  if (node.type === 'leaf') {
    return node.id === targetId ? null : node
  }

  const newFirst = removeLeaf(node.first, targetId)
  const newSecond = removeLeaf(node.second, targetId)

  if (newFirst === null && newSecond === null) return null
  if (newFirst === null) return newSecond
  if (newSecond === null) return newFirst

  if (newFirst === node.first && newSecond === node.second) return node

  return { ...node, first: newFirst, second: newSecond }
}

export function getNewPaneIdFromSplit(
  oldNode: SplitNode,
  newNode: SplitNode,
): PaneId | null {
  const oldIds = new Set(collectLeafIds(oldNode))
  const newIds = collectLeafIds(newNode)
  const added = newIds.find((id) => !oldIds.has(id))
  return added ?? null
}
