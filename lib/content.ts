// Everything the page says, in one place. The components render it for people; lib/agent-text.ts
// turns the same data into llms.txt, llms-full.txt and the /ai page, so the two can't drift apart.

import { contactLinks } from './links'

export type Video = { src: string; poster: string; caption: string }
export type YouTube = { id: string; title: string; caption: string }
export type Photo = { src: string; alt: string; caption: string }
// `azimuth` is where the viewer starts, in degrees round from +Z towards +X (default 28): each robot's side
// panel facing the camera, turned a little towards its front.
// `elevation` is how far above the model it starts, in degrees (default 18); flat models read better from higher up.
// `center` is the point (x, z, in metres in the file) the model sits and spins on, for when the middle of its
// bounding box isn't the middle of the robot (default: the box's middle).
export type Model = {
  src: string
  caption: string
  azimuth?: number
  elevation?: number
  center?: readonly [number, number]
  // Tone-mapping exposure; lower keeps light colours from washing out to white. Defaults to 0.6.
  exposure?: number
}

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

// The featured project at the top of the page, as three slides: the CAD, how it works, and how it should perform.
export type Latest = {
  title: string
  meta: string
  lead: string
  howLead: string
  steps: readonly (readonly [string, string])[]
  statsLead: string
  stats: readonly { value: string; label: string; note: string }[]
  model: Model
}

export const latest: Latest = {
  title: 'Differential swerve drive',
  meta: 'Three pods · two motors each',
  lead: 'A drivetrain that can point and drive in any direction. Each of its three pods steers and drives with the same two motors.',
  howLead: 'Every pod does both jobs, driving its wheel and steering it, with the same two motors.',
  steps: [
    ['Together', 'Both motors spin the same way and the pod turns, pointing its wheel in any direction.'],
    ['Against each other', 'The motors spin opposite ways and the wheel rolls.'],
    [
      'Blended',
      'Mix the two and the robot drives in any direction while it turns. Both motors always share the load, so neither sits idle during a straight drive.',
    ],
  ],
  statsLead: 'Projections from the CAD, the parts list and the motor specs, until it’s built and tested.',
  stats: [
    {
      value: '8–10 lb',
      label: 'Weight, drivetrain only',
      note: '3.5–4.5 kg. Estimated from the CAD and parts list, with the 6S battery, Pi and wiring included',
    },
    {
      value: '39 mph',
      label: 'Top speed, theoretical',
      note: '17.4 m/s. 380 KV at 22.2 V is about 8,400 rpm, geared down 1.93:1 onto a 76.2 mm wheel',
    },
    { value: '30 mph', label: 'Top speed, projected', note: 'About 85% of theoretical, after voltage sag and gear losses' },
    {
      value: '105 N',
      label: 'Force at the wheels',
      note: 'About 35 N per pod at 16 A per motor, with both motors in each pod pulling',
    },
    { value: '2.3 g', label: 'Motor-limited acceleration', note: 'About 90 N after losses, on a 4 kg robot' },
    {
      value: '0.8 g',
      label: 'Traction-limited acceleration',
      note: '0.6–1.0 g for urethane on hardwood or carpet. All three wheels are driven',
    },
    { value: '0.85 s', label: '0 to 15 mph', note: 'Over about 9 ft, at 0.8 g' },
  ],
  model: {
    src: '/models/swerve-drive.glb?v=5',
    caption: 'CAD of the full drivetrain: three pods on the chassis.',
    elevation: 32,
    // The middle of the three wheels: 30 mm off from the middle of the model's bounding box.
    center: [-0.105, -0.0606],
    // Darker than the robots so the taupe plates and red wheels read as they do in Fusion.
    exposure: 0.35,
  },
}

export const robots: Robot[] = [
  {
    src: '/work/cupid-robot.jpg',
    alt: 'Render of Cupid, with its turret shooter, spindexer and roller intake',
    caption: 'Team render of Cupid from the MKII DECODE engineering portfolio.',
    model: { src: '/models/cupid.glb?v=3', caption: 'Cupid’s full CAD assembly, the latest revision.', azimuth: 152 },
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
    src: '/work/purple-emperor-robot.jpg',
    alt: 'Render of Purple Emperor, with its linear-slide outtake and arm',
    caption: 'Team render of Purple Emperor from the MKII INTO THE DEEP engineering portfolio.',
    model: { src: '/models/purple-emperor.glb?v=3', caption: 'Purple Emperor’s full CAD assembly.', azimuth: 62 },
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
  {
    src: '/work/cobra-robot.jpg',
    alt: 'Render of the Cobra, with its arm and claw folded over the drivetrain',
    caption: 'Team render of the Cobra from the Innov8rz engineering portfolio.',
    model: {
      src: '/models/cobra-v1.glb?v=6',
      azimuth: -118,
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
