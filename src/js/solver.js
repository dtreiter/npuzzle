/*
 * Finds a solution using a simple BFS.
 */

function findEmptyTile(state) {
  const emptyNum = state.length * state.length;
  for (let row = 0; row < state.length; row++) {
    for (let col = 0; col < state.length; col++) {
      if (state[row][col] === emptyNum) {
        return {
          row: row,
          col: col,
        };
      }
    }
  }
};

function getPossibleMoves(state) {
  const moves = [];
  const empty = findEmptyTile(state);
  if (empty.row - 1 >= 0) {
    moves.push({
      row: empty.row - 1,
      col: empty.col
    });
  }
  if (empty.row + 1 < state.length) {
    moves.push({
      row: empty.row + 1,
      col: empty.col
    });
  }
  if (empty.col - 1 >= 0) {
    moves.push({
      row: empty.row,
      col: empty.col - 1
    });
  }
  if (empty.col + 1 < state.length) {
    moves.push({
      row: empty.row,
      col: empty.col + 1
    });
  }

  return moves;
};

function moveState(move, state) {
  const empty = findEmptyTile(state);
  const emptyNum = state.length * state.length;
  const newState = state.map((row) => {
    return row.slice();
  });

  const moveNum = state[move.row][move.col];
  newState[empty.row][empty.col] = moveNum;
  newState[move.row][move.col] = emptyNum;

  return newState;
};

function isStateSolved(state) {
  for (let row = 0; row < state.length; row++) {
    for (let col = 0; col < state.length; col++) {
      const num = row * state.length + col + 1;
      if (state[row][col] !== num) {
        return false;
      }
    }
  }

  return true;
};

export function bfs(initialState) {
  const visited = {};
  visited[initialState] = true;
  const queue = [{
    state: initialState,
    path: []
  }];

  while (queue.length > 0) {
    const node = queue.shift();
    if (isStateSolved(node.state)) {
      return node.path;
    }

    const possibleMoves = getPossibleMoves(node.state);
    for (let move of possibleMoves) {
      const nextState = moveState(move, node.state);
      if (nextState in visited) {
        continue;
      }

      visited[nextState] = true;
      const path = node.path.concat({row: move.row, col: move.col});

      queue.push({
        state: nextState,
        path: path
      });
    }
  }

  throw new Error('Unsolvable puzzle state!');
};

export function solve(state) {
  return bfs(state);
};
