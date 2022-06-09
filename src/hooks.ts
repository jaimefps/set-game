import { useCallback, useEffect, useState } from "react"
import { GameState } from "./GameState"

export const useCountdown = ({
  to,
  from,
  speed,
  start,
}: {
  to: number
  from: number
  speed: number
  start?: number
}) => {
  if (from <= to) {
    throw new Error('useCountdown: "to" must be less than "from"')
  }

  const [count, setCount] = useState(start ?? to)
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
    delay,
  }
}

export const useComputer = (game: GameState, wait: number) => {
  const {
    delay,
    count: markerCount,
    restart: markerCountRestart,
  } = useCountdown({
    to: 0,
    from: wait,
    start: wait,
    speed: 1000,
  })

  const { count: takerCount, restart: takerCountRestart } = useCountdown({
    to: 0,
    from: 1,
    speed: 1700,
  })

  const { isOver, computer, playerPoints, refreshCount } = game.state

  useEffect(() => {
    if (!isOver && markerCount === 0) {
      game.computerMarkSet()
      markerCountRestart()
      takerCountRestart()
    }
  }, [markerCount, isOver, markerCountRestart, takerCountRestart, game])

  useEffect(() => {
    if (computer.length === 3 && takerCount === 0) {
      game.computerTakeSet()
    }
  }, [takerCount, computer, game])

  useEffect(() => {
    if (playerPoints > 0) {
      delay(3)
    }
  }, [playerPoints, delay])

  useEffect(() => {
    if (refreshCount > 0) {
      markerCountRestart()
    }
  }, [markerCountRestart, refreshCount])

  return {
    count: markerCount,
  }
}
