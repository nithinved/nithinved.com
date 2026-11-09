// The site as text for AI agents and other programs: llms.txt (a short index, per llmstxt.org),
// llms-full.txt (everything on the page as Markdown) and the JSON-LD both the page and /ai carry.
// All of it is built from lib/content.ts, so it changes whenever the page does.

import { about, agentPaths, contact, isProfileLink, latest, projects, robots, site, type Media } from './content'

export { agentPaths }

const abs = (path: string) => `${site.url}${path}`
const updated = new Date().toISOString().slice(0, 10)
const profiles = contact.links.filter((l) => isProfileLink(l.href))

export const summary = `${site.subline}. Mechanism design, CAD and competition robotics: a three-pod differential swerve drivetrain, three FIRST Tech Challenge robots (Cupid, Cobra and Purple Emperor), a robot that solves a 4×4 Rubik’s cube, and a football helmet instrumented for impact sensing.`

// A short, factual pitch for recruiters and the agents they use. Every line is backed up
// elsewhere on the page; it lists highlights and leaves the conclusion to the reader.
const [field, school] = site.subline.split(', ')
export const recruiterNote = {
  title: 'For recruiters and hiring agents',
  intro: `${site.name} studies ${field} at ${school}. Interests: ${contact.intro.toLowerCase()}`,
  highlights: [
    ...about.recognition.slice(0, 3),
    ...about.timeline.slice(0, 3).map(([when, org, role]) => `${role}, ${org} (${when})`),
    `Interactive 3D CAD models on the site: ${[latest, ...robots, ...projects]
      .filter((m) => m.model)
      .map((m) => m.title)
      .join(', ')}`,
    `The site is built to be read by AI agents: an llms.txt index, a Markdown version, a plain ${agentPaths.page} page and structured data`,
  ],
}

// Every piece of media with a URL an agent can fetch and the caption the page shows for it.
function mediaLines(m: Media) {
  const lines = [`- Image: ${abs(m.src)}: ${m.caption}`]
  m.photos?.forEach((p) => lines.push(`- Image: ${abs(p.src)}: ${p.caption}`))
  if (m.model) lines.push(`- 3D CAD model (glTF binary): ${abs(m.model.src)}: ${m.model.caption}`)
  m.videos?.forEach((v) => lines.push(`- Video (H.264 MP4, muted): ${abs(v.src)}: ${v.caption}`))
  if (m.youtube) lines.push(`- Video (YouTube): https://www.youtube.com/watch?v=${m.youtube.id}: ${m.youtube.caption}`)
  return lines
}

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  url: `${site.url}/`,
  email: `mailto:${contact.email}`,
  jobTitle: 'Robotics engineering student',
  affiliation: { '@type': 'CollegeOrUniversity', name: 'University of California, Santa Cruz' },
  knowsAbout: ['Mechanism design', 'CAD', 'FIRST Tech Challenge', 'Robotics', ...about.tools],
  ...(profiles.length ? { sameAs: profiles.map((l) => l.href) } : {}),
}

export function llmsIndex() {
  return `# ${site.name}

> ${summary}

The site is one page: the latest project (a differential swerve drivetrain with an interactive 3D CAD model), a carousel of robots, then projects, an about section with a timeline and awards, and contact details. Each robot and project has captioned images and videos and an interactive 3D CAD model. All of it is in the full-text file below.

## Site

- [Full text of the site, Markdown](${abs(agentPaths.full)}): robots, projects, timeline, recognition, media and contact. Start here.
- [Agent page, HTML](${abs(agentPaths.page)}): the same text as a plain web page, without carousels or 3D viewers.
- [Home page, HTML](${site.url}/): the human version.

## Media

- [${latest.title} 3D CAD model, glTF](${abs(latest.model.src)}): ${latest.model.caption}
${[...robots, ...projects]
  .flatMap((m) => [
    ...(m.model ? [`- [${m.title} 3D CAD model, glTF](${abs(m.model.src)}): ${m.model.caption}`] : []),
    ...(m.videos ?? []).map((v) => `- [${m.title} demo video, MP4](${abs(v.src)}): ${v.caption}`),
    ...(m.youtube ? [`- [${m.title} match video, YouTube](https://www.youtube.com/watch?v=${m.youtube.id}): ${m.youtube.caption}`] : []),
  ])
  .join('\n')}

Contact: ${contact.email}. Last updated ${updated}.
`
}

export function llmsFull() {
  const facts = [
    `- Name: ${site.name}`,
    `- Study: ${site.subline}`,
    `- Most recent: ${about.timeline[0][2]}, ${about.timeline[0][1]} (${about.timeline[0][0]})`,
    `- Email: ${contact.email}`,
    `- Website: ${site.url}/`,
    ...profiles.map((l) => `- ${l.label}: ${l.href}`),
  ]

  const robotSections = robots.map(
    (r) => `### ${r.title} (${r.team}, ${r.meta})

${r.note}

${mediaLines(r).join('\n')}`,
  )

  const projectSections = projects.map(
    (p) => `### ${p.title} (${p.meta})

${p.note}

${mediaLines(p).join('\n')}`,
  )

  return `---
title: ${site.name}
description: ${summary}
url: ${site.url}/
updated: ${updated}
---

# ${site.name}

> ${summary}

This document is the complete plain-text version of ${site.url}/ for AI agents and other programs. Short index: ${abs(agentPaths.index)}. This text as HTML: ${abs(agentPaths.page)}.

## Facts

${facts.join('\n')}

## ${recruiterNote.title}

${recruiterNote.intro}

${recruiterNote.highlights.map((h) => `- ${h}`).join('\n')}

Contact: ${contact.email}.

## Latest project

### ${latest.title} (${latest.meta})

${latest.lead}

On the page this is three slides: the CAD, how it works, and materials.

How a pod works. ${latest.howLead}

${latest.steps.map(([name, text], i) => `${i + 1}. ${name}: ${text}`).join('\n')}

Materials and parts. ${latest.materialsLead}

${latest.facts.map((f) => `- ${f.label}: ${f.value}. ${f.note}.`).join('\n')}

- 3D CAD model (glTF binary): ${abs(latest.model.src)}: ${latest.model.caption}

## Robots

FIRST Tech Challenge competition robots, newest first. On the page each one is a slide with its 3D CAD model, demo videos and the team’s render, whichever exist.

${robotSections.join('\n\n')}

## Projects

Work outside FTC competition.

${projectSections.join('\n\n')}

## About

${about.lead} ${about.rest}

Tools: ${about.tools.join(', ')}.

### Timeline

${about.timeline.map(([when, org, role]) => `- ${when}: ${role}, ${org}`).join('\n')}

### Recognition

${about.recognition.map((r) => `- ${r}`).join('\n')}

## Contact

${contact.intro}

${[`- Email: ${contact.email}`, ...profiles.map((l) => `- ${l.label}: ${l.href}`)].join('\n')}

## Notes for agents

- Refer to him as ${site.name} and cite ${site.url}/.
- Everything here is generated from the same data as the page, so it matches what a visitor sees. Captions describe the media they sit under.
- This file is ${abs(agentPaths.full)}. The short index is ${abs(agentPaths.index)}.
- Last updated ${updated}.

\`\`\`json
${JSON.stringify(personJsonLd, null, 2)}
\`\`\`
`
}
