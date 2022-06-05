import React, { useEffect } from "react"
import { useCountdown, usePrevious } from "./hooks"
import { GameState } from "./GameState"

import setSrc from "./assets/set.png"
import nopeSrc from "./assets/nope.png"
import reloadSrc from "./assets/reload.png"
import youWinSrc from "./assets/you-win.png"
import youLoseSrc from "./assets/you-lose.png"

const Overlay: React.FC<{ zIndex: number; children: React.ReactNode }> = ({
  zIndex,
  children
}) => {
  return (
    <div className="overlay" style={{ zIndex }}>
      {children}
    </div>
  )
}

export const OverLayNope: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })
  const misses = game.state.playerMiss
  useEffect(() => {
    if (misses > 0) {
      restart()
    }
  }, [misses, restart])
  return (
    <Overlay zIndex={1}>
      <img alt="nope" src={nopeSrc} style={{ opacity: count / 10 }} />
    </Overlay>
  )
}

export const OverLaySet: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })
  const currPoints = game.state.playerPoints
  const prevPoints = usePrevious<typeof currPoints>(currPoints)
  useEffect(() => {
    if (currPoints > 0 && prevPoints !== currPoints) {
      restart()
    }
  }, [prevPoints, currPoints, restart])
  return (
    <Overlay zIndex={2}>
      <img alt="set" src={setSrc} style={{ opacity: count / 10, width: 350 }} />
    </Overlay>
  )
}

export const OverlayRefresh: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 150 })
  const currRefresh = game.state.refreshCount
  const prevRefresh = usePrevious<typeof currRefresh>(currRefresh) ?? 0
  useEffect(() => {
    if (prevRefresh < currRefresh) {
      restart()
    }
  }, [prevRefresh, currRefresh, restart])
  return (
    <Overlay zIndex={3}>
      <img
        alt="reload"
        src={reloadSrc}
        style={{ opacity: count / 10, width: 400 }}
      />
    </Overlay>
  )
}

export const OverlayGameOver: React.FC<{ game: GameState }> = ({ game }) => {
  const done = game.state.isOver
  const playerWins = game.state.playerPoints > game.state.computerPoints
  if (!done) {
    return null
  }
  return (
    <Overlay zIndex={4}>
      <img
        alt={playerWins ? "you-win" : "you-lose"}
        src={playerWins ? youWinSrc : youLoseSrc}
        style={{ width: 400 }}
      />
    </Overlay>
  )
}
