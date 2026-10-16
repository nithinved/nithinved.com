'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { ModelViewer } from './model-viewer'
import { ProgressDots } from './progress-dots'
import { Shot } from './primitives'
import { withBasePath } from '@/lib/base-path'
import type { Model, Photo, Video, YouTube } from '@/lib/content'
import { cn } from '@/lib/utils'

const PHOTO_MS = 4000
const dotsPill = 'absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-[5px] backdrop-blur-md'

const iconButton =
  'flex size-8 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground'

type View = 'demo' | 'match' | 'cad' | 'image'

// Square media slot: an interactive CAD model, demo video(s), a competition match, then the image (or a small
// gallery when there are extra photos) — whichever exist, with a toggle between them and a caption underneath
// for whatever is showing. Each heavy view mounts the first time it's shown, then stays mounted.
export function ProjectMedia({
  src,
  alt,
  caption,
  title,
  model,
  videos,
  youtube,
  photos,
  imageLabel = 'Render',
  priority,
}: {
  src: string
  alt: string
  caption: string
  title: string
  model?: Model
  videos?: Video[]
  youtube?: YouTube
  photos?: Photo[]
  imageLabel?: string
  priority?: boolean
}) {
  const views = [
    model ? (['cad', '3D CAD'] as const) : null,
    videos?.length ? (['demo', 'Demo'] as const) : null,
    youtube ? (['match', 'Match'] as const) : null,
    ['image', imageLabel] as const,
  ].filter((v) => v !== null)
  const [view, setView] = useState<View>(views[0][0])
  const [opened, setOpened] = useState<Set<View>>(() => new Set([views[0][0]]))
  const [clip, setClip] = useState(0)
  const [photo, setPhoto] = useState(0)
  const gallery = [{ src, alt, caption }, ...(photos ?? [])]

  const captions: Record<View, string | undefined> = {
    cad: model?.caption,
    demo: videos?.[clip]?.caption,
    match: youtube?.caption,
    image: gallery[photo].caption,
  }
  const captionLine = (
    <p aria-live="polite" className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
      {captions[view]}
    </p>
  )

  const shot = photos?.length ? (
    <Gallery photos={gallery} index={photo} onIndex={setPhoto} priority={priority && view === 'image'} />
  ) : (
    <Shot
      src={src}
      alt={alt}
      aspect="aspect-square"
      sizes="(min-width: 768px) 55vw, 100vw"
      priority={priority && view === 'image'}
    />
  )
  if (views.length === 1)
    return (
      <div>
        {shot}
        {captionLine}
      </div>
    )

  const show = (next: View) => {
    setView(next)
    setOpened((prev) => (prev.has(next) ? prev : new Set(prev).add(next)))
  }
  const slot = (key: View) => cn('aspect-square', view !== key && 'hidden')

  return (
    <div>
      <div className="relative">
        {videos?.length && opened.has('demo') ? (
          <DemoVideo
            videos={videos}
            index={clip}
            onIndex={setClip}
            label={`Demo video of ${title}`}
            className={slot('demo')}
          />
        ) : null}
        {youtube && opened.has('match') ? <YouTubeEmbed video={youtube} className={slot('match')} /> : null}
        {model && opened.has('cad') ? (
          <ModelViewer src={model.src} label={`Interactive 3D CAD model of ${title}`} className={slot('cad')} />
        ) : null}
        {view === 'image' && shot}
        <div
          role="group"
          aria-label="Media"
          className="absolute top-3 right-3 flex rounded-full border border-border bg-background/70 p-0.5 font-mono text-xs backdrop-blur-md"
        >
          {views.map(([key, text]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => show(key)}
              className={cn(
                'rounded-full px-3 py-1.5 transition-colors',
                view === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      {captionLine}
    </div>
  )
}

// Muted clips played back to back (looping), only while on screen, with a pause button.
// Nothing downloads until the slot scrolls into view. Reduced motion starts it paused.
function DemoVideo({
  videos,
  index,
  onIndex,
  label,
  className,
}: {
  videos: Video[]
  index: number
  onIndex: (index: number) => void
  label: string
  className?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const heldRef = useRef(false) // paused by the viewer, so scrolling back doesn't restart it
  const visibleRef = useRef(false)
  const mountedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const clip = videos[index]

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    heldRef.current = matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (entry.isIntersecting && !heldRef.current) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  // Keep playing across a clip change (but not on first mount, which the observer handles).
  useEffect(() => {
    setProgress(0)
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const v = ref.current
    if (v && visibleRef.current && !heldRef.current) v.play().catch(() => {})
  }, [index])

  // Picking a clip is a request to watch it, so it also lifts a manual pause.
  const pick = (next: number) => {
    heldRef.current = false
    onIndex(next)
  }
  const go = (step: number) => pick((index + step + videos.length) % videos.length)

  const toggle = () => {
    const v = ref.current
    if (!v) return
    heldRef.current = !v.paused
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-sm bg-card', className)}>
      <video
        ref={ref}
        src={withBasePath(clip.src)}
        poster={withBasePath(clip.poster)}
        aria-label={label}
        muted
        loop={videos.length === 1}
        playsInline
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (v.duration) setProgress(v.currentTime / v.duration)
        }}
        onEnded={() => onIndex((index + 1) % videos.length)}
        className="absolute inset-0 size-full object-cover"
      />
      {videos.length > 1 && (
        <ProgressDots
          tone="media"
          count={videos.length}
          active={index}
          onSelect={pick}
          label="Choose clip"
          itemLabel={(i) => `Clip ${i + 1} of ${videos.length}`}
          progress={progress}
          className={dotsPill}
        />
      )}
      <div className="absolute right-3 bottom-3 flex gap-2">
        {videos.length > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label="Previous video" className={iconButton}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        )}
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'} className={iconButton}>
          {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
        </button>
        {videos.length > 1 && (
          <button type="button" onClick={() => go(1)} aria-label="Next video" className={iconButton}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

// Shows the video's thumbnail; the YouTube player itself loads only once it's clicked.
function YouTubeEmbed({ video, className }: { video: YouTube; className?: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={cn('relative w-full overflow-hidden rounded-sm bg-black', className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-x-0 top-1/2 aspect-video w-full -translate-y-1/2"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${video.title} on YouTube`}
          className="group absolute inset-0 size-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
            alt=""
            loading="lazy"
            className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md transition-transform group-hover:scale-105">
            <Play className="size-5 translate-x-px" aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  )
}

// One photo at a time with previous/next buttons; each image loads only when it's shown.
function Gallery({
  photos,
  index,
  onIndex,
  priority,
}: {
  photos: Photo[]
  index: number
  onIndex: (index: number) => void
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const photo = photos[index]
  const go = (step: number) => onIndex((index + step + photos.length) % photos.length)

  // Auto-advances only while on screen.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative">
      <Shot
        key={photo.src}
        src={photo.src}
        alt={photo.alt}
        aspect="aspect-square"
        sizes="(min-width: 768px) 55vw, 100vw"
        priority={priority && index === 0}
      />
      <ProgressDots
        tone="media"
        count={photos.length}
        active={index}
        onSelect={onIndex}
        label="Choose photo"
        itemLabel={(i) => `Photo ${i + 1} of ${photos.length}`}
        duration={PHOTO_MS}
        paused={!visible}
        onDone={() => go(1)}
        className={dotsPill}
      />
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={iconButton}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className={iconButton}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
