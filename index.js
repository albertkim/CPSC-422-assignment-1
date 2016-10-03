var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));
var CellType;
(function (CellType) {
    CellType[CellType["TERMINAL"] = 0] = "TERMINAL";
    CellType[CellType["ONE_WALL"] = 1] = "ONE_WALL";
    CellType[CellType["TWO_WALL"] = 2] = "TWO_WALL";
    CellType[CellType["NON_TERMINAL"] = 3] = "NON_TERMINAL";
})(CellType || (CellType = {}));
class Grid {
    constructor(givenState) {
        this.state = givenState;
    }
    height() {
        return (this.state) ? this.state.length : 0;
    }
    width() {
        return (this.state && this.state.length > 0) ? this.state[0].length : 0;
    }
    getCurrentProbabilityAtCoordinate(coordinate) {
        const currentProbability = this.state[coordinate.y][coordinate.x];
        if (currentProbability === null) {
            return null;
        }
        else {
            return currentProbability;
        }
    }
    setCurrentProbabilityAtCoordinate(coordinate, value) {
        this.state[coordinate.y][coordinate.x] = value;
    }
    getProbabilityOfWallsAtPosition(coordinate, numberOfWalls) {
        if (coordinate.x === 3 && numberOfWalls === 1) {
            return 0.9;
        }
        if (coordinate.x === 3 && numberOfWalls === 2) {
            return 0.1;
        }
        if (coordinate.x !== 3 && numberOfWalls === 1) {
            return 0.1;
        }
        if (coordinate.x !== 3 && numberOfWalls === 2) {
            return 0.9;
        }
        else {
            throw new Error('Invalid coordinate/number of wall combination given');
        }
    }
    checkDirection(coordinate, direction) {
        if (coordinate.x === 0 && direction === Direction.LEFT) {
            return false;
        }
        if (coordinate.x === this.width() - 1 && direction === Direction.RIGHT) {
            return false;
        }
        if (coordinate.y === 0 && direction === Direction.UP) {
            return false;
        }
        if (coordinate.y === this.height() - 1 && direction === Direction.DOWN) {
            return false;
        }
        const nextCoordinate = this.getCoordinateInDirection(coordinate, direction);
        if (this.getCurrentProbabilityAtCoordinate(nextCoordinate) === null) {
            return false;
        }
        return true;
    }
    // Expected to check direction before calling this function
    getCoordinateInDirection(coordinate, direction) {
        if (direction === Direction.LEFT || direction === Direction.RIGHT) {
            const xIncrement = (direction === Direction.RIGHT) ? 1 : -1;
            return {
                x: coordinate.x + xIncrement,
                y: coordinate.y
            };
        }
        else {
            const yIncrement = (direction === Direction.DOWN) ? 1 : -1;
            return {
                x: coordinate.x,
                y: coordinate.y + yIncrement
            };
        }
    }
    calculateNewCurrentStateForCoordinate(coordinate, direction, observation) {
        // If a state can reach given coordinate with the given direction, note that state's current and transition probability
        // Combine all the numbers, update state
        const adjacentStates = [];
        // Fidn adjacent state information for states that can reach given coordinate given direction to move
        if (direction === Direction.UP) {
            const canComeFromBottom = this.checkDirection(coordinate, Direction.DOWN);
            const canComeFromRight = this.checkDirection(coordinate, Direction.RIGHT);
            const canComeFromLeft = this.checkDirection(coordinate, Direction.LEFT);
            // Handle case where the previous state is self
            let selfTransitionProbability = 0;
            if (!canComeFromBottom) {
                selfTransitionProbability += 0.8;
            }
            if (!canComeFromLeft) {
                selfTransitionProbability += 0.1;
            }
            if (!canComeFromRight) {
                selfTransitionProbability += 0.1;
            }
            adjacentStates.push({
                coordinate: coordinate,
                transitionProbability: selfTransitionProbability,
                currentProbability: this.getCurrentProbabilityAtCoordinate(coordinate)
            });
            if (canComeFromBottom) {
                const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.DOWN);
                adjacentStates.push({
                    coordinate: fromCoordinate,
                    transitionProbability: 0.9,
                    currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate)
                });
            }
            if (canComeFromLeft) {
                const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.LEFT);
                adjacentStates.push({
                    coordinate: fromCoordinate,
                    transitionProbability: 0.1,
                    currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate)
                });
            }
            if (canComeFromRight) {
                const fromCoordinate = this.getCoordinateInDirection(coordinate, Direction.RIGHT);
                adjacentStates.push({
                    coordinate: fromCoordinate,
                    transitionProbability: 0.1,
                    currentProbability: this.getCurrentProbabilityAtCoordinate(fromCoordinate)
                });
            }
        }
        const probabilityOfWallsAtPosition = this.getProbabilityOfWallsAtPosition(coordinate, observation);
        let addedAdjacentProbabilities = 0.0;
        adjacentStates.forEach(adjacentState => {
            addedAdjacentProbabilities += (adjacentState.currentProbability) * (adjacentState.transitionProbability);
        });
        const newState = probabilityOfWallsAtPosition * addedAdjacentProbabilities;
        this.setCurrentProbabilityAtCoordinate(coordinate, newState);
    }
    actionAndObservation(coordinate, direction, observation) {
        // Call calculateNewCurrentStateForCoordinate for each state
        for (let y = 0; y < this.height(); y++) {
            for (let x = 0; x < this.width(); x++) {
                let value = this.state[y][x];
                if (value !== null) {
                    this.calculateNewCurrentStateForCoordinate({
                        x: x,
                        y: y
                    }, direction, observation);
                }
            }
        }
        this.normalize();
        console.log('Completed iteration + normalized');
        console.log(this);
    }
    sumAllCurrentProbabilities() {
        let total = 0;
        this.state.forEach(yRow => {
            yRow.forEach(x => {
                if (x !== null) {
                    total += x;
                }
            });
        });
        return total;
    }
    normalize() {
        const total = this.sumAllCurrentProbabilities();
        for (let y = 0; y < this.height(); y++) {
            let yRow = this.state[y];
            for (let x = 0; x < this.width(); x++) {
                let value = this.state[y][x];
                if (value !== null) {
                    this.setCurrentProbabilityAtCoordinate({ x: x, y: y }, value / total);
                }
            }
        }
    }
}
const UnknownPositionState = [
    [0.111, 0.111, 0.111, 0],
    [0.111, null, 0.111, 0],
    [0.111, 0.111, 0.111, 0.111]
];
const grid1 = new Grid(UnknownPositionState);
grid1.actionAndObservation({ x: 0, y: 2 }, Direction.UP, 2);
grid1.actionAndObservation({ x: 0, y: 2 }, Direction.UP, 2);
grid1.actionAndObservation({ x: 0, y: 2 }, Direction.UP, 2);
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
//# sourceMappingURL=index.js.map