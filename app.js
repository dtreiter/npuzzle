let Puzzle = require('./Puzzle');
let Controls = require('./Controls');

let App = {
	controller: function() {
		// TODO Make puzzle a mithril component.
		// Create puzzle instance.
		let size = Number(m.route.param('size'));
		if (size < 3 || isNaN(size)) {
			size = 3;
		} else if (size > 5) {
			size = 5;
		}

		let initialState = m.route.param('state');
		if (initialState) {
			initialState = initialState.split(',');
		}

		let blind = Boolean(m.route.param('blind'));

		let puzzle = new Puzzle({
			$container: $('#puzzle'),
			size: size,
			blind: blind,
			initialState: initialState
		});

		return {
			puzzle: puzzle
		};
	},

	view: function(ctrl) {
		return m.component(Controls, {puzzle: ctrl.puzzle})
	}
};

module.exports = App;
