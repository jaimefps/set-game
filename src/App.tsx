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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DevMode: React.FC<{ game: GameState }> = ({ game }) => {
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

const App: React.FC = () => {
  const game = useVanillaState(GameState)
  useComputer(game)

  return (
    <div className="app">
      <Counters game={game} />
      <Board game={game} />
      {/* <DevMode game={game} /> */}
    </div>
  )
}

export default App
