// global CSS
import { colorize, CLASS_NAME } from './colorize'

declare global {
  const unsafeWindow: Window
}

if (unsafeWindow) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(unsafeWindow as any)[CLASS_NAME] = colorize
}

const s = document.createElement('style')
s.innerHTML = `.${CLASS_NAME} {
  margin: 5px;
}`
document.head.append(s)
