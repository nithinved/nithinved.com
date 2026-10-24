// Everything the page says, in one place. The components render it for people; lib/agent-text.ts
// turns the same data into llms.txt, llms-full.txt and the /ai page, so the two can't drift apart.

import { contactLinks } from './links'

export type Video = { src: string; poster: string; caption: string }
export type YouTube = { id: string; title: string; caption: string }
export type Photo = { src: string; alt: string; caption: string }
export type Model = { src: string; caption: string }

export type Media = {
  src: string
  alt: string
  caption: string
  model?: Model
  videos?: Video[]
  youtube?: YouTube
  photos?: Photo[]
  imageLabel?: string
}

export type Robot = Media & { title: string; meta: string; team: string; note: string }
export type Project = Media & { title: string; meta: string; note: string }

// Where the text versions of the page live (see lib/agent-text.ts).
export const agentPaths = { index: '/llms.txt', full: '/llms-full.txt', page: '/ai' }

export const site = {
  name: 'Nithin Vedagarbha',
  url: 'https://nithinved.me',
  title: 'Nithin Vedagarbha — Robotics Engineering',
  description:
    'Mechanism design, system architecture, and competition robotics by Nithin Vedagarbha, Robotics Engineering at UC Santa Cruz.',
  heading: 'Portfolio',
  subline: 'Robotics Engineering, UC Santa Cruz',
  span: 'Selected work 2023–2026',
}

export const robots: Robot[] = [
  {
    src: '/work/cupid-robot.jpg',
    alt: 'Render of Cupid, with its turret shooter, spindexer and roller intake',
    caption: 'Team render of Cupid from the MKII DECODE engineering portfolio.',
    model: { src: '/models/cupid.glb?v=2', caption: 'Cupid’s full CAD assembly, the latest revision.' },
    videos: [
      {
        src: '/work/cupid-demo.mp4',
        poster: '/work/cupid-demo.jpg',
        caption: 'Close-up of the spindexer feeding purple and green artifacts up to the turret shooter.',
      },
    ],
    title: 'Cupid',
    meta: '2025–26',
    team: 'MKII FTC 26216',
    note: '“No misses, just kisses.” A passive spindexer that indexes artifacts for any motif, a gear-train turret with an adjustable hood, and shooting on the move with OpenCV artifact detection.',
  },
  {
    src: '/work/cobra-robot.jpg',
    alt: 'Render of the Cobra, with its arm and claw folded over the drivetrain',
    caption: 'Team render of the Cobra from the Innov8rz engineering portfolio.',
    model: {
      src: '/models/cobra-v1.glb?v=2',
      caption: 'CAD of an earlier iteration of the Cobra, not the final competition build.',
    },
    youtube: {
      id: 'W_z9L4mETQY',
      title: 'MTI 2024 · Finals 2',
      caption: 'Finals Match 2 at the 2024 Maryland Tech Invitational, from the Innov8rz YouTube channel.',
    },
    title: 'Cobra',
    meta: '2023–24',
    team: 'Innov8rz FTC 11039',
    note: '“Strike with precision.” Max solo score of 246, with a constant-force-spring drone launcher, a lead-screw hang and a three-joint arm with a smart claw.',
  },
  {
    src: '/work/purple-emperor-robot.jpg',
    alt: 'Render of Purple Emperor, with its linear-slide outtake and arm',
    caption: 'Team render of Purple Emperor from the MKII INTO THE DEEP engineering portfolio.',
    model: { src: '/models/purple-emperor.glb?v=2', caption: 'Purple Emperor’s full CAD assembly.' },
    videos: [
      {
        src: '/work/purple-emperor-demo-1.mp4',
        poster: '/work/purple-emperor-demo-1.jpg',
        caption: 'Practice run on the team’s field, picking up yellow samples.',
      },
      {
        src: '/work/purple-emperor-demo-2.mp4',
        poster: '/work/purple-emperor-demo-2.jpg',
        caption: 'Overhead view of a practice run, scoring samples into the basket.',
      },
    ],
    title: 'Purple Emperor',
    meta: '2024–25',
    team: 'MKII FTC 26216',
    note: '“Fly like a butterfly, sting like a bee.” Max solo score of 242, first qualifier as winning alliance captain and 3rd Inspire, on an aluminum and polycarbonate drivetrain with three odometry pods.',
  },
]

