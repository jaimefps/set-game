import shuffle from "lodash/shuffle"
import { rerender, VanillaState } from "use-vanilla-state"

const colors = ["red", "green", "purple"] as const
const shapes = ["circle", "diamond", "tilde"] as const
const inners = ["stripe", "solid", "void"] as const
const nums = ["1", "2", "3"] as const

export type Colors = typeof colors[number]
export type Shapes = typeof shapes[number]
export type Inners = typeof inners[number]
export type Nums = typeof nums[number]

export type CardName = `${Colors}-${Shapes}-${Inners}-${Nums}`

function makeCards() {
  const cards = []
  for (const c of colors) {
    for (const s of shapes) {
      for (const i of inners) {
        for (const n of nums) {
          cards.push([c, s, i, n].join("-"))
        }
      }
    }
  }
  return cards as CardName[]
}

function allDifferent(attributes: string[]) {
  const [a, b, c] = attributes
  return a !== b && a !== c && b !== c
}

function allAreSame(attributes: string[]) {
  const [a, b, c] = attributes
  return a === b && b === c
}

function isValidSet(cards: CardName[]) {
  const inParts = cards.map((s) => s.split("-"))
  for (let i = 0; i < 4; i++) {
    const currParts = inParts.map((group) => group[i])
    const allDiff = allDifferent(currParts)
    const allSame = allAreSame(currParts)
    if (!allSame && !allDiff) return false
  }
  return true
}

export function findSet(list: CardName[]): number[] | null
export function findSet(list: CardName[], amount: "all"): [number[]]
export function findSet(list: CardName[], amount?: "all") {
  const sets = []
  for (let i = 0; i < list.length - 2; i++) {
    for (let j = i + 1; j < list.length - 1; j++) {
      for (let k = j + 1; k < list.length; k++) {
        const indexes = [i, j, k]
        const cards = indexes.map((idx) => list[idx])
        if (isValidSet(cards)) {
          if (!amount) {
            return indexes
          } else {
            sets.push(indexes)
          }
        }
      }
    }
  }
  return amount ? sets : null
}

export class GameState extends VanillaState {
  private board: CardName[] = []
  private computer: CardName[] = []
  private computerPoints = 0
  private deck: CardName[] = []
  private isOver = false
  private locked = false
  private player: CardName[] = []
  private playerMiss = 0
  private playerPoints = 0
  private refreshCount = 0

  constructor(rerender: any) {
    super(rerender)
    this.deck = shuffle(makeCards())
    this.board = this.deck.slice(0, 12)
    this.deck = this.deck.slice(12)

    while (!this.hasSetOnBoard()) {
      this.refresh()
    }
  }

  get state() {
    return {
      board: this.board,
      computer: this.computer,
      computerPoints: this.computerPoints,
      deck: this.deck,
      isOver: this.isOver,
      locked: this.locked,
      player: this.player,
      playerMiss: this.playerMiss,
      playerPoints: this.playerPoints,
      refreshCount: this.refreshCount,
    } as const
  }

  private hasSetOnBoard() {
    return findSet(this.board)
  }

  private hasSetInGame() {
    return findSet([...this.deck, ...this.board])
  }

  private reviewBoard() {
    const canMakeSet = this.hasSetInGame()
    if (!canMakeSet) {
      this.isOver = true
      this.locked = true
      this.player = []
      return
    }

    let shouldReload = !this.hasSetOnBoard()
    while (shouldReload) {
      // Avoid orphaned "player" selection if "computer"
      // takes cards and the player had some selected cards
      // while the board needs to get reset:
      this.player = []

      this.refresh()
      if (this.hasSetOnBoard()) {
        shouldReload = false
      }
    }
  }

  @rerender
  select(card: CardName) {
    // deselect if already selected
    if (this.player.includes(card)) {
      this.player = this.player.filter((c) => c !== card)
      return
    }

    if (this.player.length < 3) {
      this.player.push(card)
      if (this.player.length === 3) {
        if (isValidSet(this.player)) {
          this.playerPoints += 1
          this.board = this.board
            .map((c) => (this.player.includes(c) ? this.deck.pop() : c))
            .filter(Boolean) as CardName[]
        } else {
          this.playerMiss += 1
        }
        this.player = []
        this.reviewBoard()
      }
    }
  }

  @rerender
  computerMarkSet() {
    const indexes = findSet(this.board)
    if (!indexes) {
      return
    }

    this.computer = indexes.map((n) => this.board[n])
    this.player = this.player.filter((c) => !this.computer?.includes(c))
    this.computerPoints += 1
    this.locked = true
  }

  @rerender
  computerTakeSet() {
    if (isValidSet(this.computer)) {
      this.board = this.board
        .map((c) => (this.computer.includes(c) ? this.deck.pop() : c))
        .filter(Boolean) as CardName[]

      this.computer = []
      this.locked = false
      this.reviewBoard()
    }
  }

  @rerender
  refresh() {
    const cards = shuffle([...this.deck, ...this.board])
    this.board = cards.slice(0, 12)
    this.deck = cards.slice(12)
    this.refreshCount += 1
  }
}
