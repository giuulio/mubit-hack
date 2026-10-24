// The site's own pages: About (the thesis and the architecture), FAQ, Privacy and License, plus the footer that links them.
import type { ReactNode } from 'react'
import { go, goInfo, infoPages, type Info } from './routes'
import { Schematic } from './Schematic'
import { RouteBadge } from './ui'

export function InfoPage({ page }: { page: Info }) {
  return page === 'about' ? <About /> : page === 'faq' ? <Faq /> : page === 'privacy' ? <Privacy /> : <License />
}

function Prose({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <article className="prose">
      <header className="stack" style={{ gap: '0.5rem' }}>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </header>
      {children}
    </article>
  )
}

function About() {
  return (
    <div className="about">
      <div className="stack hero">
        <h1 className="display-1">Rent what changes.<br />Own what lasts.</h1>
        <p className="lede">Hone routes every correction to <b className="ink-context">context</b>, <b className="ink-weights">weights</b> or <b className="ink-both">both</b>, on Mubit.</p>
      </div>
      <div className="schematic"><Schematic /></div>
      <div className="routes-explained">
        {([
          ['A', 'Rented: every call pays its tokens, but it changes the moment a lesson is routed. Parameters run in code for free.'],
          ['A∧B', 'Cheap and stable: kept in the prompt now, and trained into the weights from the calls Mubit keeps.'],
          ['B', 'Costly to state, like example icons: trained into the weights, then dropped from the prompt once the adapter holds it.'],
        ] as const).map(([route, text]) => (
          <div key={route} className="stack" style={{ gap: '0.5rem' }}><RouteBadge route={route} large /><p className="muted">{text}</p></div>
        ))}
      </div>
      <div className="prose" style={{ margin: '0 auto' }}>
        <h2>Models and contexts</h2>
        <p>A model is one Mubit task: one fixed system prompt and one fine-tuned adapter. Contexts are looks it serves, such as smooth, sharp or pixel icons, each with its own rules and examples in the user message. They share the model's weights, so only a lesson that holds in every context may go to them; a lesson about one look stays in that look's context.</p>
        <h2>Why every lesson starts in context</h2>
        <p>Mubit learns only from provider answers it keeps; there is no corrections API. So a lesson first has to make the provider answer correctly in context; the calls made under that context are what Mubit trains on.</p>
        <p className="faint">Built at Night Shift London, Mubit's hackathon, 23–25 October 2026.</p>
      </div>
    </div>
  )
}

const faqs: [string, ReactNode][] = [
  ['What is Hone?', 'A platform on top of Mubit that turns feedback on a model\'s outputs into lessons, and decides where each lesson should live: in the prompt, in the model\'s weights, or both.'],
  ['What is the difference between context and weights?', 'Context is rented: every call pays for its tokens, but it changes instantly and can be edited. Weights are owned: Mubit trains them from kept calls, they cost nothing per call, and they take hours to update.'],
  ['How does the router decide?', 'With a fixed policy over measured signals: the tokens a lesson adds to every call, its effect on probe outputs as judged blind, whether it is permanent, and whether it holds in every context. Each decision shows its reason on hover.'],
  ['What is a model, and what is a context?', 'A model is one fine-tuned Mubit adapter with one fixed system prompt. A context is one look the model serves, with its own lessons; all contexts of a model share its weights.'],
  ['Can I rename a model?', 'Its display name, yes, in its settings. Its task name is part of the system prompt Mubit uses to group calls into a task, so changing it would start a new task with no kept calls; it stays fixed.'],
  ['What does Mubit record?', 'Every call through its proxy. Previews, probes, judges and evaluations are recorded as metadata only; training calls are kept in full and may train the adapter.'],
  ['How is quality measured?', 'On held-out concepts the model never trained on: a blind judge scores style and recognisability from 1 to 5, alongside valid outputs, input tokens and seconds per call, for every configuration.'],
  ['Can I delete a model?', 'You can archive it: it leaves the sidebar and can be restored. Its file stays, and its Mubit task and kept calls stay on Mubit, which has no delete API.'],
  ['Which data should I send?', 'Synthetic or public data only. Mubit records request and reply content by default.'],
]

