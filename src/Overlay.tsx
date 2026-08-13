import React, { useEffect } from "react"
import { useCountdown } from "./hooks"
import { GameState } from "./GameState"

// Transient feedback toast, faded out by a countdown. `count` runs
// 10 -> 0, driving both opacity and a small upward slide.
const Toast: React.FC<{
  kind: "good" | "bad" | "info" | "warn"
  count: number
  children: React.ReactNode
}> = ({ kind, count, children }) => {
  return (
    <div className="toast-layer">
      <div
        className={`toast toast-${kind}`}
        style={{
          opacity: count / 10,
          transform: `translateY(${(10 - count) * -2}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const OverlayNope: React.FC<{ game: GameState }> = ({ game }) => {
  const { playerMiss } = game.state
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })

  useEffect(() => {
    if (playerMiss > 0) restart()
  }, [playerMiss, restart])

  return (
    <Toast kind="bad" count={count}>
      not a set
    </Toast>
  )
}

export const OverlaySet: React.FC<{ game: GameState }> = ({ game }) => {
  const { playerPoints } = game.state
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })

  useEffect(() => {
    if (playerPoints > 0) restart()
  }, [playerPoints, restart])

  return (
    <Toast kind="good" count={count}>
      set! +1
    </Toast>
  )
}

export const OverlayComputerSet: React.FC<{ game: GameState }> = ({ game }) => {
  const { computerPoints } = game.state
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })

  useEffect(() => {
    if (computerPoints > 0) restart()
  }, [computerPoints, restart])

  return (
    <Toast kind="warn" count={count}>
      computer takes a set
    </Toast>
  )
}

export const OverlayRefresh: React.FC<{ game: GameState }> = ({ game }) => {
  const { refreshCount } = game.state
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 175 })

  useEffect(() => {
    if (refreshCount > 0) restart()
  }, [refreshCount, restart])

  return (
    <Toast kind="info" count={count}>
      no sets here — reshuffling
    </Toast>
  )
}

export const OverlayGameOver: React.FC<{
  game: GameState
  onRestart: () => void
}> = ({ game, onRestart }) => {
  const { isOver, playerPoints, computerPoints } = game.state
  if (!isOver) return null

  const tie = playerPoints === computerPoints
  const playerWins = playerPoints > computerPoints
  const title = tie ? "tie game" : playerWins ? "you win!" : "you lose"
  const kind = tie ? "tie" : playerWins ? "win" : "lose"

  return (
    <div className="gameover-layer">
      <div className={`gameover gameover-${kind}`}>
        <div className="gameover-title">{title}</div>
        <div className="gameover-score">
          you {playerPoints} — {computerPoints} computer
        </div>
        <button className="btn btn-primary" onClick={onRestart}>
          play again
        </button>
      </div>
    </div>
  )
}
