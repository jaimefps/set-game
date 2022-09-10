import { useCallback, useEffect, useState } from "react"
import { findSet, GameState } from "./GameState"

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
  const restart = useCallback(
    (newCount?: number) => {
      setCount(newCount ?? from)
    },
    [from]
  )
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

const amounts: number[] = []
function getNextWait(setsNum: number, baseWait: number) {
  amounts.push(setsNum)
  console.log(`There will be ${setsNum} possible sets on the board.`)
  return setsNum < 5 ? 6 - setsNum + baseWait : baseWait
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

  if (isOver) {
    console.log(amounts.reduce((a, b) => a + b, 0) / amounts.length)
  }

  useEffect(() => {
    if (!isOver && markerCount === 0) {
      const { computer, deck, board } = game.state
      game.computerMarkSet()
      markerCountRestart(
        getNextWait(
          findSet(
            [
              ...board.filter((c) => !computer.includes(c)),
              ...deck.slice(deck.length - 3),
            ],
            "all"
          ).length,
          wait
        )
      )
      takerCountRestart()
    }
  }, [markerCount, isOver, markerCountRestart, takerCountRestart, game, wait])

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
    markerCountRestart(
      getNextWait(findSet(game.state.board, "all").length, wait)
    )
  }, [markerCountRestart, refreshCount, game, wait])

  return {
    count: markerCount,
  }
}
