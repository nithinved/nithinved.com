import { Carousel } from './carousel'
import { ProjectMedia } from './project-media'
import { Scramble } from './scramble'
import { robots } from '@/lib/content'

const SLIDE_MS = 9000

export function Work() {
  return (
    <section id="work" aria-label="Robots">
      <Carousel
        label="Robots"
        slideLabels={robots.map((r) => r.title)}
        slideMs={SLIDE_MS}
        dotsLabel="Choose robot"
        previousLabel="Previous robot"
        nextLabel="Next robot"
      >
        {robots.map((r, i) => (
          <div key={r.title} className="grid w-full items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
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
          </div>
        ))}
      </Carousel>
    </section>
  )
}
