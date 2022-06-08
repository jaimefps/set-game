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
  const delay = useCallback((n: number) => setCount((c) => c + n), [])

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
    restart,
    delay
  }
}

export const useComputer = (game: GameState, wait: number) => {
  const {
    delay,
    count: markerCount,
    restart: markerCountRestart
  } = useCountdown({
    to: 0,
    from: wait,
    speed: 1000
  })

  const { count: takerCount, restart: takerCountRestart } = useCountdown({
    to: 0,
    from: 2,
    speed: 1000
  })

  const skipped = useRef(false)
  const done = game.state.isOver

  useEffect(() => {
    delay(3)
    // delay "computer" a few seconds
    // any time the player finds a set
  }, [game.state.playerPoints, delay])

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
