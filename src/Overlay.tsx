import React, { useEffect } from "react"
import { useCountdown } from "./hooks"
import { GameState } from "./GameState"

import reloadSrc from "./assets/reload.png"
import nopeSrc from "./assets/nope.png"
import setSrc from "./assets/set.png"
import tieSrc from "./assets/tie-game.png"
import youWinSrc from "./assets/you-win.png"
import youLoseSrc from "./assets/you-lose.png"
import computerTakeSrc from "./assets/computer-takes.png"

const Overlay: React.FC<{
  zIndex: number
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ zIndex, children, style = {} }) => {
  return (
    <div className="overlay" style={{ zIndex, ...style }}>
      {children}
    </div>
  )
}

export const OverlayNope: React.FC<{ game: GameState }> = ({ game }) => {
  const { playerMiss } = game.state

  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80,
  })

  useEffect(() => {
    if (playerMiss > 0) {
      restart()
    }
  }, [playerMiss, restart])

  return (
    <Overlay zIndex={1}>
      <img alt="nope" src={nopeSrc} style={{ opacity: count / 10 }} />
    </Overlay>
  )
}

export const OverlaySet: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80,
  })

  const { playerPoints } = game.state

  useEffect(() => {
    if (playerPoints > 0) {
      restart()
    }
  }, [playerPoints, restart])

  return (
    <Overlay zIndex={1}>
      <img alt="set" src={setSrc} style={{ opacity: count / 10 }} />
    </Overlay>
  )
}

export const OverlayComputerSet: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80,
  })

  const { computerPoints } = game.state

  useEffect(() => {
    if (computerPoints > 0) {
      restart()
    }
  }, [computerPoints, restart])

  return (
    <Overlay zIndex={1}>
      <img
        alt="computer-takes"
        src={computerTakeSrc}
        style={{ opacity: count / 10 }}
      />
    </Overlay>
  )
}

export const OverlayRefresh: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 175,
  })

  const { refreshCount } = game.state

  useEffect(() => {
    if (refreshCount > 0) {
      restart()
    }
  }, [refreshCount, restart])

  return (
    <Overlay zIndex={1}>
      <div className="refresh-alert" style={{ opacity: count / 10 }}>
        <img alt="reload" src={reloadSrc} />
      </div>
    </Overlay>
  )
}

export const OverlayGameOver: React.FC<{ game: GameState }> = ({ game }) => {
  if (!game.state.isOver) {
    return null
  }

  const tieGame = game.state.playerPoints === game.state.computerPoints
  const playerWins = game.state.playerPoints > game.state.computerPoints

  const alt = tieGame ? "tie-game" : playerWins ? "you-win" : "you-lose"
  const src = tieGame ? tieSrc : playerWins ? youWinSrc : youLoseSrc

  const style = tieGame
    ? {
        borderColor: "darkblue",
        backgroundColor: "lightblue",
      }
    : playerWins
    ? {
        borderColor: "darkgreen",
        backgroundColor: "lightgreen",
      }
    : {
        borderColor: "darkred",
        backgroundColor: "pink",
      }

  return (
    <Overlay zIndex={1}>
      <div className="game-over-alert" style={{ ...style }}>
        <img src={src} alt={alt} />
      </div>
    </Overlay>
  )
}