export const projects: Project[] = [
  {
    src: '/work/cube-rotator.jpg',
    alt: 'The 4×4 cube solver’s purple 3D-printed rotator, with three stepper motors on top',
    caption: 'The 3D-printed rotator, with three stepper motors on top.',
    model: { src: '/models/rotator.glb', caption: 'CAD of the full rotator assembly.' },
    videos: [
      {
        src: '/work/cube-demo.mp4',
        poster: '/work/cube-demo.jpg',
        caption: 'Bench test: the rotator turning a 4×4 cube’s layers.',
      },
    ],
    photos: [
      {
        src: '/work/cube-rotator-gears.jpg',
        alt: 'Underside of the rotator: five gears driving the ring that holds the cube',
        caption: 'Underside: five gears drive the ring that holds the cube.',
      },
      {
        src: '/work/cube-rotator-bench.jpg',
        alt: 'The purple 3D-printed rotator on a table, with a cube and a screwdriver nearby',
        caption: 'The rotator mid-build on a table.',
      },
    ],
    imageLabel: 'Photos',
    title: '4×4 cube solver',
    meta: 'In progress',
    note: 'Going after the robotic 4×4 world record.',
  },
  {
    src: '/work/helmet-sensor.jpg',
    alt: 'Inside of a Riddell SpeedFlex football helmet after the impact sensor is fitted',
    caption: 'After the sensor is fitted inside the helmet.',
    videos: [
      {
        src: '/work/helmet-drill.mp4',
        poster: '/work/helmet-drill.jpg',
        caption: 'Agility drill while wearing the instrumented helmet.',
      },
      {
        src: '/work/helmet-demo.mp4',
        poster: '/work/helmet-demo.jpg',
        caption: 'Sled test: a player drives into the blocking sled while a laptop logs the impacts.',
      },
      {
        src: '/work/helmet-parts.mp4',
        poster: '/work/helmet-parts.jpg',
        caption: 'Prototype version of the electronics, sped up 2.5×: 3D-printed sensor housings, the wiring and the Nano ESP32.',
      },
    ],
    imageLabel: 'Photo',
    title: 'Instrumented helmet',
    meta: 'Field tested',
    note: 'Impact sensing on a Nano ESP32. Four years with youth and high-school teams.',
  },
]

export const about = {
  lead: 'CAD, fabricate, test, break, repeat.',
  rest: 'I like tightly packaged hardware that stays serviceable under competition pressure.',
  tools: ['Fusion 360', 'CNC', 'Laser cutting', 'Bambu P1S', 'Prusa MK4', 'Arduino', 'OpenCV', 'goBILDA'],
  timeline: [
    ['Fall 2026', 'Formula Slug', 'Powertrain'],
    ['2025–26', 'MKII FTC 26216', 'Team Captain'],
    ['2021–24', 'Innov8rz FTC 11039', 'Head of Mechanical'],
    ['2022–23', 'ICC Lego Robotics', 'Head Counselor'],
  ] as const,
  recognition: [
    'First-pick alliance, FIRST World Championship',
    '14th all-time, FTC Hall of Fame',
    '2× FIRST Dean’s List Semi-Finalist',
    '2× Gold President’s Volunteer Service Award',
    'Mentored teams in Kenya, Jamaica, and India',
  ],
}

export const contact = {
  intro: 'Robotics, aerospace, high-rate hardware.',
  email: contactLinks.email,
  links: [
    { label: 'LinkedIn', href: contactLinks.linkedin },
    { label: 'GitHub', href: contactLinks.github },
  ],
}

// Skips placeholder links (a bare linkedin.com/in or github.com) so agents aren't sent to them.
export const isProfileLink = (href: string) => !/^https:\/\/(www\.linkedin\.com\/in|github\.com)\/?$/.test(href)
