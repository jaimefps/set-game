import { useCallback, useEffect, useRef, useState } from "react"
import { GameState } from "./GameState"

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

export const useComputer = (game: GameState, wait: number) => {
  const { count: markerCount, restart: markerCountRestart } = useCountdown({
    to: 0,
    from: wait,
    speed: 1000
  })

  const { count: takerCount, restart: takerCountRestart } = useCountdown({
    to: 0,
    from: 1,
    speed: 1000
  })

  const skipped = useRef(false)
  const done = game.state.isOver

  // mark cards found by computer:
  useEffect(() => {
    if (skipped.current) {
      if (!done && markerCount === 0) {
        game.computerMarkSet()
        markerCountRestart()
        takerCountRestart()
      }
    } else {
      skipped.current = true
      markerCountRestart()
    }
  }, [markerCount, done, markerCountRestart, takerCountRestart, game])

  const currComp = game.state.computer
  const prevTakerCount = usePrevious(takerCount)

  // take cards marked by computer:
  useEffect(() => {
    if (currComp.length === 3 && prevTakerCount === 1 && takerCount === 0) {
      game.computerTakeSet()
    }
  }, [takerCount, currComp, prevTakerCount, game])

  return {
    count: markerCount
  }
}
