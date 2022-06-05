import React, { useEffect } from "react"
import { useCountdown, usePrevious } from "./hooks"
import { GameState } from "./GameState"

import reloadSrc from "./assets/reload.png"
import nopeSrc from "./assets/nope.png"
import setSrc from "./assets/set.png"
import tieSrc from "./assets/tie-game.png"
import youWinSrc from "./assets/you-win.png"
import youLoseSrc from "./assets/you-lose.png"
import computerTakeSrc from "./assets/computer-takes.png"

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
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80
  })

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
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80
  })

  const currPoints = game.state.playerPoints
  const prevPoints = usePrevious<typeof currPoints>(currPoints)

  useEffect(() => {
    if (currPoints > 0 && prevPoints !== currPoints) {
      restart()
    }
  }, [prevPoints, currPoints, restart])

  return (
    <Overlay zIndex={2}>
      <img alt="set" src={setSrc} style={{ opacity: count / 10 }} />
    </Overlay>
  )
}

export const OverLayComputerSet: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80
  })

  const currPoints = game.state.computerPoints
  const prevPoints = usePrevious<typeof currPoints>(currPoints)

  useEffect(() => {
    if (currPoints > 0 && prevPoints !== currPoints) {
      restart()
    }
  }, [prevPoints, currPoints, restart])

  return (
    <Overlay zIndex={2}>
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
    speed: 175
  })

  const currRefresh = game.state.refreshCount
  const prevRefresh = usePrevious<typeof currRefresh>(currRefresh) ?? 0

  useEffect(() => {
    if (prevRefresh < currRefresh) {
      restart()
    }
  }, [prevRefresh, currRefresh, restart])

  return (
    <Overlay zIndex={3}>
      <div
        style={{
          padding: 10,
          border: "4px solid purple",
          backgroundColor: "plum",
          borderRadius: 20,
          opacity: count / 10
        }}
      >
        <img alt="reload" src={reloadSrc} style={{ opacity: count / 10 }} />
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
        backgroundColor: "lightblue"
      }
    : playerWins
    ? {
        borderColor: "darkgreen",
        backgroundColor: "lightgreen"
      }
    : {
        borderColor: "darkred",
        backgroundColor: "pink"
      }

  return (
    <Overlay zIndex={4}>
      <div
        style={{
          padding: 10,
          border: "4px solid",
          borderRadius: 20,
          ...style
        }}
      >
        <img src={src} alt={alt} />
      </div>
    </Overlay>
  )
}
