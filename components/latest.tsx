import { ModelViewer } from './model-viewer'
import { Label } from './primitives'
import { Scramble } from './scramble'
import { latest } from '@/lib/content'

export function Latest() {
  return (
    <section id="latest" aria-labelledby="latest-title" className="pb-32 md:pb-48">
      <div className="mb-12 flex items-baseline justify-between md:mb-16">
        <h2 id="latest-title" className="text-2xl font-medium tracking-tight">
          <Scramble text="Latest project" />
        </h2>
        <Label>Current</Label>
      </div>

      <article className="grid items-start gap-10 md:grid-cols-[5fr_6fr] md:gap-16">
        <div className="order-2 flex flex-col gap-10 md:order-1">
          <div className="flex flex-col gap-4">
            <h3 className="text-balance text-4xl font-medium tracking-tight md:text-6xl">
              <Scramble text={latest.title} />
            </h3>
            <p className="font-mono text-xs text-muted-foreground">{latest.meta}</p>
            <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">{latest.lead}</p>
          </div>

          <div className="flex flex-col gap-4">
            <Label>How a pod works</Label>
            <ol className="flex flex-col">
              {latest.steps.map(([name, text], i) => (
                <li key={name} className="grid grid-cols-[2rem_1fr] gap-x-2 border-t py-4 text-sm">
                  <span className="font-mono text-xs leading-5 text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{name}</span>
                    <span className="max-w-md text-pretty leading-relaxed text-muted-foreground">{text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-4">
            <Label>Build</Label>
            <dl className="flex flex-col">
              {latest.facts.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[7.5rem_1fr] gap-4 border-t py-3 text-sm">
                  <dt className="font-mono text-xs leading-5 text-muted-foreground">{term}</dt>
                  <dd className="max-w-md text-pretty">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="order-1 md:sticky md:top-24 md:order-2">
          <ModelViewer
            src={latest.model.src}
            azimuth={latest.model.azimuth}
            elevation={latest.model.elevation}
            label={`Interactive 3D CAD model of the ${latest.title.toLowerCase()}`}
            className="aspect-square"
          />
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{latest.model.caption}</p>
        </div>
      </article>
    </section>
  )
}
