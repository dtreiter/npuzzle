/*
 * Finds a solution using a simple BFS.
 */

let _findEmptyTile = (state) => {
	let emptyNum = state.length * state.length;
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

let _getPossibleMoves = (state) => {
	let moves = [];
	let empty = _findEmptyTile(state);
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

let _moveState = (move, state) => {
	let empty = _findEmptyTile(state);
	let emptyNum = state.length * state.length;
	let newState = state.map((row) => {
		return row.slice();
	});

	let moveNum = state[move.row][move.col];
	newState[empty.row][empty.col] = moveNum;
	newState[move.row][move.col] = emptyNum;

	return newState;
};

let _isStateSolved = (state) => {
	for (let row = 0; row < state.length; row++) {
		for (let col = 0; col < state.length; col++) {
			let num = row * state.length + col + 1;
			if (state[row][col] !== num) {
				return false;
			}
		}
	}

	return true;
};

let bfs = (initialState) => {
	let visited = {};
	visited[initialState] = true;
	let queue = [{
		state: initialState,
		path: []
	}];

	while (queue.length > 0) {
		let node = queue.shift();
		if (_isStateSolved(node.state)) {
			return node.path;
		}

		let possibleMoves = _getPossibleMoves(node.state);
		for (let move of possibleMoves) {
			let nextState = _moveState(move, node.state);
			if (nextState in visited) {
				continue;
			}

			visited[nextState] = true;
			let path = node.path.concat({row: move.row, col: move.col});

			queue.push({
				state: nextState,
				path: path
			});
		}
	}

	throw new Error('Unsolvable puzzle state!');
};

let solve = function(state) {
	return bfs(state);
};

module.exports = {
	solve: solve
};
