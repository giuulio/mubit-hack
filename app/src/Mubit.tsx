// The Mubit strip: what Mubit holds for this project, kept current by polling the project. Mubit has no status API, so
// these are Hone's records: the model it proxies, calls kept for training, the adapter version from the console, and
// the last call through the proxy.
import type { Project } from './api'
import { clock } from './routes'
import { Count } from './ui'

export function MubitStrip({ project }: { project: Project }) {
  const kept = project.training.reduce((n, b) => n + b.calls, 0)
  const adapter = project.adapters.at(-1)
  const last = [
    project.outputs.at(-1)?.t, project.training.at(-1)?.t, project.evals.at(-1)?.t, project.comparisons?.at(-1)?.t,
  ].filter((t): t is string => Boolean(t)).sort().at(-1)

  return (
    <div className="strip">
      <span className="strip-brand" data-tip="Every call goes through the Mubit proxy"><i className="live" />Mubit</span>
      <span className="strip-item"><span className="faint">Base model</span>{project.model}</span>
      <span className="strip-item" data-tip={"Calls submitted with full recording; Mubit decides which are kept"}><span className="faint">Submitted</span><Count value={kept} /></span>
      <span className="strip-item"><span className="faint">Adapter record</span><span key={adapter?.version ?? '-'} className="flash">{adapter ? `${adapter.version} · ${adapter.status}` : '—'}</span></span>
      <span className="strip-item"><span className="faint">Last call</span><span key={last} className="flash">{clock(last)}</span></span>
    </div>
  )
}
