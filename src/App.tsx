import React, { useEffect, useState } from "react"
import camelCase from "lodash/camelCase"
import { CardName, GameState, findSet } from "./GameState"
import { ImageMap, ImageMapKey } from "./ImageMap"
import { useVanillaState } from "use-vanilla-state"
import { useComputer, useCountdown, usePrevious } from "./hooks"
import extraTimeSrc from "./assets/extra-time.png"
import {
  OverlaySet,
  OverlayNope,
  OverlayRefresh,
  OverlayGameOver,
  OverlayComputerSet
} from "./Overlay"

const DIFFICULTY_MAP = {
  easy: 30,
  medium: 20,
  hard: 15
} as const

type Difficulty = keyof typeof DIFFICULTY_MAP

type GameConfig = {
  ready: boolean
  difficulty: Difficulty
}

const Card: React.FC<{ game: GameState; name: CardName }> = ({
  game,
  name
}) => {
  const imgCount = Number(name.slice(-1))
  const imgName = camelCase(name.slice(0, -2)) as ImageMapKey

  const isSelected = game.state.player.includes(name) ? "selected" : ""
  const isCompSelected = game.state.computer.includes(name)
    ? "comp-selected"
    : ""

  return (
    <div
      onClick={game.state.locked ? undefined : () => game.select(name)}
      className={`card ${isSelected} ${isCompSelected}`}
    >
      {[...Array(imgCount).keys()].map((k) => (
        <img
          key={k}
          alt={imgName}
          src={ImageMap[imgName]}
          className="card-icon"
        />
      ))}
    </div>
  )
}

const Board: React.FC<{ game: GameState }> = ({ game }) => {
  return (
    <div className="board">
      <OverlaySet game={game} />
      <OverlayNope game={game} />
      <OverlayRefresh game={game} />
      <OverlayGameOver game={game} />
      <OverlayComputerSet game={game} />
      {game.state.board.map((c) => {
        return <Card key={c} name={c} game={game} />
      })}
    </div>
  )
}

const Counters: React.FC<{ game: GameState }> = ({ game }) => {
  return (
    <div className="counters">
      <div className="points-container">
        <div className="points-name">deck</div>
        <div className="points-value">{game.state.deck.length}</div>
      </div>
      <div className="points-container">
        <div className="points-name">player</div>
        <div className="points-value">{game.state.playerPoints}</div>
      </div>
      <div className="points-container">
        <div className="points-name">computer</div>
        <div className="points-value">{game.state.computerPoints}</div>
      </div>
    </div>
  )
}

const Settings: React.FC<{
  config: GameConfig
  onChange: (c: GameConfig) => void
}> = ({ config, onChange }) => {
  return (
    <div className="settings">
      <div>
        <b>Game Settings</b>
      </div>
      <select
        className="difficulties"
        value={config.difficulty}
        onChange={(e) =>
          onChange({
            ...config,
            difficulty: e.target.value as Difficulty
          })
        }
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button
        className="cta"
        onClick={() =>
          onChange({
            ...config,
            ready: true
          })
        }
      >
        start
      </button>
    </div>
  )
}

const ExtraTime: React.FC<{ game: GameState }> = ({ game }) => {
  const { count, restart } = useCountdown({
    to: 0,
    from: 10,
    speed: 80
  })

  const { playerPoints } = game.state
  const prevPlayerPoints = usePrevious<number>(playerPoints)

  useEffect(() => {
    if (playerPoints > 0 && prevPlayerPoints !== playerPoints) {
      restart()
    }
  }, [prevPlayerPoints, playerPoints, restart])

  return (
    <img
      alt="extra-time"
      className="extra-time"
      src={extraTimeSrc}
      style={{ opacity: count / 10 }}
    />
  )
}

const Game: React.FC<{
  config: GameConfig
  onChangeConfig: (c: GameConfig) => void
}> = ({ config: { difficulty }, onChangeConfig }) => {
  const game = useVanillaState(GameState)
  const { count } = useComputer(game, DIFFICULTY_MAP[difficulty])

  return (
    <>
      <div className="computer-time">
        Computer will find a set in {count} seconds!
        <ExtraTime game={game} />
      </div>
      <Counters game={game} />
      <Board game={game} />
      <button
        className="cta"
        onClick={() =>
          onChangeConfig({
            ready: false,
            difficulty
          })
        }
      >
        restart
      </button>
      {/* <DevTools game={game} /> */}
    </>
  )
}

export const App: React.FC = () => {
  const [config, setConfig] = useState<GameConfig>({
    ready: false,
    difficulty: "easy"
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DevTools: React.FC<{ game: GameState }> = ({ game }) => {
  const [group, setGroup] = useState<any[] | null>(null)
  const { playerPoints, computerPoints, board } = game.state

  useEffect(() => {
    if (playerPoints > 0 || computerPoints > 0) {
      setGroup(null)
    }
  }, [playerPoints, computerPoints, setGroup])

  return (
    <div className="dev-tools">
      <button onClick={() => game.computerMarkSet()}>computer</button>
      <button onClick={() => game.refresh()}>refresh</button>
      <button
        onClick={() => {
          const group = findSet(board)?.map((x) => x + 1)
          setGroup(group ?? null)
        }}
      >
        find
      </button>
      <div>{JSON.stringify(group)}</div>
    </div>
  )
}
