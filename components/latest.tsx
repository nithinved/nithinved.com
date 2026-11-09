import { Carousel } from './carousel'
import { ModelViewer } from './model-viewer'
import { Label } from './primitives'
import { Scramble } from './scramble'
import { latest } from '@/lib/content'

const SLIDE_MS = 9000
const slides = ['CAD', 'How it works', 'Materials']

// A pod seen from above: the ring, the wheel, and the arrows for what the motors are doing.
// `turn` spins the whole pod, `roll` rolls the wheel; both together is the blend.
function PodDiagram({ turn, roll }: { turn?: boolean; roll?: boolean }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className="size-24 shrink-0 text-muted-foreground">
      <circle cx="48" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <g transform="rotate(25 48 48)">
        <rect x="40" y="27" width="16" height="42" rx="3" fill="currentColor" opacity="0.85" />
        {roll && (
          <g className="text-signal" stroke="currentColor" fill="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="70" y1="66" x2="70" y2="32" />
            <polygon points="70,22 64,33 76,33" stroke="none" />
          </g>
        )}
      </g>
      {turn && (
        <g className="text-signal" stroke="currentColor" fill="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M 8.5 33.6 A 42 42 0 0 1 62.4 8.5" fill="none" />
          <polygon points="68,10.6 61.2,11.8 63.6,5.2" stroke="none" />
        </g>
      )}
    </svg>
  )
}

const diagrams = [{ turn: true }, { roll: true }, { turn: true, roll: true }]

export function Latest() {
  return (
    <section id="latest" aria-labelledby="latest-title" className="pb-32 md:pb-48">
      <div className="mb-12 flex items-baseline justify-between md:mb-16">
        <h2 id="latest-title" className="text-2xl font-medium tracking-tight">
          <Scramble text="Latest project" />
        </h2>
        <Label>Current</Label>
      </div>

      <Carousel
        label="Latest project"
        slideLabels={slides}
        slideMs={SLIDE_MS}
        dotsLabel="Choose slide"
        previousLabel="Previous slide"
        nextLabel="Next slide"
      >
        {/* 1. The CAD */}
        <div className="grid w-full items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
          <div className="order-2 flex flex-col gap-4 md:order-1">
            <span className="font-mono text-xs text-muted-foreground">01 / 03 · CAD</span>
            <h3 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">
              <Scramble text={latest.title} />
            </h3>
            <p className="font-mono text-xs text-muted-foreground">{latest.meta}</p>
            <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{latest.lead}</p>
          </div>
          <div className="order-1 md:order-2">
            <ModelViewer
              src={latest.model.src}
              azimuth={latest.model.azimuth}
              elevation={latest.model.elevation}
              center={latest.model.center}
              exposure={latest.model.exposure}
              label={`Interactive 3D CAD model of the ${latest.title.toLowerCase()}`}
              className="aspect-square"
            />
            <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{latest.model.caption}</p>
          </div>
        </div>

        {/* 2. How it works */}
        <div className="grid w-full items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-muted-foreground">02 / 03 · How it works</span>
            <h3 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">How a pod works</h3>
            <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{latest.howLead}</p>
          </div>
          <ol className="flex flex-col">
            {latest.steps.map(([name, text], i) => (
              <li key={name} className="grid grid-cols-[auto_1fr] items-center gap-x-6 border-t py-5 first:border-t-0 md:py-6">
                <PodDiagram {...diagrams[i]} />
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xl font-medium tracking-tight">{name}</span>
                  <span className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 3. Materials */}
        <div className="grid w-full items-center gap-8 md:grid-cols-[5fr_6fr] md:gap-16">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-muted-foreground">03 / 03 · Materials</span>
            <h3 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">Materials and parts</h3>
            <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{latest.materialsLead}</p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-sm border bg-border sm:grid-cols-2">
            {latest.facts.map((f, i) => (
              <div
                key={f.label}
                className={`flex flex-col gap-1 bg-background p-5 ${i === latest.facts.length - 1 && latest.facts.length % 2 ? 'sm:col-span-2' : ''}`}
              >
                <dt className="order-2 font-mono text-xs text-muted-foreground">{f.label}</dt>
                <dd className="order-1 text-balance text-2xl font-medium tracking-tight md:text-3xl">{f.value}</dd>
                <dd className="order-3 mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">{f.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Carousel>
    </section>
  )
}
