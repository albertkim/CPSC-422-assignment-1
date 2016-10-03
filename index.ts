interface Coordinate {
  x: number,
  y: number
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

enum CellType {
  TERMINAL,
  ONE_WALL,
  TWO_WALL,
  NON_TERMINAL
}

interface Cell {
  type: CellType,
  value: number
}

class Grid {

  public state: (number | null)[][]

  private correctProbility = 0.8
  private incorrectProability = 0.1

  constructor(state: (number | null)[][]) {
    this.state = state
  }

  private height(): number {
    return (this.state) ? this.state.length : 0
  }

  private width(): number {
    return (this.state && this.state.length > 0) ? this.state[0].length : 0
  }

  private get(coordinate: Coordinate) {
    return this.state[this.height() - coordinate.y][this.width() - coordinate.x]
  }

  private set(coordinate: Coordinate, value: number): void {

  }
  
  private getProbailityOfWallsAtPosition(coordinate: Coordinate, numberOfWalls: 1 | 2): number {
    if (coordinate.x === 3 && numberOfWalls === 1) {
      return 0.9
    }
    if (coordinate.x === 3 && numberOfWalls === 2) {
      return 0.1
    }
    if (coordinate.x !== 3 && numberOfWalls === 1) {
      return 0.1
    }
    if (coordinate.x !== 3 && numberOfWalls === 2) {
      return 0.9
    }
    else {
      throw new Error('Invalid coordinate/number of wall combination given')
    }
  }

  private checkDirection(coordinate: Coordinate, direction: Direction): boolean {
    if (coordinate.x === 1 && direction === Direction.LEFT) {
      return false
    }
    if (coordinate.x === this.width() && direction === Direction.RIGHT) {
      return false
    }
    if (coordinate.y === 1 && direction === Direction.DOWN) {
      return false
    }
    if (coordinate.y === this.height() && direction === Direction.UP) {
      return false
    }
    return true
  }

  private checkDirectionEndsAtState(startCoordinate: Coordinate, direction: Direction, endCoordinate: Direction) {

  }

  // Expected to check direction before calling this function
  private getBeliefInDirection(coordinate: Coordinate, direction: Direction): number | null {
    const xIncrement = (direction === Direction.RIGHT) ? 1 : -1
    const yIncrement = (direction === Direction.UP) ? 1 : -1
    const nextValue = this.get({
      x: coordinate.x + xIncrement,
      y: coordinate.y + yIncrement
    })
    return nextValue
  }

  private calculateNextBeliefValue(coordinate: Coordinate) {
    let currentUpBelief: number | null = null
    if (this.checkDirection(coordinate, Direction.UP)){
      currentUpBelief = this.getBeliefInDirection(coordinate, Direction.UP)
    }

    let currentDownBelief: number | null = null
    if (this.checkDirection(coordinate, Direction.DOWN)){
      currentDownBelief = this.getBeliefInDirection(coordinate, Direction.DOWN)
    }

    let currentLeftBelief: number | null = null
    if (this.checkDirection(coordinate, Direction.LEFT)){
      currentLeftBelief = this.getBeliefInDirection(coordinate, Direction.LEFT)
    }

    let currentRightBelief: number | null = null
    if (this.checkDirection(coordinate, Direction.RIGHT)){
      currentRightBelief = this.getBeliefInDirection(coordinate, Direction.RIGHT)
    }
  }

  public actionAndObservation(coordinate: Coordinate, direction: Direction, observation: number | null): void {
    // Iterate through every state
    // If a state can reach given coordinate with the given direction, note that state's current and transition probability
    // Combine all the numbers, update state

    this.normalize()
  }

  private normalize(): void {

  }

}

const UnknownPositionState = [
  [0.111, 0.111,  0.111,  0     ],
  [0.111, null,   0.111,  0     ],
  [0.111, 0.111,  0.111,  0.111 ]
]

const grid1 = new Grid(UnknownPositionState)
grid1.actionAndObservation({x: 1, y: 1}, Direction.UP, 2)
grid1.actionAndObservation({x: 1, y: 1}, Direction.UP, 2)
grid1.actionAndObservation({x: 1, y: 1}, Direction.UP, 2)
console.log(grid1)

const grid2 = new Grid(UnknownPositionState)
grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
console.log(grid2)

const KnownPositionState23 = [
  [0, 1,    0,  0],
  [0, null, 0,  0],
  [0, 0,    0,  0]
]

const grid3 = new Grid(KnownPositionState23)
grid3.actionAndObservation({x: 2, y: 3}, Direction.RIGHT, 1)
grid3.actionAndObservation({x: 2, y: 3}, Direction.RIGHT, 1)
grid3.actionAndObservation({x: 2, y: 3}, Direction.UP, null)
console.log(grid3)

const KnownPositionState11 = [
  [0, 0,    0,  0],
  [0, null, 0,  0],
  [1, 0,    0,  0]
]

const grid4 = new Grid(KnownPositionState11)
grid4.actionAndObservation({x: 1, y: 1}, Direction.UP, 2)
grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 2)
grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 1)
grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 1)
console.log(grid4)
