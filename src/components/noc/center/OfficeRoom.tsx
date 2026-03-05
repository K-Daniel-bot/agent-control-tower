'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Text, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

interface Agent {
  agentId: string
  name: string
  agentType: string
  status: string
  color: string
  tokenRate: number
}

interface OfficeRoomProps {
  agents?: readonly Agent[]
}

interface CoordinateDisplayState {
  x: number
  y: number
  z: number
  visible: boolean
}

// Executor용 human1 모델 컴포넌트
function HumanAgentModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const gltf = useGLTF('/models/human1/scene.gltf')
  const clonedScene = useMemo(() => {
    return gltf.scene.clone()
  }, [gltf])

  return (
    <group position={position} scale={1.8}>
      <primitive object={clonedScene} />
      {/* 에이전트 이름 라벨 */}
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// Curtsy 데코레이션 모델 (크기 1.5배 축소, 동쪽 방향)
function CurtsyModel({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/curtsy/scene.gltf')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // 애니메이션 재생
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0]
      const action = actions[animationName]
      if (action) {
        action.reset()
        action.play()
      }
    }
  }, [actions])

  return (
    <group ref={groupRef} position={position} scale={0.67} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={gltf.scene} />
    </group>
  )
}

// Planner Agent - Arm Stretching 모델 (애니메이션 포함)
function PlannerAgentModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/arm_stretching/scene.gltf')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // 애니메이션 재생
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0]
      const action = actions[animationName]
      if (action) {
        action.reset()
        action.play()
      }
    }
  }, [actions])

  return (
    <group ref={groupRef} position={position} scale={0.72} rotation={[0, Math.PI, 0]}>
      <primitive object={gltf.scene} />
      <Text position={[0, 2.0, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// Executor Agent - Gir 모델 (애니메이션 포함)
function ExecutorGirModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/gir/scene.gltf')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // 애니메이션 재생 (rotation 애니메이션)
  useEffect(() => {
    if (actions && Object.keys(actions).length > 1) {
      const animationName = Object.keys(actions)[1]
      const action = actions[animationName]
      if (action) {
        action.reset()
        action.play()
      }
    }
  }, [actions])

  return (
    <group ref={groupRef} position={position} scale={0.018} rotation={[0, Math.PI, 0]}>
      <primitive object={gltf.scene} />
      <Text position={[0, 0.8, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// Tool Agent - Jinu 모델 (애니메이션 포함)
function ToolAgentModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/jinu/scene.gltf')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // 애니메이션 재생
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0]
      const action = actions[animationName]
      if (action) {
        action.reset()
        action.play()
      }
    }
  }, [actions])

  return (
    <group ref={groupRef} position={position} scale={0.72}>
      <primitive object={gltf.scene} />
      <Text position={[0, 2.0, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// Orchestrator Agent - Iron Man 모델 (애니메이션 포함)
function OrchestratorIronManModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/iron_man/scene.gltf')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // 애니메이션 재생
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const animationName = Object.keys(actions)[0]
      const action = actions[animationName]
      if (action) {
        action.reset()
        action.play()
      }
    }
  }, [actions])

  return (
    <group ref={groupRef} position={position} scale={0.91} rotation={[0, Math.PI, 0]}>
      <group position={[0, 0, 0.45]}>
        <primitive object={gltf.scene} />
      </group>
      <Text position={[0, 2.3, 0.45]} fontSize={0.4} color="#00ff88" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// Executor 포즈 조정 (팔을 내린 상태)
function AdjustedHumanAgent({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/human1/scene.gltf')
  const clonedScene = useMemo(() => {
    return gltf.scene.clone()
  }, [gltf])

  // 모델 로드 후 팔을 내리는 포즈 조정
  useEffect(() => {
    if (!groupRef.current) return

    clonedScene.traverse((child: any) => {
      if (child.isBone) {
        // 팔 관련 bones 찾기 및 회전 조정
        const name = child.name.toLowerCase()
        if (name.includes('arm') || name.includes('shoulder') || name.includes('hand')) {
          // 팔을 내리는 회전 (Z축 회전으로 팔을 몸 옆으로)
          if (name.includes('left')) {
            child.rotation.z = -Math.PI * 0.3
          } else if (name.includes('right')) {
            child.rotation.z = Math.PI * 0.3
          }
        }
      }
    })
  }, [clonedScene])

  return (
    <group ref={groupRef} position={position} scale={1.8}>
      <primitive object={clonedScene} />
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

function AgentMarker({ agent, position }: { agent: Agent; position: [number, number, number] }) {
  // Orchestrator는 iron_man 모델 사용
  if (agent.agentId === 'orch-1') {
    return <OrchestratorIronManModel position={position} agentName={agent.name} />
  }

  // Executor는 gir 모델 사용
  if (agent.agentId === 'executor-1') {
    return <ExecutorGirModel position={position} agentName={agent.name} />
  }

  // Planner는 arm_stretching 모델 사용 (반대 방향)
  if (agent.agentId === 'planner-1') {
    return <PlannerAgentModel position={position} agentName={agent.name} />
  }

  // Tool Agent는 jinu 모델 사용
  if (agent.agentId === 'tool-1') {
    return <ToolAgentModel position={position} agentName={agent.name} />
  }

  // 다른 에이전트들은 기존 방식 사용
  const color = agent.color || '#3b82f6'
  const scale = 1.25

  return (
    <group position={position}>
      {/* 머리 */}
      <mesh position={[0, 1.8 * scale, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4 * scale, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* 몸통 */}
      <mesh position={[0, 0.9 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5 * scale, 1.0 * scale, 0.3 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* 왼쪽 팔 */}
      <mesh position={[-0.45 * scale, 1.2 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2 * scale, 0.8 * scale, 0.2 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* 오른쪽 팔 */}
      <mesh position={[0.45 * scale, 1.2 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2 * scale, 0.8 * scale, 0.2 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* 왼쪽 다리 */}
      <mesh position={[-0.2 * scale, 0 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2 * scale, 0.9 * scale, 0.2 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* 오른쪽 다리 */}
      <mesh position={[0.2 * scale, 0 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2 * scale, 0.9 * scale, 0.2 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* 에이전트 이름 라벨 */}
      <Text
        position={[0, 2.8 * scale, 0]}
        fontSize={0.3}
        color="#e6edf3"
        anchorX="center"
        anchorY="bottom"
      >
        {agent.name}
      </Text>
    </group>
  )
}

// 고정된 에이전트들 (항상 office_room에 배치)
const FIXED_AGENTS: readonly Agent[] = [
  {
    agentId: 'orch-1',
    name: 'Orchestrator',
    agentType: 'Orchestrator',
    status: 'running',
    color: '#00ff88',
    tokenRate: 95,
  },
  {
    agentId: 'planner-1',
    name: 'Planner',
    agentType: 'Planner',
    status: 'running',
    color: '#3b82f6',
    tokenRate: 75,
  },
  {
    agentId: 'executor-1',
    name: 'Executor',
    agentType: 'Executor',
    status: 'running',
    color: '#f59e0b',
    tokenRate: 82,
  },
  {
    agentId: 'tool-1',
    name: 'Tool Agent',
    agentType: 'Tool',
    status: 'running',
    color: '#10b981',
    tokenRate: 68,
  },
]

// 고정 에이전트들의 배치 위치 (office_room 내부)
const AGENT_POSITIONS: Record<string, [number, number, number]> = {
  'orch-1': [12, 0.5, 5],
  'planner-1': [8, 0.5, 3],
  'executor-1': [3, 0.5, 2],  // 오른쪽으로 계속 이동
  'tool-1': [-8, 0.5, 2],  // 뒤로 이동
}

function OfficeRoomModel() {
  const { scene } = useGLTF('/models/office_room/scene.gltf')
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    // 숨길 메시를 찾아서 처리
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase()
        // 천장/지붕 관련 이름을 가진 메시 숨기기
        if (
          name.includes('roof') ||
          name.includes('ceiling') ||
          name.includes('top') ||
          name.includes('dome') ||
          name.includes('cover')
        ) {
          child.visible = false
        }
      }
    })
  }, [scene])

  return (
    <group ref={groupRef} scale={2} position={[0, -1, 0]}>
      <primitive object={scene} />
      {/* 고정된 에이전트들만 렌더링 */}
      <Suspense fallback={null}>
        {FIXED_AGENTS.map((agent) => {
          const position = AGENT_POSITIONS[agent.agentId] || [-22, 0.5, -5.95]
          return <AgentMarker key={agent.agentId} agent={agent} position={position} />
        })}
      </Suspense>
      {/* Curtsy 데코레이션 모델 */}
      <Suspense fallback={null}>
        <CurtsyModel position={[7, 0, -5]} />
      </Suspense>
    </group>
  )
}

function CoordinateDisplay({ coordinates }: { coordinates: CoordinateDisplayState }) {
  if (!coordinates.visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #333333',
        padding: '8px 12px',
        borderRadius: '4px',
        color: '#00ff88',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div>X: {coordinates.x.toFixed(2)}</div>
      <div>Y: {coordinates.y.toFixed(2)}</div>
      <div>Z: {coordinates.z.toFixed(2)}</div>
    </div>
  )
}

function CoordinateTracker({ setCoordinates }: { setCoordinates: (coord: CoordinateDisplayState) => void }) {
  const { camera } = useThree()

  useFrame((state) => {
    const mouse = state.mouse
    const raycaster = new THREE.Raycaster()

    // Raycaster 설정
    raycaster.setFromCamera(mouse, camera)

    // 평면 생성 (바닥 Y=0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)

    // 좌표 업데이트
    setCoordinates({
      x: target.x,
      y: target.y,
      z: target.z,
      visible: true,
    })
  })

  return null
}

function OfficeRoomContent({ agents, setCoordinates }: OfficeRoomProps & { setCoordinates: (coord: CoordinateDisplayState) => void }) {
  const { camera } = useThree()

  useEffect(() => {
    // 반대 방향 대각선에서 보는 카메라 위치 (더 줌 아웃)
    camera.position.set(-40, 24, -40)
    camera.lookAt(0, 1, 0)
  }, [camera])

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[10, 8, 10]} intensity={1.6} />
      <CoordinateTracker setCoordinates={setCoordinates} />
      <Suspense fallback={null}>
        <OfficeRoomModel />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={false}
        autoRotateSpeed={0}
      />
    </>
  )
}

export default function OfficeRoom({ agents }: OfficeRoomProps) {
  const [coordinates, setCoordinates] = useState<CoordinateDisplayState>({
    x: 0,
    y: 0,
    z: 0,
    visible: false,
  })

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
        overflow: 'hidden',
        borderRadius: 4,
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OfficeRoomContent agents={agents} setCoordinates={setCoordinates} />
      </Canvas>
      <CoordinateDisplay coordinates={coordinates} />
    </div>
  )
}
