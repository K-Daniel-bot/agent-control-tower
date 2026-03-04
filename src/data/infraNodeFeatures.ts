export interface InfraNodeDef {
  id: string
  label: string
  icon: string
  baseAngle: number
  color: string
  description: string
  features: string[]
}

export const INFRA_NODES: InfraNodeDef[] = [
  {
    id: 'planner',
    label: 'Planner',
    icon: '\uD83D\uDCCB',
    baseAngle: 0,
    color: '#3b82f6',
    description: '\uC791\uC5C5 \uACC4\uD68D \uC218\uB9BD',
    features: ['\uC791\uC5C5 \uBD84\uD574', '\uC6B0\uC120\uC21C\uC704 \uC124\uC815', '\uC758\uC874\uC131 \uBD84\uC11D', '\uC77C\uC815 \uC608\uCE21'],
  },
  {
    id: 'executor',
    label: 'Executor',
    icon: '\u26A1',
    baseAngle: 51.4,
    color: '#00ff88',
    description: '\uCF54\uB4DC \uC2E4\uD589',
    features: ['\uCF54\uB4DC \uC0DD\uC131', '\uD30C\uC77C \uC218\uC815', '\uB9AC\uD329\uD1A0\uB9C1', '\uBE4C\uB4DC \uC2E4\uD589'],
  },
  {
    id: 'browser',
    label: 'Browser',
    icon: '\uD83C\uDF10',
    baseAngle: 102.9,
    color: '#f59e0b',
    description: '\uC6F9 \uD0D0\uC0C9',
    features: ['URL \uC811\uC18D', '\uD398\uC774\uC9C0 \uC2A4\uD06C\uB9B0\uC0F7', 'DOM \uBD84\uC11D', '\uB370\uC774\uD130 \uC218\uC9D1'],
  },
  {
    id: 'git',
    label: 'Git',
    icon: '\uD83D\uDCC2',
    baseAngle: 154.3,
    color: '#a855f7',
    description: '\uBC84\uC804 \uAD00\uB9AC',
    features: ['\uCEE4\uBC0B', '\uBE0C\uB79C\uCE58 \uAD00\uB9AC', 'PR \uC0DD\uC131', '\uCF54\uB4DC \uB9AC\uBDF0'],
  },
  {
    id: 'shell',
    label: 'Shell',
    icon: '\uD83D\uDCBB',
    baseAngle: 205.7,
    color: '#ef4444',
    description: '\uC2DC\uC2A4\uD15C \uBA85\uB839',
    features: ['\uD130\uBBF8\uB110 \uC2E4\uD589', '\uD328\uD0A4\uC9C0 \uAD00\uB9AC', '\uD504\uB85C\uC138\uC2A4 \uC81C\uC5B4', '\uB85C\uADF8 \uC870\uD68C'],
  },
  {
    id: 'database',
    label: 'Database',
    icon: '\uD83D\uDDC4',
    baseAngle: 257.1,
    color: '#06b6d4',
    description: '\uB370\uC774\uD130 \uAD00\uB9AC',
    features: ['\uC2A4\uD0A4\uB9C8 \uC124\uACC4', '\uCFFC\uB9AC \uC2E4\uD589', '\uB9C8\uC774\uADF8\uB808\uC774\uC158', '\uBC31\uC5C5'],
  },
  {
    id: 'verifier',
    label: 'Verifier',
    icon: '\u2705',
    baseAngle: 308.6,
    color: '#10b981',
    description: '\uAC80\uC99D/\uD14C\uC2A4\uD2B8',
    features: ['\uB2E8\uC704 \uD14C\uC2A4\uD2B8', '\uCF54\uB4DC \uB9AC\uBDF0', '\uBCF4\uC548 \uC810\uAC80', '\uC131\uB2A5 \uBD84\uC11D'],
  },
]
