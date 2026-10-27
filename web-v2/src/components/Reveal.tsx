import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { BlurFade } from './magicui/blur-fade'
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?:string }) {
  const reduced = useReducedMotion()
  return reduced ? (className ? <div className={className}>{children}</div> : <>{children}</>) : <BlurFade className={className} inView inViewMargin="0px" blur="0px" offset={10} duration={.3} delay={delay}>{children}</BlurFade>
}
