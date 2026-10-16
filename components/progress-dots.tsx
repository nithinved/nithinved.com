'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const tones = {
  page: { track: 'bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/50', fill: 'bg-foreground' },
  media: { track: 'bg-white/30 group-hover/dot:bg-white/45', fill: 'bg-white' },
}

/**
 * Dashes that say "there's more here": the active one is longer and fills up as it goes.
 * Timed mode (`duration`) fills over that many ms, then calls `onDone` (pause with `paused`).
 * Tracked mode (`progress`, 0–1) follows something else, like a video's playback.
 */
export function ProgressDots({
  count,
  active,
  onSelect,
  label,
  itemLabel,
  duration,
  progress,
  paused,
  onDone,
  tone = 'page',
  className,
}: {
  count: number
  active: number
  onSelect: (index: number) => void
  label: string
  itemLabel?: (index: number) => string
  duration?: number
  progress?: number
  paused?: boolean
  onDone?: () => void
  tone?: keyof typeof tones
  className?: string
}) {
  const [still, setStill] = useState(false)
  useEffect(() => setStill(matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  const { track, fill } = tones[tone]

  return (
    <div role="tablist" aria-label={label} className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={itemLabel?.(i) ?? `${i + 1} of ${count}`}
          onClick={() => onSelect(i)}
          className="group/dot py-2"
        >
          <span
            className={cn(
              'relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300',
              i === active ? 'w-12' : 'w-6',
              track,
            )}
          >
            {i === active &&
              (duration !== undefined ? (
                <span
                  // Re-keyed per slide so the fill restarts from empty.
                  key={`${active}-${count}`}
                  onAnimationEnd={still ? undefined : onDone}
                  className={cn('absolute inset-0 origin-left rounded-full', fill)}
                  style={
                    still
                      ? undefined
                      : {
                          animation: `progress-fill ${duration}ms linear forwards`,
                          animationPlayState: paused ? 'paused' : 'running',
                        }
                  }
                />
              ) : (
                <span
                  className={cn('absolute inset-0 origin-left rounded-full transition-transform duration-300 ease-linear', fill)}
                  style={{ transform: `scaleX(${progress ?? 0})` }}
                />
              ))}
          </span>
        </button>
      ))}
    </div>
  )
}
