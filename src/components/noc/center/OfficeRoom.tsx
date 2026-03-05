'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

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
    </group>
  )
}

function OfficeRoomContent() {
  const { camera } = useThree()

  useEffect(() => {
    // 대각선 상단에서 내부를 한눈에 볼 수 있는 각도
    camera.position.set(12, 6, 12)
    camera.lookAt(5, 0, 0)
  }, [camera])

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[10, 8, 10]} intensity={1.6} />
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

export default function OfficeRoom() {
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
        <OfficeRoomContent />
      </Canvas>
    </div>
  )
}
