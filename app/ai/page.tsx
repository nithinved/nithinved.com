import type { Metadata } from 'next'
import { agentPaths, recruiterNote, summary } from '@/lib/agent-text'
import { withBasePath } from '@/lib/base-path'
import { about, contact, isProfileLink, latest, projects, robots, site, type Media } from '@/lib/content'

// The page as plain HTML for AI agents: no carousels, no 3D viewers, no animation, every caption written out.

export const metadata: Metadata = {
  title: `${site.name}, plain text`,
  description: `The plain-text version of ${site.url.replace('https://', '')} for AI agents: ${site.name}’s robots, projects, timeline, recognition and contact details.`,
  alternates: { canonical: `${site.url}${agentPaths.page}` },
}

function MediaList({ m }: { m: Media }) {
  const items = [
    { href: m.src, kind: 'Image', caption: m.caption },
    ...(m.photos ?? []).map((p) => ({ href: p.src, kind: 'Image', caption: p.caption })),
    ...(m.model ? [{ href: m.model.src, kind: '3D CAD model (glTF)', caption: m.model.caption }] : []),
    ...(m.videos ?? []).map((v) => ({ href: v.src, kind: 'Video (MP4)', caption: v.caption })),
    ...(m.youtube
      ? [{ href: `https://www.youtube.com/watch?v=${m.youtube.id}`, kind: 'Video (YouTube)', caption: m.youtube.caption }]
      : []),
  ]
  return (
    <ul>
      {items.map((i) => (
        <li key={i.href}>
          <a href={i.href.startsWith('/') ? withBasePath(i.href) : i.href}>{i.kind}</a>: {i.caption}
        </li>
      ))}
    </ul>
  )
}

export default function AgentPage() {
  const profiles = contact.links.filter((l) => isProfileLink(l.href))

  return (
    <main className="ai mx-auto max-w-[68ch] px-5 pt-10 pb-24 leading-relaxed">
      <p className="mb-10 border-b pb-6 text-sm text-muted-foreground">
        This is the plain-text version of <a href={withBasePath('/')}>{site.url.replace('https://', '')}</a> for AI
        agents. The same text as Markdown: <a href={withBasePath(agentPaths.full)}>llms-full.txt</a>; short index:{' '}
        <a href={withBasePath(agentPaths.index)}>llms.txt</a>.
      </p>

      <h1>{site.name}</h1>
      <p className="text-lg">{summary}</p>

      <h2>Facts</h2>
      <dl>
        <dt>Study</dt>
        <dd>{site.subline}</dd>
        <dt>Most recent</dt>
        <dd>
          {about.timeline[0][2]}, {about.timeline[0][1]} ({about.timeline[0][0]})
        </dd>
        <dt>Email</dt>
        <dd>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </dd>
        {profiles.map((l) => (
          <div key={l.label} className="contents">
            <dt>{l.label}</dt>
            <dd>
              <a href={l.href}>{l.href}</a>
            </dd>
          </div>
        ))}
      </dl>

      <h2>{recruiterNote.title}</h2>
      <p>{recruiterNote.intro}</p>
      <ul>
        {recruiterNote.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p>
        Contact: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>

      <h2>Latest project</h2>
      <section>
        <h3>
          {latest.title} ({latest.meta})
        </h3>
        <p>{latest.lead}</p>
        <p>On the page this is three slides: the CAD, how it works, and materials.</p>
        <p>How a pod works. {latest.howLead}</p>
        <ol>
          {latest.steps.map(([name, text]) => (
            <li key={name}>
              {name}: {text}
            </li>
          ))}
        </ol>
        <p>Projected performance. {latest.statsLead}</p>
        <ul>
          {latest.stats.map((f) => (
            <li key={f.label}>
              {f.label}: {f.value}. {f.note}.
            </li>
          ))}
          <li>
            <a href={withBasePath(latest.model.src)}>3D CAD model (glTF)</a>: {latest.model.caption}
          </li>
        </ul>
      </section>

      <h2>Robots</h2>
      <p>FIRST Tech Challenge competition robots, newest first.</p>
      {robots.map((r) => (
        <section key={r.title}>
          <h3>
            {r.title} ({r.team}, {r.meta})
          </h3>
          <p>{r.note}</p>
          <MediaList m={r} />
        </section>
      ))}

      <h2>Projects</h2>
      <p>Work outside FTC competition.</p>
      {projects.map((p) => (
        <section key={p.title}>
          <h3>
            {p.title} ({p.meta})
          </h3>
          <p>{p.note}</p>
          <MediaList m={p} />
        </section>
      ))}

      <h2>About</h2>
      <p>
        {about.lead} {about.rest}
      </p>
      <p>Tools: {about.tools.join(', ')}.</p>
      <h3>Timeline</h3>
      <ul>
        {about.timeline.map(([when, org, role]) => (
          <li key={org}>
            {when}: {role}, {org}
          </li>
        ))}
      </ul>
      <h3>Recognition</h3>
      <ul>
        {about.recognition.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <h2>Contact</h2>
      <p>{contact.intro}</p>
      <p>
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>
    </main>
  )
}
