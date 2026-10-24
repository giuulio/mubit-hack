// Motion for the loop: a routed lesson flies from the router's verdict to its destination card, which pulses when it lands.

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function pulse(el: Element, color: string) {
  const node = el as HTMLElement
  node.style.setProperty('--pulse', color)
  node.classList.remove('pulse')
  void node.offsetWidth // restart the animation when the same card is hit twice in a row
  node.classList.add('pulse')
}

export async function fly(from: Element, to: Element, label: string, color: string, ink: string, delay = 0): Promise<void> {
  if (still()) return pulse(to, color)
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const ghost = document.createElement('div')
  ghost.className = 'ghost'
  ghost.textContent = label
  ghost.style.background = color
  ghost.style.color = ink
  document.body.appendChild(ghost)
  const g = ghost.getBoundingClientRect()
  const x0 = a.left + a.width / 2 - g.width / 2
  const y0 = a.top + a.height / 2 - g.height / 2
  const x1 = b.left + 20
  const y1 = b.top + 18
  // Through a point above both ends, so the path reads as an arc rather than a slide.
  const mx = (x0 + x1) / 2
  const my = Math.min(y0, y1) - 48
  const animation = ghost.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(0.9)`, opacity: 0 },
    { transform: `translate(${x0}px, ${y0}px) scale(1.1)`, opacity: 1, offset: 0.15 },
    { transform: `translate(${mx}px, ${my}px) scale(1)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${x1}px, ${y1}px) scale(0.8)`, opacity: 0.2 },
  ], { duration: 950, delay, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'both' })
  await animation.finished.catch(() => undefined)
  ghost.remove()
  pulse(to, color)
}

export function shake(el: Element) {
  if (still()) return
  el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 400 })
}
