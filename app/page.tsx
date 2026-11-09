import { Hero } from '@/components/hero'
import { Latest } from '@/components/latest'
import { Work } from '@/components/work'
import { Projects } from '@/components/projects'
import { About } from '@/components/about'
import { Contact } from '@/components/contact'
import { ViewSwitch } from '@/components/view-switch'

export default function Page() {
  return (
    <ViewSwitch>
      <main className="mx-auto max-w-7xl px-5 md:px-8">
        <Hero />
        <Latest />
        <Work />
        <Projects />
        <About />
        <Contact />
      </main>
    </ViewSwitch>
  )
}
