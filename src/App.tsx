import React, { useEffect, useState } from "react"
import { CardName, Colors, GameState, Inners, Shapes } from "./GameState"
import { useVanillaState } from "use-vanilla-state"
import { useComputer, useCountdown } from "./hooks"
import { CardSymbol } from "./Symbol"
import {
  OverlaySet,
  OverlayNope,
  OverlayRefresh,
  OverlayGameOver,
  OverlayComputerSet,
} from "./Overlay"

const DIFFICULTY_MAP = {
  easy: 34,
  medium: 21,
  hard: 13,
  impossible: 2,
} as const

type Difficulty = keyof typeof DIFFICULTY_MAP

const DIFFICULTIES = Object.keys(DIFFICULTY_MAP) as Difficulty[]

type GameConfig = {
  ready: boolean
  difficulty: Difficulty
}

const Card: React.FC<{
  game: GameState
  name: CardName
}> = ({ game, name }) => {
  const [color, shape, inner, num] = name.split("-") as [
    Colors,
    Shapes,
    Inners,
    string
  ]

  const isSelected = game.state.player.includes(name)
  const isCompSelected = game.state.computer.includes(name)
  const className = [
    "card",
    isSelected && "selected",
    isCompSelected && "comp-selected",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      className={className}
      onClick={game.state.locked ? undefined : () => game.select(name)}
    >
      {[...Array(Number(num)).keys()].map((k) => (
        <CardSymbol key={k} color={color} shape={shape} inner={inner} />
      ))}
    </button>
  )
}

const Board: React.FC<{
  game: GameState
  onRestart: () => void
}> = ({ game, onRestart }) => {
  return (
    <div className="board">
      <OverlaySet game={game} />
      <OverlayNope game={game} />
      <OverlayRefresh game={game} />
      <OverlayComputerSet game={game} />
      <OverlayGameOver game={game} onRestart={onRestart} />
      {game.state.board.map((c) => (
        <Card key={c} name={c} game={game} />
      ))}
    </div>
  )
}

const Scoreboard: React.FC<{
  game: GameState
}> = ({ game }) => {
  const { deck, playerPoints, computerPoints } = game.state
  return (
    <div className="scoreboard">
      <div className="score-chip">
        <span className="score-label">deck</span>
        <span className="score-value">{deck.length}</span>
      </div>
      <div className="score-chip score-you">
        <span className="score-label">you</span>
        <span className="score-value">{playerPoints}</span>
      </div>
      <div className="score-chip score-cpu">
        <span className="score-label">computer</span>
        <span className="score-value">{computerPoints}</span>
      </div>
    </div>
  )
}

// "+3s" reward chip that fades in whenever the player scores.
const BonusTime: React.FC<{ game: GameState }> = ({ game }) => {
  const { playerPoints } = game.state
  const { count, restart } = useCountdown({ to: 0, from: 10, speed: 80 })

  useEffect(() => {
    if (playerPoints > 0) restart()
  }, [playerPoints, restart])

  return (
    <span className="bonus-time" style={{ opacity: count / 10 }}>
      +3s
    </span>
  )
}

const Logo: React.FC<{ size?: "small" | "large" }> = ({ size = "small" }) => {
  return (
    <div className={`logo logo-${size}`}>
      <span className="logo-red">S</span>
      <span className="logo-green">E</span>
      <span className="logo-purple">T</span>
    </div>
  )
}

const Game: React.FC<{
  config: GameConfig
  onChangeConfig: (c: GameConfig) => void
}> = ({ config: { difficulty }, onChangeConfig }) => {
  const game = useVanillaState(GameState)
  const { count } = useComputer(game, DIFFICULTY_MAP[difficulty])
  const restart = () => onChangeConfig({ ready: false, difficulty })
  const urgency = count <= 5 ? "danger" : count <= 10 ? "warning" : ""

  return (
    <div className="game">
      <header className="topbar">
        <Logo />
        <Scoreboard game={game} />
        <div className="topbar-right">
          <span className="difficulty-badge">{difficulty}</span>
          <button className="btn btn-quiet" onClick={restart}>
            new game
          </button>
        </div>
      </header>

      <div className={`cpu-timer ${urgency}`}>
        {game.state.isOver ? (
          <span>game over</span>
        ) : (
          <>
            <span>
              computer finds a set in <b>{count}s</b>
            </span>
            <BonusTime game={game} />
          </>
        )}
      </div>

      <Board game={game} onRestart={restart} />
    </div>
  )
}

const Settings: React.FC<{
  config: GameConfig
  onChange: (c: GameConfig) => void
}> = ({ config, onChange }) => {
  return (
    <div className="settings">
      <Logo size="large" />
      <div className="settings-symbols">
        <CardSymbol color="red" shape="tilde" inner="solid" />
        <CardSymbol color="green" shape="diamond" inner="stripe" />
        <CardSymbol color="purple" shape="circle" inner="void" />
      </div>
      <p className="settings-blurb">
        Find three cards where every feature — color, shape, fill, and count —
        is either all the same or all different. Beat the computer to it.
      </p>
      <div className="difficulty-picker">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`difficulty-option ${
              config.difficulty === d ? "active" : ""
            }`}
            onClick={() => onChange({ ...config, difficulty: d })}
          >
            {d}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-start"
        onClick={() => onChange({ ...config, ready: true })}
      >
        start game
      </button>
    </div>
  )
}

export const App: React.FC = () => {
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
    ready: false,
  })

  return (
    <div className="app">
      {config.ready ? (
        <Game config={config} onChangeConfig={setConfig} />
      ) : (
        <Settings config={config} onChange={setConfig} />
      )}
    </div>
  )
}
