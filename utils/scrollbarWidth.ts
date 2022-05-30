// This will not work on Mac OS with the default "Only show scrollbars when scrolling" setting (Yosemite and up)
let scrollBarWidth: number

export default function (): number {
  if (scrollBarWidth !== undefined) {
    return scrollBarWidth
  }

  const outer = document.createElement('div')

  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  document.body.appendChild(outer)

  const inner = document.createElement('div')

  outer.appendChild(inner)
  scrollBarWidth = (outer.offsetWidth - inner.offsetWidth)
  outer.parentNode?.removeChild(outer)

  return scrollBarWidth
}
