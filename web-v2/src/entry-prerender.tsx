import { renderToString } from 'react-dom/server'
import { MotionConfig } from 'motion/react'
import App from './App'
export { inboundSeo, inboundCanonical } from './inbound-route'

export function renderInbound() {
  return renderToString(<MotionConfig reducedMotion="always"><App initialPath="/inbound" /></MotionConfig>)
}
