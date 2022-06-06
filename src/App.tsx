import React, { useEffect, useState } from "react"
import camelCase from "lodash/camelCase"
import { CardName, GameState } from "./GameState"
import { ImageMap, ImageMapKey } from "./ImageMap"
import { useVanillaState } from "use-vanilla-state"
import { useComputer } from "./hooks"
import {
  OverLaySet,
  OverLayNope,
  OverlayRefresh,
  OverlayGameOver,
  OverLayComputerSet
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DevCTools: React.FC<{ game: GameState }> = ({ game }) => {
  const [group, setGroup] = useState<any[] | null>(null)
  const { playerPoints, computerPoints } = game.state

  useEffect(() => {
    if (playerPoints > 0 || computerPoints > 0) {
      setGroup(null)
    }
  }, [playerPoints, computerPoints, setGroup])

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={() => game.computerGrabSet()}>computer</button>
      <button onClick={() => game.refresh()}>refresh</button>
      <button
        onClick={() => {
          const group = game.findSet(game.state.board)?.map((x) => x + 1)
          setGroup(group ?? null)
        }}
      >
        find
      </button>
      <div>{JSON.stringify(group)}</div>
    </div>
  )
}

const Card: React.FC<{ game: GameState; name: CardName }> = ({
  game,
  name
}) => {
  const imgCount = Number(name.slice(-1))
  const imgName = camelCase(name.slice(0, -2)) as ImageMapKey
  const isSelected = game.state.player.includes(name)

  return (
    <div
      onClick={() => game.select(name)}
      className={`card ${isSelected ? "selected" : ""}`}
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
      <OverLaySet game={game} />
      <OverLayNope game={game} />
      <OverlayRefresh game={game} />
      <OverlayGameOver game={game} />
      <OverLayComputerSet game={game} />
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 15
      }}
    >
      <div style={{ fontWeight: "bold" }}>Game Settings</div>
      <select
        value={config.difficulty}
        onChange={(e) =>
          onChange({
            ...config,
            difficulty: e.target.value as Difficulty
          })
        }
      >
        <option value="easy">Easy (30 secs)</option>
        <option value="medium">Medium (20 secs)</option>
        <option value="hard">Hard (15 secs)</option>
      </select>
      <button
        style={{ padding: "0px 25px" }}
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

const Game: React.FC<{
  config: GameConfig
  onChangeConfig: (c: GameConfig) => void
}> = ({ config: { difficulty }, onChangeConfig }) => {
  const game = useVanillaState(GameState)
  const wait = DIFFICULTY_MAP[difficulty]
  const { count } = useComputer(game, wait)

  return (
    <>
      <div>computer will find a set in {count} seconds!</div>
      <Counters game={game} />
      <Board game={game} />
      <button
        style={{ padding: "0px 15px" }}
        onClick={() =>
          onChangeConfig({
            ready: false,
            difficulty
          })
        }
      >
        restart
      </button>
      {/* <DevCTools game={game} /> */}
    </>
  )
}

const App: React.FC = () => {
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

export default App