function Faq() {
  return (
    <Prose title="FAQ">
      <div className="faq">
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary><span className="grow">{q}</span><span className="chevron">+</span></summary>
            <p className="muted">{a}</p>
          </details>
        ))}
      </div>
    </Prose>
  )
}

function Privacy() {
  return (
    <Prose title="Privacy" lede="What Hone keeps, what Mubit keeps, and what stays in your browser.">
      <h2>Hone</h2>
      <p>Each model is a JSON file in the project folder: its contexts, lessons, outputs, training batches and evaluations. The team shares these files through a private repository.</p>
      <h2>Mubit</h2>
      <p>Every model call goes through the Mubit proxy, which records it. Previews, probes, judges and evaluations are sent with metadata-only recording; training calls are recorded in full so Mubit can train the adapter. Calls are answered by Anthropic models through Mubit. Send synthetic or public data only.</p>
      <h2>Your browser</h2>
      <p>The day or night choice is stored in this browser's local storage. There are no cookies, analytics or trackers.</p>
      <h2>Keys</h2>
      <p>The Mubit API key lives in the server's environment and is never sent to the browser or printed.</p>
    </Prose>
  )
}

const licences: [string, string, string][] = [
  ['React', 'MIT', 'interface'],
  ['Vite', 'MIT', 'build'],
  ['reicon-react', 'MIT', 'interface icons'],
  ['Figtree', 'OFL-1.1', 'titles'],
  ['Public Sans', 'OFL-1.1', 'text'],
  ['Michelangelus', 'Microsoft EULA', 'the Hone wordmark; installed per machine, never redistributed'],
  ['FastAPI', 'MIT', 'API'],
  ['Uvicorn', 'BSD-3-Clause', 'API server'],
  ['Anthropic Python SDK', 'Apache-2.0', 'calls through Mubit'],
  ['NumPy', 'BSD-3-Clause and others', 'scoring'],
  ['Pillow', 'MIT-CMU', 'rendering'],
  ['resvg_py', 'not declared in its package', 'rendering'],
  ['Lucide', 'ISC', 'reference set for the slop score; fetched at evaluation, not shipped'],
]

function License() {
  return (
    <Prose title="License" lede="Hone is released under the MIT License. © 2026 the Hone team.">
      <p>Permission is granted, free of charge, to use, copy, modify, merge, publish, distribute, sublicense and sell copies of the software, provided the copyright notice and this permission notice are included in all copies or substantial portions of it. The software is provided “as is”, without warranty of any kind. The full text is in the LICENSE file at the root of the repository.</p>
      <p>The Michelangelus wordmark font is not covered: it is Microsoft's, under its own licence, and is never redistributed with Hone.</p>
      <h2>Third-party software and type</h2>
      <table className="licences">
        <thead><tr><th>Component</th><th>Licence</th><th>Used for</th></tr></thead>
        <tbody>{licences.map(([name, licence, use]) => <tr key={name}><td>{name}</td><td>{licence}</td><td className="muted">{use}</td></tr>)}</tbody>
      </table>
      <p className="faint">Icons on the site are drawn by the models themselves, through Mubit.</p>
    </Prose>
  )
}

export function Footer() {
  const columns: [string, [string, () => void][]][] = [
    ['Product', [['My models', () => go(null)], ['About', () => goInfo('about')]]],
    ['Help', [['FAQ', () => goInfo('faq')]]],
    ['Legal', infoPages.filter((p) => p.id === 'privacy' || p.id === 'license').map((p) => [p.title, () => goInfo(p.id)])],
  ]
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="stack" style={{ gap: '0.375rem' }}>
          <span className="wordmark">Hone</span>
          <span className="faint">Rent what changes. Own what lasts.</span>
        </div>
        <nav className="footer-links">
          {columns.map(([title, links]) => (
            <div key={title} className="stack" style={{ gap: '0.5rem' }}>
              <span className="faint">{title}</span>
              {links.map(([label, onClick]) => <button key={label} onClick={onClick}>{label}</button>)}
            </div>
          ))}
        </nav>
      </div>
      <div className="footer-bottom faint">
        <span>© 2026 Hone</span>
        <span>Built at Night Shift London · Runs on Mubit</span>
      </div>
    </footer>
  )
}
