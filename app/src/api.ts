// Types and calls for the lesson router API (router/api.py).

export type Route = 'A' | 'A∧B' | 'B' | 'note' | 'rephrase'

export type Lesson = {
  id: string
  statement: string
  scope: 'style' | 'family' | 'instance' | null
  expressible_as: 'parameter' | 'validator' | 'rule' | 'examples' | null
  parameter: { name: string; value: string } | null
  relation: string | null
  related_to: string | null
  status: 'pending' | 'active' | 'rejected' | 'superseded' | 'duplicate' | 'needs_rephrase'
  route: Route | null
  reason: string | null
  in_context: boolean
  signals: { tokens?: number; stability?: string; effect?: number | null }
  concept: string | null
  sources?: string[]
  feedback: string | null
  signal: string
  probe?: Probe
  absorption?: { share: number; n: number }
  retired?: string
  confirmed?: string
}

// The effect test: probe concepts drawn with and without the lesson; verdicts are numbered over the pairs where both parsed.
export type Probe = {
  probes?: string[]
  with?: (string | null)[]
  without?: (string | null)[]
  verdicts?: { pair: number; lesson_side: string; verdict: string | null }[]
}

export type Output = { id: string; concept: string; content: string | null; problems: string[]; input_tokens: number; output_tokens: number; runs: number; seconds: number; t: string }
export type Example = { id: string; lesson_id: string; concept: string; content: string }
export type EvalRow = { config: string; model?: string; n: number; valid: number; style: number | null; recognisable: number | null; input_tokens: number | null; runs_per_call: number | null; seconds: number | null }
export type Evaluation = { id: string; t: string; concepts: string[]; rows: EvalRow[]; outputs: Record<string, { concept: string; content: string | null }[]> }
export type Batch = { batch: number; t: string; calls: number; valid: number; context_tokens: number; lessons_in_context?: string[] }
export type AdapterVersion = { version: string; status: string; note: string; t: string }
export type Compared = { content: string | null; problems: string[]; model: string; input_tokens: number | null; seconds: number | null }
export type Comparison = { id: string; t: string; concept: string; outputs: Record<string, Compared> }

export type Project = {
  id: string
  name: string
  domain: string
  model: string
  calls_per_day: number
  lessons: Lesson[]
  examples: Example[]
  outputs: Output[]
  context_history: { t: string; tokens: number; lessons_in_context: number }[]
  training: Batch[]
  adapters: AdapterVersion[]
  imports: Record<string, { concept: string; content: string | null }[]>
  evals: Evaluation[]
  comparisons?: Comparison[]
}

export type ProjectSummary = { id: string; name: string; domain: string; lessons: number; examples: number; training_calls: number; adapter: AdapterVersion | null; samples: string[] }
export type Job = { id: string; kind: string; status: 'running' | 'done' | 'failed'; error: string | null }

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail ?? res.statusText)
  return res.json()
}

export const api = {
  domains: () => call<string[]>('/domains'),
  projects: () => call<ProjectSummary[]>('/projects'),
  create: (name: string, domain: string) => call<Project>('/projects', { name, domain }),
  project: (id: string) => call<Project>(`/projects/${id}`),
  concepts: (id: string) => call<{ train: string[]; heldout: string[] }>(`/projects/${id}/concepts`),
  generate: (id: string, concepts: string[]) => call<Output[]>(`/projects/${id}/generate`, { concepts }),
  feedback: (id: string, body: { signal: string; text?: string; output_id?: string; chosen_id?: string; rejected_id?: string }) => call<Lesson[]>(`/projects/${id}/feedback`, body),
  confirm: (id: string, lesson: string, stability: string) => call<Lesson>(`/projects/${id}/lessons/${lesson}/confirm`, { stability }),
  reject: (id: string, lesson: string) => call<Lesson>(`/projects/${id}/lessons/${lesson}/reject`, {}),
  train: (id: string, count: number) => call<Job>(`/projects/${id}/train`, { count }),
  evaluate: (id: string, count: number) => call<Job>(`/projects/${id}/eval`, { count }),
  job: (job: string) => call<Job>(`/jobs/${job}`),
  adapter: (id: string, version: string, status: string) => call(`/projects/${id}/adapters`, { version, status }),
  message: (id: string, concept: string, mode: string, without?: string) =>
    call<{ message: string }>(`/projects/${id}/message?${new URLSearchParams({ concept, mode, ...(without ? { without } : {}) })}`),
  importOutputs: (id: string, config: string, items: { concept: string; content: string }[]) => call(`/projects/${id}/imports`, { config, items }),
  absorb: (id: string, lesson: string, items: { concept: string; content: string }[]) => call<Lesson>(`/projects/${id}/lessons/${lesson}/absorption`, { items }),
  compare: (id: string, concept: string) => call<Comparison>(`/projects/${id}/compare`, { concept }),
  compareAdapter: (id: string, comparison: string, content: string) => call<Comparison>(`/projects/${id}/comparisons/${comparison}`, { config: 'adapter', content }),
}

// Wait for a background job (training, evaluation) to finish.
export async function waitFor(job: Job): Promise<Job> {
  let current = job
  while (current.status === 'running') {
    await new Promise((r) => setTimeout(r, 2000))
    current = await api.job(current.id)
  }
  if (current.status === 'failed') throw new Error(current.error ?? 'job failed')
  return current
}
