import { useAutoAnimate } from '@formkit/auto-animate/react'

export function useListAnimation() {
  const [ref] = useAutoAnimate({
    duration: 300,
    easing: 'ease-out',
  })

  return ref
}
