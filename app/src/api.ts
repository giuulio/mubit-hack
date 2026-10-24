// Types and calls for the lesson router API (router/api.py).

export type Route = 'A' | 'A∧B' | 'B' | 'note' | 'rephrase'

// Where a lesson holds: only in the context it came from, or in every context of the model (the only kind the shared
// weights may learn).
export type Reach = 'context' | 'model'

export type Lesson = {
  id: string
  context: string
  reach?: Reach
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

export type Output = { id: string; context: string; concept: string; content: string | null; problems: string[]; input_tokens: number; output_tokens: number; runs: number; seconds: number; t: string }
export type Example = { id: string; lesson_id: string; context: string; concept: string; content: string }
export type EvalRow = { config: string; model?: string; n: number; valid: number; style: number | null; recognisable: number | null; input_tokens: number | null; runs_per_call: number | null; seconds: number | null }
// Which configuration should answer a context's calls: the cheapest rung of the ladder that holds up (router/serve.py).
export type ServingCheck = { config: string; status: 'pass' | 'fail' | 'missing'; style?: number; valid?: number; n?: number; input_tokens?: number | null }
export type Serving = { config: string; reason: string; reference: number; tolerance: number; checks: ServingCheck[] }
export type Evaluation = { id: string; t: string; context: string; concepts: string[]; rows: EvalRow[]; outputs: Record<string, { concept: string; content: string | null }[]>; serving?: Serving | null }
export type Batch = { batch: number; t: string; context: string; calls: number; valid: number; context_tokens: number; lessons_in_context?: string[] }
export type AdapterVersion = { version: string; status: string; note: string; t: string }
export type Compared = { content: string | null; problems: string[]; model: string; input_tokens: number | null; seconds: number | null }
export type Comparison = { id: string; t: string; context: string; group?: string; concept: string; outputs: Record<string, Compared> }

export type Project = {
  id: string
  name: string
  // `name` is in the model's fixed system prompt, so it is its Mubit task and never changes; `label` is what people see.
  label?: string
  domain: string
  model: string
  created?: string
  // A project file holds one model; its contexts share the model's system prompt, kept calls and adapter.
  contexts: ContextInfo[]
  archived?: string
  calls_per_day: number
  lessons: Lesson[]
  examples: Example[]
  outputs: Output[]
  context_history: { t: string; tokens: number; lessons_in_context: number; context: string }[]
  training: Batch[]
  adapters: AdapterVersion[]
  // Adapter outputs pasted from Try models, by context, then by configuration.
  imports: Record<string, Record<string, { concept: string; content: string | null }[]>>
  evals: Evaluation[]
  comparisons?: Comparison[]
}

export type ContextInfo = { id: string; name: string; created?: string; archived?: string }

export type ProjectSummary = { id: string; name: string; label: string; updated?: string; domain: string; contexts: ContextInfo[]; archived: string | null; lessons: number; examples: number; training_calls: number; adapter: AdapterVersion | null; samples: string[] }
// One piece of recent work on a model, for the home page.
export type Activity = { t: string; model: string; label: string; context: string; context_name: string | null; kind: 'lesson' | 'training' | 'adapter' | 'evaluation' | 'compare' | 'context'; text: string; route?: Route }

export type Job = { id: string; kind: string; status: 'running' | 'done' | 'failed'; error: string | null }

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail ?? res.statusText)
  return res.json()
}

// Calls that run in a context name it (`cid`); kept calls and adapter versions belong to the model.
export const api = {
  domains: () => call<string[]>('/domains'),
  projects: () => call<ProjectSummary[]>('/projects'),
  create: (name: string, domain: string, context: string) => call<Project>('/projects', { name, domain, context }),
  activity: (n = 12) => call<Activity[]>(`/activity?n=${n}`),
  setLabel: (id: string, label: string) => call<{ id: string; label: string }>(`/projects/${id}/label`, { label }),
  archive: (id: string, archived: boolean) => call<{ id: string; archived: string | null }>(`/projects/${id}/archive`, { archived }),
  editContext: (id: string, cid: string, change: { name?: string; archived?: boolean }) => call<ContextInfo>(`/projects/${id}/contexts/${cid}`, change),
  project: (id: string) => call<Project>(`/projects/${id}`),
  addContext: (id: string, name: string) => call<ContextInfo>(`/projects/${id}/contexts`, { name }),
  concepts: (id: string) => call<{ train: string[]; heldout: string[] }>(`/projects/${id}/concepts`),
  generate: (id: string, cid: string, concepts: string[]) => call<Output[]>(`/projects/${id}/generate`, { concepts, context: cid }),
  feedback: (id: string, cid: string, body: { signal: string; text?: string; output_id?: string; chosen_id?: string; rejected_id?: string }) =>
    call<Lesson[]>(`/projects/${id}/feedback`, { ...body, context: cid }),
  confirm: (id: string, lesson: string, stability: string, reach: Reach) => call<Lesson>(`/projects/${id}/lessons/${lesson}/confirm`, { stability, reach }),
  reject: (id: string, lesson: string) => call<Lesson>(`/projects/${id}/lessons/${lesson}/reject`, {}),
  train: (id: string, cid: string, count: number) => call<Job>(`/projects/${id}/train`, { count, context: cid }),
  evaluate: (id: string, cid: string, count: number) => call<Job>(`/projects/${id}/eval`, { count, context: cid }),
  job: (job: string) => call<Job>(`/jobs/${job}`),
  adapter: (id: string, version: string, status: string) => call(`/projects/${id}/adapters`, { version, status }),
  message: (id: string, cid: string, concept: string, mode: string, without?: string) =>
    call<{ message: string }>(`/projects/${id}/message?${new URLSearchParams({ concept, mode, context: cid, ...(without ? { without } : {}) })}`),
  importOutputs: (id: string, cid: string, config: string, items: { concept: string; content: string }[]) => call(`/projects/${id}/imports`, { config, items, context: cid }),
  absorb: (id: string, lesson: string, items: { concept: string; content: string }[]) => call<Lesson>(`/projects/${id}/lessons/${lesson}/absorption`, { items }),
  compareStyles: (id: string, concept: string) => call<Comparison[]>(`/projects/${id}/compare-styles`, { concept }),
  compare: (id: string, cid: string, concept: string) => call<Comparison>(`/projects/${id}/compare`, { concept, context: cid }),
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
