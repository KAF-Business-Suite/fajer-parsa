import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { BlurFade } from './magicui/blur-fade'
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  return reduced ? <>{children}</> : <BlurFade inView inViewMargin="0px" blur="4px" offset={16} duration={.55} delay={delay}>{children}</BlurFade>
}
