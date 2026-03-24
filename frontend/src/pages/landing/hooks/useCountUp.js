import { useEffect, useRef, useState } from 'react'

export function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(false)
  const raf = useRef(null)

  const activate = () => setActive(true)

  useEffect(() => {
    if (!active) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(end * eased))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [active, end, duration])

  return [count, activate]
}
