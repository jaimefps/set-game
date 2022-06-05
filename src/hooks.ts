import { useCallback, useEffect, useRef, useState } from "react"

export function usePrevious<V = any>(value: V): V | undefined {
  const ref = useRef()

  useEffect(() => {
    ref.current = value as any
  }, [value])

  return ref.current
}

export const useCountdown = ({
  to,
  from,
  speed
}: {
  to: number
  from: number
  speed: number
}) => {
  if (from <= to) {
    throw new Error('useCountdown: "to" must be less than "from"')
  }
  const [count, setCount] = useState(to)
  const restart = useCallback(() => setCount(from), [from])

  useEffect(() => {
    if (count > to) {
      const interval = setInterval(() => {
        setCount(count - 1)
      }, speed)
      return () => clearInterval(interval)
    }
  }, [count, to, speed])

  return {
    count,
    restart
  }
}
