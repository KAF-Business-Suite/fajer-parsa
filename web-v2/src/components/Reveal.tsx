import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { BlurFade } from './magicui/blur-fade'
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  return reduced ? <>{children}</> : <BlurFade inView inViewMargin="0px" blur="3px" offset={8} delay={delay}>{children}</BlurFade>
}
