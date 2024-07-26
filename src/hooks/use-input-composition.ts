import { useBoolean, useEventListener, useTargetElement } from '@shined/react-use'

import type { ElementTarget } from '@shined/react-use'

export function useInputComposition(target: ElementTarget<HTMLInputElement>) {
  const [isComposing, actions] = useBoolean(false)

  const el = useTargetElement(target)

  useEventListener(el, 'compositionstart', actions.setTrue)
  useEventListener(el, 'compositionend', actions.setFalse)

  return isComposing
}
