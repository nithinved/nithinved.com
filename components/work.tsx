'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProgressDots } from './progress-dots'
import { ProjectMedia } from './project-media'
import { Scramble } from './scramble'
import { robots } from '@/lib/content'

const SLIDE_MS = 9000

export function Work() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  // Auto-advance pauses only while the carousel is fully off screen, and stops for good once
  // someone handles a slide's media (drags the model, plays the match) so it never yanks it away.
  const [visible, setVisible] = useState(false)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(section)
    return () => io.disconnect()
  }, [])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const next = (index + robots.length) % robots.length
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    setActive(Math.round(track.scrollLeft / track.clientWidth))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(active + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(active - 1)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-roledescription="carousel"
      aria-label="Robots"
      className="flex flex-col gap-8"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={() => setStopped(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        {robots.map((r, i) => (
          <article
            key={r.title}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${robots.length}: ${r.title}`}
            className="grid w-full shrink-0 snap-start items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16"
          >
            <div className="order-2 flex flex-col gap-4 md:order-1">
              <span className="font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, '0')} / {String(robots.length).padStart(2, '0')}
              </span>
              <h2 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">
                <Scramble text={r.title} />
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {r.team} · {r.meta}
              </p>
              <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{r.note}</p>
            </div>
            <div className="order-1 md:order-2">
              <ProjectMedia
                src={r.src}
                alt={r.alt}
                caption={r.caption}
                model={r.model}
                videos={r.videos}
                youtube={r.youtube}
                title={r.title}
                priority={i === 0}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <ProgressDots
          count={robots.length}
          active={active}
          onSelect={goTo}
          label="Choose robot"
          itemLabel={(i) => robots[i].title}
          duration={stopped ? undefined : SLIDE_MS}
          progress={1}
          paused={!visible}
          onDone={() => goTo(active + 1)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous robot"
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next robot"
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
