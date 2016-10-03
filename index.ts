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

interface AdjacentStateInfo {
  coordinate: Coordinate,
  transitionProbability: number,
  currentProbability: number
}

class Grid {

  public state: (number | null)[][]

  constructor(givenState: (number | null)[][]) {
    this.state = givenState
  }

  private height(): number {
    return (this.state) ? this.state.length : 0
  }

  private width(): number {
    return (this.state && this.state.length > 0) ? this.state[0].length : 0
  }

  private getCurrentProbabilityAtCoordinate(coordinate: Coordinate): number | null {
    const currentProbability = this.state[coordinate.y][coordinate.x]
    if (currentProbability === null) {
      return null
    } else {
      return currentProbability
    }
  }

  private setCurrentProbabilityAtCoordinate(coordinate: Coordinate, value: number): void {
    this.state[coordinate.y][coordinate.x] = value
  }
  
  private getProbabilityOfWallsAtPosition(coordinate: Coordinate, numberOfWalls: 1 | 2): number {
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
    if (coordinate.x === 0 && direction === Direction.LEFT) {
      return false
    }
    if (coordinate.x === this.width() - 1 && direction === Direction.RIGHT) {
      return false
    }
    if (coordinate.y === 0 && direction === Direction.UP) {
      return false
    }
    if (coordinate.y === this.height() - 1 && direction === Direction.DOWN) {
      return false
    }
    const nextCoordinate = this.getCoordinateInDirection(coordinate, direction)
    if (this.getCurrentProbabilityAtCoordinate(nextCoordinate) === null) {
      return false
    } 
    return true
  }

  // Expected to check direction before calling this function
  private getCoordinateInDirection(coordinate: Coordinate, direction: Direction): Coordinate {
    if (direction === Direction.LEFT || direction === Direction.RIGHT) {
      const xIncrement = (direction === Direction.RIGHT) ? 1 : -1
      return {
        x: coordinate.x + xIncrement,
        y: coordinate.y
      }
    } else {
      const yIncrement = (direction === Direction.DOWN) ? 1 : -1
      return {
        x: coordinate.x,
        y: coordinate.y + yIncrement
      }
    }
  }

  private calculateNewCurrentStateForCoordinate(coordinate: Coordinate, direction: Direction, observation: 1| 2): void {
    // If a state can reach given coordinate with the given direction, note that state's current and transition probability
    // Combine all the numbers, update state

    const adjacentStates: AdjacentStateInfo[] = []

    // Fidn adjacent state information for states that can reach given coordinate given direction to move
    if (direction === Direction.UP) {
      if (this.checkDirection(coordinate, Direction.DOWN)) {
        const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.DOWN)
        adjacentStates.push({
          coordinate: fromCoordinate,
          transitionProbability: 0.9,
          currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate) as number
        })
      }
      if (this.checkDirection(coordinate, Direction.LEFT)) {
        const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.LEFT)
        adjacentStates.push({
          coordinate: fromCoordinate,
          transitionProbability: 0.1,
          currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate) as number
        })
      }
      if (this.checkDirection(coordinate, Direction.RIGHT)) {
        const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.RIGHT)
        adjacentStates.push({
          coordinate: fromCoordinate,
          transitionProbability: 0.1,
          currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate) as number
        })
      }
    }

    const probabilityOfWallsAtPosition = this.getProbabilityOfWallsAtPosition(coordinate, observation)
    let addedAdjacentProbabilities = 0.0
    adjacentStates.forEach(adjacentState => {
      addedAdjacentProbabilities += (adjacentState.currentProbability) * (adjacentState.transitionProbability)
    })
    const newState = probabilityOfWallsAtPosition * addedAdjacentProbabilities
    this.setCurrentProbabilityAtCoordinate(coordinate, newState)
  }

  public actionAndObservation(coordinate: Coordinate, direction: Direction, observation: 1 | 2): void {
    // Call calculateNewCurrentStateForCoordinate for each state
    for(let y = 0; y < this.height(); y++) {
      for(let x = 0; x < this.width(); x++) {
        let value = this.state[y][x]
        if (value !== null) {
          this.calculateNewCurrentStateForCoordinate({
            x: x,
            y: y  
          }, direction, observation)
        }
      }
    }

    this.normalize()

    console.log('Completed iteration + normalized')
    console.log(this)
  }

  private sumAllCurrentProbabilities(): number {
    let total = 0
    this.state.forEach(yRow => {
      yRow.forEach(x => {
        if (x !== null) {
          total += x
        }
      })
    })
    return total
  }

  private normalize(): void {
    const total = this.sumAllCurrentProbabilities()
    for(let y = 0; y < this.height(); y++) {
      let yRow = this.state[y]
      for(let x = 0; x < this.width(); x++) {
        let value = this.state[y][x]
        if (value !== null) {
          this.setCurrentProbabilityAtCoordinate({x: x, y: y}, value/total)
        }
      }
    }
  }

}

const UnknownPositionState = [
  [0.111, 0.111,  0.111,  0     ],
  [0.111, null,   0.111,  0     ],
  [0.111, 0.111,  0.111,  0.111 ]
]

const grid1 = new Grid(UnknownPositionState)
grid1.actionAndObservation({x: 0, y: 2}, Direction.UP, 2)
grid1.actionAndObservation({x: 0, y: 2}, Direction.UP, 2)
grid1.actionAndObservation({x: 0, y: 2}, Direction.UP, 2)

// const grid2 = new Grid(UnknownPositionState)
// grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
// grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
// grid2.actionAndObservation({x: 1, y: 1}, Direction.UP, 1)
// console.log(grid2)

// const KnownPositionState23 = [
//   [0, 1,    0,  0],
//   [0, null, 0,  0],
//   [0, 0,    0,  0]
// ]
// 
// const grid3 = new Grid(KnownPositionState23)
// grid3.actionAndObservation({x: 2, y: 3}, Direction.RIGHT, 1)
// grid3.actionAndObservation({x: 2, y: 3}, Direction.RIGHT, 1)
// grid3.actionAndObservation({x: 2, y: 3}, Direction.UP, null)
// console.log(grid3)
// 
// const KnownPositionState11 = [
//   [0, 0,    0,  0],
//   [0, null, 0,  0],
//   [1, 0,    0,  0]
// ]
// 
// const grid4 = new Grid(KnownPositionState11)
// grid4.actionAndObservation({x: 1, y: 1}, Direction.UP, 2)
// grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 2)
// grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 1)
// grid4.actionAndObservation({x: 1, y: 1}, Direction.RIGHT, 1)
// console.log(grid4)
