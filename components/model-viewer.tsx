'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react'
import type { MeshStandardMaterial, Vector3 } from 'three'
import { withBasePath } from '@/lib/base-path'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'loading' | 'ready' | 'error'

type Viewer = {
  reset: () => void
  setSpin: (on: boolean) => void
}

// Read a response body into one buffer, reporting progress as it goes.
async function readAll(res: Response, onProgress: (fraction: number | null) => void) {
  const total = Number(res.headers.get('content-length')) || 0
  if (!res.body) return res.arrayBuffer()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress(total ? Math.min(loaded / total, 1) : null)
  }
  const out = new Uint8Array(loaded)
  let at = 0
  for (const c of chunks) {
    out.set(c, at)
    at += c.length
  }
  return out.buffer
}

export function ModelViewer({ src, label, className }: { src: string; label: string; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState<number | null>(0)
  const [spin, setSpin] = useState(true)
  const [dims, setDims] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    const stage = stageRef.current
    if (!frame || !stage) return

    let disposed = false
    let visible = false
    let started = false
    let teardown = () => {}
    let setLoop: (on: boolean) => void = () => {}

    setCanFullscreen(typeof frame.requestFullscreen === 'function')

    // Plain wheel scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch) zooms. Fullscreen zooms freely.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && document.fullscreenElement !== frame) e.stopPropagation()
    }
    frame.addEventListener('wheel', onWheel, { capture: true })

    async function start() {
      setPhase('loading')
      const [THREE, { OrbitControls }, { GLTFLoader }, { RoomEnvironment }, { MeshoptDecoder }] = await Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
        import('three/addons/libs/meshopt_decoder.module.js'),
      ])
      if (disposed || !stage) return

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.6
      renderer.domElement.className = 'block size-full outline-none'
      stage.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const room = new RoomEnvironment()
      const envMap = pmrem.fromScene(room, 0.04).texture
      scene.environment = envMap

      // Kept low: most of the CAD is light-grey plate, which washes out to white under brighter light.
      const key = new THREE.DirectionalLight(0xffffff, 0.7)
      key.position.set(1, 2, 1.5)
      const rim = new THREE.DirectionalLight(0xffffff, 0.25)
      rim.position.set(-1.5, 1, -2)
      scene.add(key, rim)

      const camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100)
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches
      controls.autoRotateSpeed = 1 // one turn every ~60 s at 60 fps
      controls.screenSpacePanning = true
      controls.cursorStyle = 'grab'
      setSpin(controls.autoRotate)

      // Let vertical swipes keep scrolling the page on touch screens; sideways drags rotate the model.
      const syncTouch = () => {
        renderer.domElement.style.touchAction = document.fullscreenElement === frame ? 'none' : 'pan-y'
      }
      syncTouch()

      // Stop spinning as soon as someone takes hold of the model.
      controls.addEventListener('start', () => {
        controls.autoRotate = false
        setSpin(false)
      })

      let home: { pos: Vector3; target: Vector3 } | null = null
      let dirty = true

      const resize = () => {
        const w = stage.clientWidth
        const h = stage.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        dirty = true
      }
      const ro = new ResizeObserver(resize)
      ro.observe(stage)
      resize()

      // Only draw while on screen, and only when the view actually changed.
      setLoop = (on) =>
        renderer.setAnimationLoop(
          on
            ? () => {
                if (controls.update() || dirty) {
                  renderer.render(scene, camera)
                  dirty = false
                }
              }
            : null,
        )
      setLoop(visible)

      const onFullscreen = () => {
        setFullscreen(document.fullscreenElement === frame)
        syncTouch()
      }
      document.addEventListener('fullscreenchange', onFullscreen)

      viewerRef.current = {
        reset: () => {
          if (!home) return
          camera.position.copy(home.pos)
          controls.target.copy(home.target)
          controls.update()
          dirty = true
        },
        setSpin: (on) => {
          controls.autoRotate = on
          setSpin(on)
        },
      }

      teardown = () => {
        renderer.setAnimationLoop(null)
        ro.disconnect()
        document.removeEventListener('fullscreenchange', onFullscreen)
        controls.dispose()
        scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose()
            const mats = Array.isArray(o.material) ? o.material : [o.material]
            mats.forEach((m) => m.dispose())
          }
        })
        envMap.dispose()
        room.dispose()
        pmrem.dispose()
        renderer.dispose()
        renderer.domElement.remove()
        viewerRef.current = null
      }

      const res = await fetch(withBasePath(src))
      if (!res.ok) throw new Error(`${src} returned HTTP ${res.status}`)
      const buffer = await readAll(res, setProgress)
      if (disposed) return

      const loader = new GLTFLoader()
      loader.setMeshoptDecoder(MeshoptDecoder)
      const gltf = await loader.parseAsync(buffer, '')
      if (disposed) return

      const model = gltf.scene
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return
        // The CAD export has no normals: shade each facet from screen-space derivatives for crisp edges.
        const m = o.material as MeshStandardMaterial
        m.flatShading = true
        m.side = THREE.DoubleSide
        m.envMapIntensity = 0.35
        m.needsUpdate = true
      })

      // Center the model and frame the camera to its size.
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      model.position.sub(box.getCenter(new THREE.Vector3()))
      scene.add(model)

      const radius = size.length() / 2
      const dist = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 0.95
      home = {
        pos: new THREE.Vector3(1, 0.55, 1.2).normalize().multiplyScalar(dist),
        target: new THREE.Vector3(),
      }
      camera.near = dist / 200
      camera.far = dist * 20
      camera.updateProjectionMatrix()
      controls.minDistance = radius * 0.2
      controls.maxDistance = dist * 4
      viewerRef.current?.reset()

      const mm = (v: number) => Math.round(v * 1000)
      setDims(`${mm(size.x)} × ${mm(size.z)} × ${mm(size.y)} mm`)
      setPhase('ready')
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !started) {
          started = true
          start().catch((err) => {
            console.error(err)
            if (!disposed) setPhase('error')
          })
        }
        setLoop(visible)
      },
      { rootMargin: '200px' },
    )
    io.observe(frame)

    return () => {
      disposed = true
      io.disconnect()
      frame.removeEventListener('wheel', onWheel, { capture: true })
      teardown()
    }
  }, [src])

  const toggleFullscreen = () => {
    const frame = frameRef.current
    if (!frame) return
    const p = document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen()
    p?.catch(() => setCanFullscreen(false))
  }

  const iconButton =
    'flex size-8 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground'

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative w-full overflow-hidden rounded-sm bg-card bg-[radial-gradient(90%_80%_at_50%_40%,oklch(0.22_0.004_260),transparent)] [&:fullscreen]:rounded-none [&:fullscreen]:bg-background',
        className,
      )}
    >
      <div
        ref={stageRef}
        role="img"
        aria-label={label}
        className={cn(
          'absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none',
          phase === 'ready' ? 'opacity-100' : 'opacity-0',
        )}
      />

      {phase !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" aria-live="polite">
          {phase === 'error' ? (
            <p className="max-w-60 text-center font-mono text-xs text-muted-foreground">
              Couldn’t load the 3D model in this browser.
            </p>
          ) : (
            <>
              <div className="h-px w-40 overflow-hidden bg-border">
                <div
                  className="h-full bg-signal transition-[width] duration-150 ease-linear"
                  style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
                />
              </div>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                Loading CAD{progress !== null && progress > 0 ? ` ${Math.round(progress * 100)}%` : ''}
              </p>
            </>
          )}
        </div>
      )}

      {phase === 'ready' && (
        <>
          <p className="pointer-events-none absolute bottom-5 left-4 font-mono text-xs text-muted-foreground tabular-nums sm:top-4 sm:bottom-auto">
            {dims}
          </p>
          <p className="pointer-events-none absolute bottom-4 left-4 hidden font-mono text-xs text-muted-foreground sm:block">
            <span className="pointer-coarse:hidden">Drag to rotate · Ctrl/⌘ + scroll to zoom</span>
            <span className="hidden pointer-coarse:inline">Swipe to rotate · Pinch to zoom</span>
          </p>
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button
              type="button"
              onClick={() => viewerRef.current?.setSpin(!spin)}
              aria-pressed={spin}
              aria-label={spin ? 'Pause rotation' : 'Auto-rotate'}
              className={iconButton}
            >
              {spin ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => viewerRef.current?.reset()}
              aria-label="Reset view"
              className={iconButton}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </button>
            {canFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className={iconButton}
              >
                {fullscreen ? (
                  <Minimize2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <Maximize2 className="size-3.5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
