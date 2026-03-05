'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Text, useAnimations, Grid } from '@react-three/drei'
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

// Verifier Agent - Curtsy 모델 (애니메이션 포함)
function VerifierAgentModel({ position, agentName }: { position: [number, number, number]; agentName: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/models/curtsy/scene.gltf')
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf])
  const { actions } = useAnimations(gltf.animations, groupRef)

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
      <primitive object={clonedScene} />
      <Text position={[0, 2.2, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agentName}
      </Text>
    </group>
  )
}

// agentType 기반 모델 매핑 (ID가 아닌 타입으로 결정)
function AgentMarker({ agent, position }: { agent: Agent; position: [number, number, number] }) {
  const type = agent.agentType.toLowerCase()

  if (type === 'orchestrator') {
    return <OrchestratorIronManModel position={position} agentName={agent.name} />
  }
  if (type === 'planner') {
    return <PlannerAgentModel position={position} agentName={agent.name} />
  }
  if (type === 'executor') {
    return <ExecutorGirModel position={position} agentName={agent.name} />
  }
  if (type === 'tool') {
    return <ToolAgentModel position={position} agentName={agent.name} />
  }
  if (type === 'verifier') {
    return <VerifierAgentModel position={position} agentName={agent.name} />
  }

  // 알 수 없는 타입은 기본 박스 모델
  const color = agent.color || '#3b82f6'
  const scale = 1.25

  return (
    <group position={position}>
      <mesh position={[0, 1.8 * scale, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.4 * scale, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.9 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5 * scale, 1.0 * scale, 0.3 * scale]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[0, 2.8 * scale, 0]} fontSize={0.3} color="#e6edf3" anchorX="center" anchorY="bottom">
        {agent.name}
      </Text>
    </group>
  )
}

// 에이전트 동적 배치 위치 계산 (office_room 내부, 최대 12개)
const SLOT_POSITIONS: readonly [number, number, number][] = [
  [12, 0.5, 5],     // 중앙 앞 (orchestrator 기본)
  [8, 0.5, 3],      // 중앙 좌
  [3, 0.5, 2],      // 좌측
  [-3, 0.5, 2],     // 좌측 뒤
  [-8, 0.5, 2],     // 뒤
  [-8, 0.5, -3],    // 뒤쪽 좌
  [12, 0.5, -2],    // 앞쪽 우
  [8, 0.5, -3],     // 중앙 우
  [3, 0.5, -4],     // 좌측 뒤
  [-3, 0.5, -4],    // 뒤쪽
  [0, 0.5, 5],      // 중앙 앞 좌
  [-5, 0.5, 5],     // 앞 좌측 끝
]

function OfficeRoomModel({ agents }: { agents: readonly Agent[] }) {
  const { scene } = useGLTF('/models/office_room/scene.gltf')
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase()
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
      {/* 동적 에이전트 렌더링 */}
      <Suspense fallback={null}>
        {agents.map((agent, index) => {
          const position = SLOT_POSITIONS[index % SLOT_POSITIONS.length]
          return <AgentMarker key={agent.agentId} agent={agent} position={position} />
        })}
      </Suspense>
    </group>
  )
}

function CoordinateDisplay() {
  // 마우스 좌표 표시 비활성화
  return null
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
      <Grid args={[100, 100]} cellSize={2} cellColor="#1a1f35" sectionSize={10} sectionColor="#2a354a" fadeDistance={200} fadeStrength={0.3} infiniteGrid />
      <CoordinateTracker setCoordinates={setCoordinates} />
      <Suspense fallback={null}>
        <OfficeRoomModel agents={agents || []} />
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
      <CoordinateDisplay />
    </div>
  )
}
