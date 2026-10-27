import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { BlurFade } from './magicui/blur-fade'
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion()
  return reduced ? <>{children}</> : <BlurFade inView inViewMargin="0px" blur="0px" offset={10} duration={.3} delay={delay}>{children}</BlurFade>
}
